import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
};

export function Input({ className, helper, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-lg border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-clay focus:ring-4 focus:ring-clay/15",
          className,
        )}
        {...props}
      />
      {helper ? <span className="mt-2 block text-xs text-ink/55">{helper}</span> : null}
    </label>
  );
}
