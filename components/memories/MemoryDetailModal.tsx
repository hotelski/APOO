"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Eye,
  Flag,
  Lock,
  MapPin,
  MoreHorizontal,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteMemory, reportMemory } from "@/lib/memories";
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
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reporting, setReporting] = useState(false);
  const memoryId = memory?.id;

  useEffect(() => {
    if (!memoryId) {
      return;
    }

    setError("");
    setExpanded(false);
    setBookmarked(false);
    setReportOpen(false);
    setReportReason("");
    setReportSubmitted(false);
  }, [memoryId]);

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

  const handleReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("Log in to report this memory.");
      return;
    }

    if (reportReason.trim().length < 6) {
      setError("Add a brief reason for the report.");
      return;
    }

    setReporting(true);
    setError("");

    try {
      await reportMemory(memory.id, user.uid, reportReason);
      setReportSubmitted(true);
      setReportOpen(false);
      setReportReason("");
    } catch (reportError) {
      setError(
        reportError instanceof Error ? reportError.message : "Could not submit report.",
      );
    } finally {
      setReporting(false);
    }
  };

  const handleShare = async () => {
    const memoryUrl = `${window.location.origin}/memories/${memory.id}`;

    await navigator.clipboard?.writeText(memoryUrl).catch(() => undefined);
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-[75] mx-auto max-w-[22rem] sm:bottom-auto sm:top-32">
      <article className="relative rounded-lg border border-[#20262f] bg-[#f8f5ef] text-[#20262f] shadow-[0_18px_45px_rgba(20,24,31,0.24)]">
        <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-[#20262f] bg-[#f8f5ef]" />

        <button
          aria-label="Close memory"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-[#20262f]/55 transition hover:bg-black/5 hover:text-[#20262f]"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-3 pr-10">
          {memory.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="mb-3 max-h-28 w-full rounded-md object-cover"
              src={memory.imageUrl}
            />
          ) : null}

          <h2 className="line-clamp-2 font-serif text-[15px] font-semibold leading-5">
            {memory.title}
          </h2>
          <p
            className={
              expanded
                ? "mt-1 whitespace-pre-line text-[13px] leading-5 text-[#20262f]/78"
                : "mt-1 line-clamp-3 whitespace-pre-line text-[13px] leading-5 text-[#20262f]/78"
            }
          >
            {memory.description || "No description added yet."}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[#20262f]/55">
            <span className="inline-flex items-center gap-1 capitalize">
              <PrivacyIcon className="h-3.5 w-3.5" />
              {memory.privacy}
            </span>
            <span>{formatTimestamp(memory.createdAt)}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {memory.latitude.toFixed(4)}, {memory.longitude.toFixed(4)}
            </span>
          </div>
        </div>

        {error || reportSubmitted ? (
          <p className="mx-3 mb-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#20262f]/70">
            {error || "Report submitted."}
          </p>
        ) : null}

        {reportOpen && !isOwner ? (
          <form className="mx-3 mb-3 space-y-2" onSubmit={handleReport}>
            <textarea
              className="min-h-20 w-full resize-none rounded-md border border-[#20262f]/20 bg-white px-3 py-2 text-xs font-semibold text-[#20262f] outline-none placeholder:text-[#20262f]/35 focus:border-[#20262f]/55"
              onChange={(event) => setReportReason(event.target.value)}
              placeholder="What is wrong with this memory?"
              value={reportReason}
            />
            <button
              className="min-h-8 rounded-md bg-[#20262f] px-3 text-xs font-bold text-white transition hover:bg-[#2d3541] disabled:cursor-not-allowed disabled:opacity-55"
              disabled={reporting}
              type="submit"
            >
              {reporting ? "Sending..." : "Submit report"}
            </button>
          </form>
        ) : null}

        <div className="flex items-center justify-between border-t border-[#20262f]/15 px-3 py-2">
          <div className="flex items-center gap-1.5 text-[#20262f]/70">
            <button
              aria-label={bookmarked ? "Unsave memory" : "Save memory"}
              className={
                bookmarked
                  ? "flex h-8 w-8 items-center justify-center rounded-md bg-black/5 text-[#20262f] transition hover:bg-black/10"
                  : "flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-black/5 hover:text-[#20262f]"
              }
              onClick={() => setBookmarked((saved) => !saved)}
              type="button"
            >
              <Bookmark className={bookmarked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            </button>
            {!isOwner ? (
              <button
                aria-label="Report memory"
                className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-black/5 hover:text-[#20262f]"
                onClick={() => {
                  setError("");
                  setReportOpen((open) => !open);
                }}
                type="button"
              >
                <Flag className="h-4 w-4" />
              </button>
            ) : null}
            {isOwner ? (
              <button
                aria-label="Delete memory"
                className="flex h-8 w-8 items-center justify-center rounded-md text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 text-[#20262f]/70">
            <button
              aria-label="Copy memory link"
              className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-black/5 hover:text-[#20262f]"
              onClick={handleShare}
              type="button"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              aria-label="Toggle full memory text"
              className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-black/5 hover:text-[#20262f]"
              onClick={() => setExpanded((open) => !open)}
              type="button"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
