"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/** Dev fallback user used when Supabase is unavailable */
const DEV_USER: User = {
  id: "dev-user-001",
  aud: "authenticated",
  role: "authenticated",
  email: "dev@meetingos.local",
  email_confirmed_at: new Date().toISOString(),
  phone: "",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: "email" },
  user_metadata: {
    name: "Dev User",
    avatar_url: "",
    email: "dev@meetingos.local",
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
  isDevMode: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch {
      setUser(DEV_USER);
      setIsDevMode(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      try {
        const supabase = createClient();

        // Check initial session
        const { data } = await supabase.auth.getUser();
        setUser(data.user);

        // Listen for auth changes
        const result = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });
        subscription = result.data.subscription;
      } catch {
        // Supabase unavailable — use dev fallback
        setUser(DEV_USER);
        setIsDevMode(true);
      }
      setLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Dev mode — just clear user
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, refreshUser, isDevMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
