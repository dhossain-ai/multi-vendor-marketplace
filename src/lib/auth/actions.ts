"use server";

import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { ensureProfileForUser } from "@/lib/auth/profile";
import { sanitizeRedirectPath } from "@/lib/auth/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authUnavailableMessage =
  "Supabase auth is not configured for this environment yet.";

const buildErrorPath = (path: string, message: string) =>
  `${path}?error=${encodeURIComponent(message)}`;

const buildSuccessPath = (path: string, message: string) =>
  `${path}?message=${encodeURIComponent(message)}`;

export async function signInAction(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect(buildErrorPath("/sign-in", authUnavailableMessage));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeRedirectPath(formData.get("next"));

  if (!email || !password) {
    redirect(buildErrorPath("/sign-in", "Email and password are required."));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(
      buildErrorPath(
        "/sign-in",
        error?.message ?? "Unable to sign in with those credentials.",
      ),
    );
  }

  await ensureProfileForUser(data.user);
  redirect(nextPath);
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect(buildErrorPath("/sign-up", authUnavailableMessage));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const nextPath = sanitizeRedirectPath(formData.get("next"));

  if (!email || !password) {
    redirect(buildErrorPath("/sign-up", "Email and password are required."));
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: fullName || undefined,
      },
    },
  });

  if (error) {
    redirect(buildErrorPath("/sign-up", error.message));
  }

  if (data.user) {
    await ensureProfileForUser(data.user);
  }

  if (data.session) {
    redirect(nextPath);
  }

  redirect(
    buildSuccessPath(
      "/sign-in",
      "Account created. Check your email to finish confirming your account.",
    ),
  );
}

export async function signOutAction() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
