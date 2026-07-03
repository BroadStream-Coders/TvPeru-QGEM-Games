"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
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

function initials(email: string) {
  const local = email.split("@")[0];
  const parts = local.split(/[.\-_]+/).filter(Boolean);
  const chars =
    parts.length >= 2
      ? [parts[0][0], parts[1][0]]
      : [local[0] ?? "", local[1] ?? ""];
  return chars.join("").toUpperCase();
}

function Avatar({
  url,
  email,
  className,
}: {
  url?: string;
  email: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-white/10",
          className,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-acc to-anim font-bold text-white ring-1 ring-white/10",
        className,
      )}
    >
      {initials(email)}
    </span>
  );
}

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    const signIn = () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });
    return (
      <button
        onClick={signIn}
        title="Iniciar sesión con Google"
        className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-panel transition-colors hover:border-acc"
      >
        <GoogleIcon />
      </button>
    );
  }

  const email = user.email ?? "usuario";
  const username = email.split("@")[0];
  const meta = user.user_metadata ?? {};
  const avatarUrl: string | undefined = meta.avatar_url ?? meta.picture;

  return (
    <div className="group/acct relative">
      <button className="flex h-6 items-center rounded-full border border-transparent p-0.5 transition-colors hover:border-line-2 hover:bg-elev">
        <Avatar url={avatarUrl} email={email} className="h-5 w-5 text-[10px]" />
      </button>

      {/* dropdown (CSS hover) — pt-2 hace de puente para no perder el hover */}
      <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity group-hover/acct:visible group-hover/acct:opacity-100">
        <div className="w-56 rounded-lg border border-line-2 bg-panel-2 p-1.5 shadow-2xl">
          <div className="flex items-center gap-2.5 px-2 pb-2 pt-1">
            <Avatar url={avatarUrl} email={email} className="h-8 w-8 text-xs" />
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-ink">
                {username}
              </div>
              <div className="truncate text-[10.5px] text-faint">{email}</div>
            </div>
          </div>
          <div className="mx-1 mb-1.5 h-px bg-line" />
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex h-[30px] w-full items-center gap-2.5 rounded-md px-2 text-[12.5px] text-[#e88f8f] hover:bg-elev"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
