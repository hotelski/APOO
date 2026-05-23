"use client";

import { useCallback, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AddMemoryModal } from "@/components/memories/AddMemoryModal";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { MemoryDetailModal } from "@/components/memories/MemoryDetailModal";
import { MemoryMap } from "@/components/map/MemoryMap";
import { Button } from "@/components/ui/Button";
import { useVisibleMemories } from "@/hooks/useMemories";
import type { Memory } from "@/types";

export default function MapPage() {
  const { user } = useAuth();
  const { memories, loading } = useVisibleMemories(user?.uid);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const selectedMemory =
    memories.find((memory) => memory.id === selectedMemoryId) ?? null;

  const handleSelect = useCallback(
    (memory: Memory) => {
      setSelectedMemoryId(memory.id);
    },
    [],
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-ivory/40">
            Memory map
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[0.08em] text-ivory">
            Places worth returning to
          </h1>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
          Add memory
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-2 shadow-nocturne">
          <MemoryMap memories={memories} onMemorySelect={handleSelect} />
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-nocturne backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-semibold text-ivory">Visible memories</h2>
                <p className="text-sm text-ivory/50">
                  Public memories and your private places.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm font-semibold text-ivory/60">
                {memories.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 text-sm text-ivory/55 shadow-sm">
              Loading pins...
            </div>
          ) : memories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-5 text-center">
              <Search className="mx-auto h-8 w-8 text-ivory/55" />
              <h2 className="mt-3 font-serif font-semibold text-ivory">No memories yet</h2>
              <p className="mt-2 text-sm leading-6 text-ivory/50">
                Add your first memory to place it on the map.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[650px] gap-4 overflow-y-auto pr-1">
              {memories.slice(0, 8).map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          )}
        </aside>
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
