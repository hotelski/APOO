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
      <span className="mb-2 block text-sm font-semibold text-current">{label}</span>
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 w-full resize-y rounded-lg border border-white/15 bg-white/[0.92] px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-ivory focus:ring-4 focus:ring-white/10",
          className,
        )}
        {...props}
      />
      {helper ? <span className="mt-2 block text-xs text-current opacity-55">{helper}</span> : null}
    </label>
  );
}
