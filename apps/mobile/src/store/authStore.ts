import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/types/database";
import { supabase } from "@/services/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Tables<"users"> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Tables<"users"> | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
    }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => {
    supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  },
}));
