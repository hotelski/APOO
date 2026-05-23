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
      <span className="mb-2 block text-sm font-semibold text-current">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-lg border border-white/15 bg-white/[0.92] px-4 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-ivory focus:ring-4 focus:ring-white/10 disabled:bg-white/55",
          className,
        )}
        {...props}
      />
      {helper ? <span className="mt-2 block text-xs text-current opacity-55">{helper}</span> : null}
    </label>
  );
}
