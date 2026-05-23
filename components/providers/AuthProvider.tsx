"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/users";
import type { UserProfile } from "@/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setProfile(null);
      return;
    }

    const nextProfile = await ensureUserProfile(auth.currentUser);
    setProfile(nextProfile);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!mounted) {
        return;
      }

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await ensureUserProfile(nextUser);
        if (mounted) {
          setProfile(nextProfile);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, logout, refreshProfile }),
    [user, profile, loading, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
