"use client";

import Link from "next/link";
import { Eye, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatTimestamp } from "@/lib/dates";
import type { Memory } from "@/types";

type MemoryCardProps = {
  memory: Memory;
  onDelete?: (memory: Memory) => void;
};

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const PrivacyIcon = memory.privacy === "public" ? Eye : Lock;

  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-ivory shadow-nocturne backdrop-blur">
      <Link href={`/memories/${memory.id}`}>
        <div className="aspect-[16/10] bg-white/5">
          {memory.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="h-full w-full object-cover"
              src={memory.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-dusk text-sm font-semibold text-ivory/35">
              No photo yet
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold capitalize text-ivory/60">
            <PrivacyIcon className="h-3.5 w-3.5" />
            {memory.privacy}
          </span>
          <span className="text-xs text-ivory/35">{formatTimestamp(memory.createdAt)}</span>
        </div>

        <Link href={`/memories/${memory.id}`}>
          <h3 className="line-clamp-2 font-serif text-base font-semibold text-ivory">
            {memory.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ivory/55">
            {memory.description}
          </p>
        </Link>

        {onDelete ? (
          <Button
            className="mt-4 w-full"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => onDelete(memory)}
            variant="danger"
          >
            Delete
          </Button>
        ) : null}
      </div>
    </article>
  );
}
