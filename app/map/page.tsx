"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  BookOpen,
  Compass,
  Loader2,
  LogIn,
  LogOut,
  Map,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { AddMemoryModal } from "@/components/memories/AddMemoryModal";
import { MemoryDetailModal } from "@/components/memories/MemoryDetailModal";
import { MemoryMap } from "@/components/map/MemoryMap";
import { useAuth } from "@/components/providers/AuthProvider";
import { useVisibleMemories } from "@/hooks/useMemories";
import { cn } from "@/lib/cn";
import { geocodeAddress } from "@/lib/geocoding";
import { userDisplayName } from "@/lib/users";
import type { MapLocationTarget, Memory } from "@/types";

const navItems = [
  { href: "/map", label: "Public Map", icon: Map },
  { href: "/profile", label: "Profile", icon: UserRound, protected: true },
  { href: "/settings", label: "Settings", icon: Settings, protected: true },
  { href: "/", label: "About", icon: BookOpen },
];

export default function MapPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, logout } = useAuth();
  const { memories, loading } = useVisibleMemories(user?.uid);
  const [addOpen, setAddOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchTarget, setSearchTarget] = useState<MapLocationTarget | null>(null);

  const selectedMemory =
    memories.find((memory) => memory.id === selectedMemoryId) ?? null;
  const privateCount = memories.filter((memory) => memory.privacy === "private").length;
  const publicCount = memories.length - privateCount;
  const displayName = profile?.displayName || userDisplayName(user);

  const handleAddMemory = () => {
    if (!user) {
      router.push("/login?next=/map");
      return;
    }

    setAddOpen(true);
  };

  const handleProtectedLink = (href: string) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }

    router.push(href);
  };

  const handleSelect = useCallback((memory: Memory) => {
    setSelectedMemoryId(memory.id);
  }, []);

  const handleAddressSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSearchError("");

    if (!addressQuery.trim()) {
      setSearchError("Enter an address to search.");
      return;
    }

    setSearchingAddress(true);

    try {
      const result = await geocodeAddress(addressQuery);
      setSearchTarget(result);
    } catch (error) {
      setSearchTarget(null);
      setSearchError(error instanceof Error ? error.message : "Address not found.");
    } finally {
      setSearchingAddress(false);
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-[#20262f]/95 text-white shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-xl font-semibold leading-none">
            A Place Of Our Own
          </span>
          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
            APOO
          </span>
        </Link>
        <button
          aria-label="Hide sidebar"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/65 transition hover:bg-white/10 hover:text-white md:flex"
          onClick={() => setSidebarOpen(false)}
          type="button"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
        <button
          aria-label="Close menu"
          className="rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white md:hidden"
          onClick={() => setMobileNavOpen(false)}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1 px-3 py-4">
        <button
          className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-semibold text-white transition hover:bg-white/10"
          onClick={handleAddMemory}
          type="button"
        >
          <Plus className="h-5 w-5" />
          New Memory
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.protected) {
            return (
              <button
                className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
                key={item.href}
                onClick={() => handleProtectedLink(item.href)}
                type="button"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          }

          return (
            <Link
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-semibold text-white/72 transition hover:bg-white/10 hover:text-white",
                item.href === "/map" && "bg-white/10 text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 px-4 py-4">
        {user ? (
          <>
            <div>
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-white/45">{user.email}</p>
            </div>
            <button
              className="flex min-h-10 w-full items-center gap-2 rounded-lg text-sm font-semibold text-white/65 transition hover:text-white"
              onClick={() => logout()}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white text-[#20262f] text-sm font-bold transition hover:bg-white/90"
              href="/login?next=/map"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
            <p className="text-xs leading-5 text-white/45">
              Explore public memories now. Sign in when you want to add your own.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="relative h-[100svh] overflow-hidden bg-[#d6e7f0] text-[#20262f]">
      <MemoryMap
        className="absolute inset-0 z-0 h-full min-h-0 rounded-none"
        memories={memories}
        onMemorySelect={handleSelect}
        searchTarget={searchTarget}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-56 transition-transform duration-300 md:block",
          !sidebarOpen && "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      {!sidebarOpen ? (
        <button
          aria-label="Show sidebar"
          className="fixed left-3 top-3 z-50 hidden h-11 w-11 items-center justify-center rounded-lg bg-[#20262f] text-white shadow-xl transition hover:bg-[#2d3541] md:flex"
          onClick={() => setSidebarOpen(true)}
          type="button"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      ) : null}

      <div
        className={cn(
          "fixed inset-0 z-[90] bg-black/35 transition md:hidden",
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[100] w-72 max-w-[86vw] transition-transform duration-300 md:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      <div
        className={cn(
          "fixed left-3 right-3 top-3 z-50 transition-[left] duration-300 md:right-6",
          sidebarOpen ? "md:left-60" : "md:left-16",
        )}
      >
        <form
          className="mx-auto flex max-w-2xl items-center gap-2"
          onSubmit={handleAddressSearch}
        >
          <button
            aria-label="Open menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#20262f] text-white shadow-xl md:hidden"
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>

          <label className="flex h-11 flex-1 items-center gap-3 rounded-lg border border-black/10 bg-[#20262f] pl-4 pr-1.5 text-white shadow-xl">
            <Search className="h-5 w-5 shrink-0 text-white/75" />
            <input
              aria-label="Search addresses"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/45"
              onChange={(event) => setAddressQuery(event.target.value)}
              placeholder="Search address in Bulgaria..."
              value={addressQuery}
            />
            <button
              aria-label="Go to address"
              className="inline-flex h-8 min-w-12 items-center justify-center rounded-md bg-white px-3 text-xs font-bold text-[#20262f] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/55"
              disabled={searchingAddress}
              type="submit"
            >
              {searchingAddress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Go"
              )}
            </button>
          </label>
        </form>
      </div>

      {(searchError || searchTarget) ? (
        <div
          className={cn(
            "fixed left-3 right-3 top-20 z-50 mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#20262f] shadow-xl transition-[left] duration-300 md:right-6",
            sidebarOpen ? "md:left-60" : "md:left-16",
          )}
        >
          <p className={cn("min-w-0 truncate", searchError && "text-red-700")}>
            {searchError || searchTarget?.label}
          </p>
          {searchTarget ? (
            <button
              aria-label="Clear searched address"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#20262f]/65 transition hover:bg-black/5 hover:text-[#20262f]"
              onClick={() => {
                setSearchTarget(null);
                setSearchError("");
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "fixed bottom-5 left-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 transition-[left] duration-300",
          sidebarOpen ? "md:left-[calc(50%+7rem)]" : "md:left-1/2",
        )}
      >
        <div className="flex items-center justify-between gap-3 rounded-[1.75rem] bg-[#20262f] px-4 py-3 text-white shadow-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Compass className="h-4 w-4 text-white/70" />
              Public Map
            </div>
            <p className="mt-1 truncate text-xs text-white/48">
              {loading || authLoading
                ? "Loading memories..."
                : `${publicCount} public${user ? `, ${privateCount} private` : ""}`}
            </p>
          </div>
          <button
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-[#20262f] transition hover:bg-white/90"
            onClick={handleAddMemory}
            type="button"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <AddMemoryModal
        onClose={() => setAddOpen(false)}
        onCreated={(memoryId) => setSelectedMemoryId(memoryId)}
        open={addOpen}
      />
      <MemoryDetailModal
        memory={selectedMemory}
        onClose={() => setSelectedMemoryId(null)}
        onDeleted={() => setSelectedMemoryId(null)}
      />
    </main>
  );
}
