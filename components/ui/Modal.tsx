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
    <div className="fixed inset-0 z-[80] flex items-end bg-black/64 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <section
        aria-modal="true"
        className={cn(
          "max-h-[92svh] w-full overflow-y-auto rounded-t-lg border border-white/10 bg-night text-ivory shadow-nocturne sm:mx-auto sm:rounded-lg",
          wide ? "sm:max-w-4xl" : "sm:max-w-xl",
        )}
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-night/90 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="font-serif text-xl font-semibold uppercase tracking-[0.18em] text-ivory">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm text-ivory/55">{description}</p>
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
