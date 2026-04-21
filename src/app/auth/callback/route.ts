import { NextResponse, type NextRequest } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { sanitizeRedirectPath } from "@/lib/auth/navigation";
import { ensureProfileForUser } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const isSupportedOtpType = (
  value: string | null,
): value is "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email" =>
  value === "signup" ||
  value === "invite" ||
  value === "magiclink" ||
  value === "recovery" ||
  value === "email_change" ||
  value === "email";

export async function GET(request: NextRequest) {
  const nextPath = sanitizeRedirectPath(
    request.nextUrl.searchParams.get("next") ?? "/account",
  );

  if (!hasSupabasePublicEnv()) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
  } else if (tokenHash && isSupportedOtpType(otpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });

    if (error) {
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("error", error.message);
      return NextResponse.redirect(url);
    }
  } else {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set(
      "error",
      "The confirmation link is missing required auth parameters.",
    );
    return NextResponse.redirect(url);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileForUser(user);
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
