"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminProfile } from "@/lib/users";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useAuth();
  const router = useRouter();
  const isAdmin = isAdminProfile(profile);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/map");
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <main className="apoo-ambient flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-night/70 px-5 py-4 text-ivory shadow-nocturne backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-ivory">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ivory">Checking admin access</p>
            <p className="text-xs text-ivory/55">This area is only for admins.</p>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
