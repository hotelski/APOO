"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/cn";
import { isAdminProfile, userDisplayName } from "@/lib/users";

const navItems = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdminProfile(profile),
  );

  return (
    <div className="min-h-screen bg-night pb-20 text-ivory md:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-night/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/map">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 font-serif text-sm font-bold text-ivory">
              A
            </span>
            <span>
              <span className="block font-serif text-sm font-bold uppercase leading-none tracking-[0.28em] text-ivory">
                APOO
              </span>
              <span className="block text-xs text-ivory/50">Your memories, mapped.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ivory/55 transition hover:bg-white/[0.08] hover:text-ivory",
                    active && "bg-white/10 text-ivory shadow-sm",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-ivory">
                {profile?.displayName || userDisplayName(user)}
              </p>
              <p className="text-xs text-ivory/40">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {children}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-night/95 px-2 py-2 backdrop-blur md:hidden">
        <div
          className="mx-auto grid max-w-md gap-1"
          style={{
            gridTemplateColumns: `repeat(${visibleNavItems.length}, minmax(0, 1fr))`,
          }}
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                  className={cn(
                  "flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-semibold text-ivory/50 transition",
                  active && "bg-white/10 text-ivory shadow-sm",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
