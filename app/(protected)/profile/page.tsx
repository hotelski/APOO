"use client";

import { useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { deleteMemory } from "@/lib/memories";
import { userDisplayName } from "@/lib/users";
import { useMyMemories } from "@/hooks/useMemories";
import type { Memory } from "@/types";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { memories, loading } = useMyMemories(user?.uid);
  const [deletingId, setDeletingId] = useState("");
  const publicCount = memories.filter((memory) => memory.privacy === "public").length;

  const handleDelete = async (memory: Memory) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm("Delete this memory permanently?");

    if (!confirmed) {
      return;
    }

    setDeletingId(memory.id);

    try {
      await deleteMemory(memory, user.uid);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.06] p-5 text-ivory shadow-nocturne backdrop-blur">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 font-serif text-xl font-bold text-ivory">
              {(profile?.displayName || userDisplayName(user)).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-ivory/40">
                Profile
              </p>
              <h1 className="mt-1 font-serif text-2xl font-semibold tracking-[0.08em] text-ivory">
                {profile?.displayName || userDisplayName(user)}
              </h1>
              <p className="text-sm text-ivory/45">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3 text-center">
              <p className="text-xl font-semibold text-ivory">{memories.length}</p>
              <p className="text-xs text-ivory/45">Memories</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3 text-center">
              <p className="text-xl font-semibold text-ivory">{publicCount}</p>
              <p className="text-xs text-ivory/45">Public</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3 text-center">
              <p className="text-xl font-semibold text-ivory">
                {memories.length - publicCount}
              </p>
              <p className="text-xs text-ivory/45">Private</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ivory">My memories</h2>
          <p className="text-sm text-ivory/45">Manage the places you have saved.</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-sm text-ivory/55 shadow-sm">
          Loading your memories...
        </div>
      ) : memories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-8 text-center">
          <MapPin className="mx-auto h-9 w-9 text-ivory/55" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-ivory">Your map is empty</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ivory/50">
            Add a memory from the map page and it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <div className="relative" key={memory.id}>
              <MemoryCard memory={memory} onDelete={handleDelete} />
              {deletingId === memory.id ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-night/75 text-sm font-semibold text-ivory backdrop-blur">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deleting...
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
