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
      <section className="mb-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-xl font-bold text-white">
              {(profile?.displayName || userDisplayName(user)).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-clay">Profile</p>
              <h1 className="text-2xl font-semibold tracking-normal text-ink">
                {profile?.displayName || userDisplayName(user)}
              </h1>
              <p className="text-sm text-ink/55">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-80">
            <div className="rounded-lg bg-paper p-3 text-center">
              <p className="text-xl font-semibold text-ink">{memories.length}</p>
              <p className="text-xs text-ink/55">Memories</p>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <p className="text-xl font-semibold text-ink">{publicCount}</p>
              <p className="text-xs text-ink/55">Public</p>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <p className="text-xl font-semibold text-ink">
                {memories.length - publicCount}
              </p>
              <p className="text-xs text-ink/55">Private</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">My memories</h2>
          <p className="text-sm text-ink/55">Manage the places you have saved.</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-sm text-ink/60 shadow-sm">
          Loading your memories...
        </div>
      ) : memories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-8 text-center">
          <MapPin className="mx-auto h-9 w-9 text-clay" />
          <h3 className="mt-3 text-lg font-semibold text-ink">Your map is empty</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
            Add a memory from the map page and it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <div className="relative" key={memory.id}>
              <MemoryCard memory={memory} onDelete={handleDelete} />
              {deletingId === memory.id ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/75 text-sm font-semibold text-ink backdrop-blur">
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
