"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/config/env";

export function AuthNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user) {
    return (
      <Link
        href="/account"
        className="bg-brand rounded-full px-4 py-2 text-sm font-medium text-white"
      >
        Account
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="border-border bg-panel text-ink-muted rounded-full border px-4 py-2 text-sm"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="bg-brand rounded-full px-4 py-2 text-sm font-medium text-white"
      >
        Sign up
      </Link>
    </div>
  );
}
