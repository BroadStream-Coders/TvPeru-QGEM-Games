"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/helpers/supabase";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 py-12 text-ink font-sans">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Cuenta</h1>

        {user ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-panel p-4 text-sm">
              <p className="font-bold text-success">Sesión activa ✓</p>
              <p className="mt-1 text-dim">
                {user.email}
                <br />
                <span className="text-2xs break-all">{user.id}</span>
              </p>
            </div>
            <button
              onClick={signOut}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm hover:border-acc"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={signIn} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-acc"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contraseña"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-acc"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-line bg-acc-bg px-3 py-2 text-sm font-bold text-acc hover:border-acc disabled:opacity-40"
            >
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </form>
        )}

        <p className="text-2xs text-dim">
          Crea el usuario de prueba en Supabase → Authentication → Users → Add
          user (marca “Auto Confirm User”).
        </p>
      </div>
    </div>
  );
}
