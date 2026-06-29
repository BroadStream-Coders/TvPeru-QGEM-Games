import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/helpers/supabase";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = create<AuthState>(() => ({
  user: null,
  loading: true,
}));

if (typeof window !== "undefined") {
  supabase.auth
    .getUser()
    .then(({ data }) => useAuth.setState({ user: data.user, loading: false }));
  supabase.auth.onAuthStateChange((_event, session) =>
    useAuth.setState({ user: session?.user ?? null, loading: false }),
  );
}
