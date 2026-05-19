import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 transition-colors",
        className
      )}
    />
  );
}
