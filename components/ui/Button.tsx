import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "light" | "glass";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink/90 focus-visible:ring-ink/30 disabled:bg-ink/45",
  secondary:
    "border border-ink/10 bg-white text-ink hover:border-ink/20 hover:bg-white/80 focus-visible:ring-clay/25",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 focus-visible:ring-clay/25",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/30 disabled:bg-red-600/45",
  light:
    "bg-white text-ink hover:bg-white/90 focus-visible:ring-white/30 disabled:bg-white/60",
  glass:
    "border border-white/25 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white/25 disabled:bg-white/5",
};

export function Button({
  children,
  className,
  icon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
