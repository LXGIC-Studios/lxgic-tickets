import type { Status } from "@/lib/supabase";

const MAP: Record<Status, { label: string; cls: string }> = {
  open: { label: "open", cls: "bg-zinc-800 text-zinc-100" },
  in_progress: { label: "in progress", cls: "bg-blue-500/15 text-blue-300 border border-blue-500/30" },
  fix_deployed: { label: "fix deployed", cls: "bg-amber-500/15 text-amber-300 border border-amber-500/40" },
  resolved: { label: "resolved", cls: "bg-green-500/15 text-green-300 border border-green-500/30" },
  wontfix: { label: "wontfix", cls: "bg-zinc-900 text-zinc-500 border border-zinc-800" },
  duplicate: { label: "duplicate", cls: "bg-purple-500/15 text-purple-300 border border-purple-500/30" },
};

export function StatusBadge({ status }: { status: Status | string }) {
  const m = MAP[status as Status] ?? MAP.open;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}
