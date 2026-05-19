import type { Severity } from "@/lib/supabase";

const MAP: Record<Severity, string> = {
  low: "bg-zinc-800 text-zinc-300",
  medium: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  high: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  critical: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export function SeverityBadge({ severity }: { severity: Severity | string }) {
  const cls = MAP[severity as Severity] ?? MAP.low;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {severity}
    </span>
  );
}
