import Link from "next/link";
import { supabaseAdmin, fmtTicketNum, type Ticket } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const sb = supabaseAdmin();
  const { data: tickets } = await sb
    .from("tickets")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(10);
  const list = (tickets as Ticket[]) ?? [];

  const { data: all } = await sb.from("tickets").select("status,fix_deployed_at");
  const rows = (all as { status: string; fix_deployed_at: string | null }[]) ?? [];

  const total = rows.length;
  const open = rows.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const awaiting = rows.filter((r) => r.status === "fix_deployed").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const autoFixedToday = rows.filter(
    (r) => r.fix_deployed_at && new Date(r.fix_deployed_at) >= today
  ).length;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total tickets" value={total} />
        <Stat label="Open" value={open} />
        <Stat label="Awaiting Confirmation" value={awaiting} accent />
        <Stat label="Auto-fixed today" value={autoFixedToday} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recent activity</h2>
      <div className="mt-3 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400 text-xs">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Title</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Severity</th>
              <th className="text-left px-4 py-2.5 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3 text-zinc-500 font-mono">{fmtTicketNum(t.ticket_number)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/tickets/${t.id}`} className="hover:text-green-500 transition-colors">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><SeverityBadge severity={t.severity} /></td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(t.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No tickets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-amber-500/30 bg-amber-500/5" : "border-zinc-800 bg-zinc-950/50"
      }`}
    >
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ? "text-amber-300" : ""}`}>{value}</div>
    </div>
  );
}
