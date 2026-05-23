"use client";

import { Eye, Lock, MapPin } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatTimestamp } from "@/lib/dates";
import type { Memory } from "@/types";

type MemoryGroupModalProps = {
  memories: Memory[];
  onClose: () => void;
  onSelect: (memory: Memory) => void;
  open: boolean;
};

export function MemoryGroupModal({
  memories,
  onClose,
  onSelect,
  open,
}: MemoryGroupModalProps) {
  return (
    <Modal
      description="Choose which memory to open."
      onClose={onClose}
      open={open}
      title={`${memories.length} memories here`}
    >
      <div className="space-y-3">
        {memories.map((memory) => {
          const PrivacyIcon = memory.privacy === "public" ? Eye : Lock;

          return (
            <button
              className="grid w-full gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 text-left transition hover:bg-white/[0.1] sm:grid-cols-[6.5rem_1fr]"
              key={memory.id}
              onClick={() => onSelect(memory)}
              type="button"
            >
              <span className="block aspect-[4/3] overflow-hidden rounded-lg bg-white/[0.06]">
                {memory.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={memory.imageUrl}
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs font-semibold text-ivory/35">
                    No photo
                  </span>
                )}
              </span>

              <span className="min-w-0">
                <span className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-xs font-semibold capitalize text-ivory/60">
                    <PrivacyIcon className="h-3.5 w-3.5" />
                    {memory.privacy}
                  </span>
                  <span className="text-xs text-ivory/35">
                    {formatTimestamp(memory.createdAt)}
                  </span>
                </span>
                <span className="block truncate font-serif text-lg font-semibold text-ivory">
                  {memory.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm leading-6 text-ivory/55">
                  {memory.description || "No description added yet."}
                </span>
                <span className="mt-2 flex items-center gap-1 text-xs text-ivory/35">
                  <MapPin className="h-3.5 w-3.5" />
                  {memory.latitude.toFixed(5)}, {memory.longitude.toFixed(5)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
