"use client";

import { LogOut } from "lucide-react";
import { supabase } from "@/helpers/supabase";
import { useAuth } from "@/hooks/use-auth";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
    />
  </svg>
);

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-medium hover:border-acc"
      >
        <GoogleIcon />
        Continuar con Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-[12rem] truncate text-sm text-dim">
        {user.email}
      </span>
      <button
        onClick={() => supabase.auth.signOut()}
        title="Cerrar sesión"
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel text-dim hover:border-acc hover:text-ink"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
