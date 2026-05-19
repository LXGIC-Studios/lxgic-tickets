import Link from "next/link";
import { supabaseAdmin, fmtTicketNum, type Ticket, type Project } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";

export const dynamic = "force-dynamic";

const STATUSES = ["open", "in_progress", "fix_deployed", "resolved", "wontfix", "duplicate"];
const SEVS = ["low", "medium", "high", "critical"];

export default async function AdminTickets({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; status?: string; severity?: string }>;
}) {
  const sp = await searchParams;
  const sb = supabaseAdmin();
  let q = sb.from("tickets").select("*").order("updated_at", { ascending: false });
  if (sp.project) q = q.eq("project_id", sp.project);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.severity) q = q.eq("severity", sp.severity);
  const { data } = await q;
  const tickets = (data as Ticket[]) ?? [];
  const { data: projs } = await sb.from("projects").select("*").order("name");
  const projects = (projs as Project[]) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>

      <form className="mt-5 flex flex-wrap gap-2 text-sm">
        <select
          name="project"
          defaultValue={sp.project ?? ""}
          className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          name="severity"
          defaultValue={sp.severity ?? ""}
          className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5"
        >
          <option value="">All severities</option>
          {SEVS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-1.5 transition-colors">
          Filter
        </button>
      </form>

      <div className="mt-5 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400 text-xs">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Title</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Severity</th>
              <th className="text-left px-4 py-2.5 font-medium">Reporter</th>
              <th className="text-left px-4 py-2.5 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className={`border-t border-zinc-900 hover:bg-zinc-900/50 transition-colors ${
                  t.status === "fix_deployed" ? "border-l-2 border-l-amber-500" : ""
                }`}
              >
                <td className="px-4 py-3 text-zinc-500 font-mono">{fmtTicketNum(t.ticket_number)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/tickets/${t.id}`} className="hover:text-green-500 transition-colors">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><SeverityBadge severity={t.severity} /></td>
                <td className="px-4 py-3 text-zinc-400">{t.reporter_name ?? "anon"}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(t.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
