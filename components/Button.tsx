import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-green-500 hover:bg-green-400 text-black font-medium disabled:opacity-50",
  secondary: "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 disabled:opacity-50",
  danger: "bg-red-500 hover:bg-red-400 text-white font-medium disabled:opacity-50",
  ghost: "text-zinc-400 hover:text-zinc-100 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-lg px-4 py-2 text-sm transition-colors",
        VARIANTS[variant],
        className
      )}
    />
  );
}
