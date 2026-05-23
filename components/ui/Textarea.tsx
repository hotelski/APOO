import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helper?: string;
};

export function Textarea({
  className,
  helper,
  id,
  label,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 w-full resize-y rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-clay focus:ring-4 focus:ring-clay/15",
          className,
        )}
        {...props}
      />
      {helper ? <span className="mt-2 block text-xs text-ink/55">{helper}</span> : null}
    </label>
  );
}
