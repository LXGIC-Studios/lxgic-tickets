import Link from "next/link";
import { supabaseAdmin, fmtTicketNum, type Ticket, type Project } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminTickets({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; status?: string; severity?: string }>;
}) {
  const sp = await searchParams;
  const sb = supabaseAdmin();
  let q = sb.from("tickets").select("*").order("created_at", { ascending: false });
  if (sp.project) q = q.eq("project_id", sp.project);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.severity) q = q.eq("severity", sp.severity);
  const { data } = await q;
  const tickets = (data as Ticket[]) ?? [];
  const { data: projs } = await sb.from("projects").select("*").order("name");
  const projects = (projs as Project[]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>

      <form className="mt-5 flex flex-wrap gap-2 text-sm">
        <select
          name="project"
          defaultValue={sp.project ?? ""}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1.5"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1.5"
        >
          <option value="">All statuses</option>
          {["open", "in_progress", "resolved", "wontfix", "duplicate"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          name="severity"
          defaultValue={sp.severity ?? ""}
          className="rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1.5"
        >
          <option value="">All severities</option>
          {["low", "medium", "high", "critical"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="rounded-md bg-zinc-800 px-3 py-1.5 hover:bg-zinc-700">
          Filter
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Severity</th>
              <th className="text-left px-4 py-2">Reporter</th>
              <th className="text-left px-4 py-2">Filed</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t border-zinc-900 hover:bg-zinc-950">
                <td className="px-4 py-2 text-zinc-500">{fmtTicketNum(t.ticket_number)}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/tickets/${t.id}`} className="hover:text-green-500">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">{t.severity}</td>
                <td className="px-4 py-2 text-zinc-400">{t.reporter_name ?? "anon"}</td>
                <td className="px-4 py-2 text-zinc-500">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
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
