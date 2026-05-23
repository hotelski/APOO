"use client";

import { useState } from "react";
import { Eye, Lock, MapPin, Trash2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ReportMemoryForm } from "@/components/memories/ReportMemoryForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { deleteMemory } from "@/lib/memories";
import { formatTimestamp } from "@/lib/dates";
import type { Memory } from "@/types";

type MemoryDetailModalProps = {
  memory: Memory | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export function MemoryDetailModal({
  memory,
  onClose,
  onDeleted,
}: MemoryDetailModalProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!memory) {
    return null;
  }

  const isOwner = user?.uid === memory.userId;
  const PrivacyIcon = memory.privacy === "public" ? Eye : Lock;

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm("Delete this memory permanently?");

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteMemory(memory, user.uid);
      onDeleted?.();
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not delete memory.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal onClose={onClose} open={Boolean(memory)} title={memory.title} wide>
      <article className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          {memory.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="max-h-[520px] w-full object-cover"
              src={memory.imageUrl}
            />
          ) : (
            <div className="flex min-h-72 items-center justify-center bg-dusk text-ivory/35">
              No photo attached
            </div>
          )}

          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold capitalize text-ivory/60">
                <PrivacyIcon className="h-3.5 w-3.5" />
                {memory.privacy}
              </span>
              <span className="text-sm text-ivory/35">
                {formatTimestamp(memory.createdAt)}
              </span>
            </div>
            <p className="whitespace-pre-line text-base leading-8 text-ivory/65">
              {memory.description || "No description added yet."}
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ivory">
              <MapPin className="h-4 w-4 text-ivory/60" />
              Coordinates
            </p>
            <p className="mt-2 text-sm text-ivory/55">
              {memory.latitude.toFixed(5)}, {memory.longitude.toFixed(5)}
            </p>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isOwner ? (
            <Button
              className="w-full"
              disabled={deleting}
              icon={<Trash2 className="h-4 w-4" />}
              onClick={handleDelete}
              variant="danger"
            >
              {deleting ? "Deleting..." : "Delete memory"}
            </Button>
          ) : (
            <ReportMemoryForm memoryId={memory.id} />
          )}
        </aside>
      </article>
    </Modal>
  );
}
