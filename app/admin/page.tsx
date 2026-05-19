import Link from "next/link";
import { supabaseAdmin, fmtTicketNum, type Ticket } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const sb = supabaseAdmin();
  const { data: tickets } = await sb
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  const list = (tickets as Ticket[]) ?? [];

  const counts: Record<string, number> = {};
  const { data: all } = await sb.from("tickets").select("status");
  for (const r of (all as { status: string }[]) ?? []) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }

  const STATUSES = ["open", "in_progress", "resolved", "wontfix", "duplicate"];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <div
            key={s}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="text-xs text-zinc-500 capitalize">
              {s.replace("_", " ")}
            </div>
            <div className="text-2xl font-semibold mt-1">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-medium text-zinc-400 uppercase tracking-wide">
        Recent tickets
      </h2>
      <div className="mt-3 rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Severity</th>
              <th className="text-left px-4 py-2">Filed</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t border-zinc-900 hover:bg-zinc-950">
                <td className="px-4 py-2 text-zinc-500">{fmtTicketNum(t.ticket_number)}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/tickets/${t.id}`} className="hover:text-green-500">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">{t.severity}</td>
                <td className="px-4 py-2 text-zinc-500">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
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
