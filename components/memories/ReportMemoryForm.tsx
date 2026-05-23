"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { reportMemory } from "@/lib/memories";

export function ReportMemoryForm({ memoryId }: { memoryId: string }) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (reason.trim().length < 6) {
      setError("Add a brief reason for the report.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await reportMemory(memoryId, user.uid, reason);
      setSubmitted(true);
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : "Could not submit report.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm text-ivory/70">
        Report submitted. Thank you for helping keep public memories respectful.
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Textarea
        label="Report this public memory"
        name="reason"
        onChange={(event) => setReason(event.target.value)}
        placeholder="Tell us what is wrong with this memory."
        value={reason}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button
        disabled={submitting}
        icon={<Flag className="h-4 w-4" />}
        type="submit"
        variant="secondary"
      >
        {submitting ? "Sending..." : "Submit report"}
      </Button>
    </form>
  );
}
