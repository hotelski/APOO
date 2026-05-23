"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AddMemoryModal } from "@/components/memories/AddMemoryModal";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { MemoryMap } from "@/components/map/MemoryMap";
import { Button } from "@/components/ui/Button";
import { useVisibleMemories } from "@/hooks/useMemories";
import type { Memory } from "@/types";

export default function MapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { memories, loading } = useVisibleMemories(user?.uid);
  const [addOpen, setAddOpen] = useState(false);

  const handleSelect = useCallback(
    (memory: Memory) => {
      router.push(`/memories/${memory.id}`);
    },
    [router],
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-clay">Memory map</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
            Places worth returning to
          </h1>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>
          Add memory
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="overflow-hidden rounded-lg border border-ink/10 bg-white p-2 shadow-soft">
          <MemoryMap memories={memories} onMemorySelect={handleSelect} />
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">Visible memories</h2>
                <p className="text-sm text-ink/55">
                  Public memories and your private places.
                </p>
              </div>
              <span className="rounded-full bg-paper px-3 py-1 text-sm font-semibold text-ink/60">
                {memories.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg border border-ink/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
              Loading pins...
            </div>
          ) : memories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-5 text-center">
              <Search className="mx-auto h-8 w-8 text-clay" />
              <h2 className="mt-3 font-semibold text-ink">No memories yet</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">
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
        onCreated={(memoryId) => router.push(`/memories/${memoryId}`)}
        open={addOpen}
      />
    </main>
  );
}
