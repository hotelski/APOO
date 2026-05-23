"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Lock, MapPin, Trash2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ReportMemoryForm } from "@/components/memories/ReportMemoryForm";
import { Button } from "@/components/ui/Button";
import { deleteMemory, getMemory } from "@/lib/memories";
import { formatTimestamp } from "@/lib/dates";
import type { Memory } from "@/types";

export function MemoryDetailPage({ memoryId }: { memoryId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;

    getMemory(memoryId)
      .then((nextMemory) => {
        if (mounted) {
          setMemory(nextMemory);
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Memory not found.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [memoryId]);

  const handleDelete = async () => {
    if (!memory || !user) {
      return;
    }

    const confirmed = window.confirm("Delete this memory permanently?");

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteMemory(memory, user.uid);
      router.replace("/profile");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not delete memory.",
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 text-sm text-ink/60 shadow-sm">
          Loading memory...
        </div>
      </main>
    );
  }

  if (!memory) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-ink">Memory unavailable</h1>
          <p className="mt-2 text-sm text-ink/60">
            This memory may have been deleted or is not visible to you.
          </p>
          <Link className="mt-5 inline-flex text-sm font-semibold text-clay" href="/map">
            Back to map
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = user?.uid === memory.userId;
  const isVisible = memory.privacy === "public" || isOwner;
  const PrivacyIcon = memory.privacy === "public" ? Eye : Lock;

  if (!isVisible) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-ink">Private memory</h1>
          <p className="mt-2 text-sm text-ink/60">
            Only the owner can view this memory.
          </p>
          <Link className="mt-5 inline-flex text-sm font-semibold text-clay" href="/map">
            Back to map
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-ink"
        href="/map"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to map
      </Link>

      <article className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        {memory.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="max-h-[520px] w-full object-cover" src={memory.imageUrl} />
        ) : (
          <div className="flex min-h-72 items-center justify-center bg-gradient-to-br from-blush/40 via-white to-moss/20 text-ink/45">
            No photo attached
          </div>
        )}

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-xs font-semibold capitalize text-ink/65">
                <PrivacyIcon className="h-3.5 w-3.5" />
                {memory.privacy}
              </span>
              <span className="text-sm text-ink/45">{formatTimestamp(memory.createdAt)}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-ink">
              {memory.title}
            </h1>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/72">
              {memory.description || "No description added yet."}
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg bg-paper p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin className="h-4 w-4 text-clay" />
                Coordinates
              </p>
              <p className="mt-2 text-sm text-ink/60">
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
            ) : null}

            {!isOwner && memory.privacy === "public" ? (
              <ReportMemoryForm memoryId={memory.id} />
            ) : null}
          </aside>
        </div>
      </article>
    </main>
  );
}
