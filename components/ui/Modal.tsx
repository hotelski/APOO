"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type ModalProps = {
  children: React.ReactNode;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
  wide?: boolean;
};

export function Modal({
  children,
  description,
  onClose,
  open,
  title,
  wide = false,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <section
        aria-modal="true"
        className={cn(
          "max-h-[92svh] w-full overflow-y-auto rounded-t-lg bg-paper shadow-soft sm:mx-auto sm:rounded-lg",
          wide ? "sm:max-w-4xl" : "sm:max-w-xl",
        )}
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-ink/10 bg-paper/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-ink/60">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Close"
            className="h-10 min-h-10 w-10 px-0"
            icon={<X className="h-4 w-4" />}
            onClick={onClose}
            variant="ghost"
          />
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
