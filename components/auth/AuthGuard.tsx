"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <main className="apoo-ambient flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-night/70 px-5 py-4 text-ivory shadow-nocturne backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-ivory">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ivory">Opening your map</p>
            <p className="text-xs text-ivory/55">Checking your session...</p>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
