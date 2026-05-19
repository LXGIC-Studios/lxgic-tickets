import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin, fmtTicketNum } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";

export const dynamic = "force-dynamic";
export const metadata = { title: "My tickets" };

interface MyTicket {
  id: string;
  ticket_number: number;
  title: string;
  status: string;
  severity: string;
  created_at: string;
  projects: { name: string; slug: string } | null;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default async function MyTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { data } = await supabaseAdmin()
    .from("tickets")
    .select("id,ticket_number,title,status,severity,created_at,projects(name,slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const all = (data as unknown as MyTicket[]) ?? [];

  const counts = {
    open: all.filter((t) => t.status === "open").length,
    in_progress: all.filter((t) => t.status === "in_progress").length,
    fix_deployed: all.filter((t) => t.status === "fix_deployed").length,
    resolved: all.filter((t) => t.status === "resolved").length,
  };

  const filter = sp.filter ?? "all";
  const tickets = all.filter((t) => {
    if (filter === "all") return true;
    if (filter === "open") return t.status === "open" || t.status === "in_progress";
    if (filter === "awaiting") return t.status === "fix_deployed";
    if (filter === "resolved") return t.status === "resolved";
    return true;
  });

  const chips = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "awaiting", label: "Awaiting Confirmation" },
    { id: "resolved", label: "Resolved" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My tickets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Signed in as {user.display_name ?? user.email}
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2 text-sm transition-colors"
        >
          File new
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Open" value={counts.open} />
        <StatCard label="In Progress" value={counts.in_progress} />
        <StatCard label="Fix to Test" value={counts.fix_deployed} accent />
        <StatCard label="Resolved" value={counts.resolved} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Link
            key={c.id}
            href={c.id === "all" ? "/my-tickets" : `/my-tickets?filter=${c.id}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === c.id
                ? "bg-green-500 text-black"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400 text-xs">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Title</th>
              <th className="text-left px-4 py-2.5 font-medium">Project</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">Severity</th>
              <th className="text-left px-4 py-2.5 font-medium">Age</th>
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
                <td className="px-4 py-3 text-zinc-500 font-mono">
                  {fmtTicketNum(t.ticket_number)}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/t/${t.ticket_number}`} className="hover:text-green-500 transition-colors">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{t.projects?.name ?? "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><SeverityBadge severity={t.severity} /></td>
                <td className="px-4 py-3 text-zinc-500">{relativeTime(t.created_at)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No tickets here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
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
