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
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white/85 px-5 py-4 shadow-soft">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-white">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Opening your map</p>
            <p className="text-xs text-ink/60">Checking your session...</p>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
