import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin, fmtTicketNum } from "@/lib/supabase";

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

export default async function MyTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { data } = await supabaseAdmin()
    .from("tickets")
    .select("id,ticket_number,title,status,severity,created_at,projects(name,slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const tickets = (data as unknown as MyTicket[]) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My tickets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Signed in as {user.display_name ?? user.email}
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:bg-green-400"
        >
          File new
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Project</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Severity</th>
              <th className="text-left px-4 py-2">Filed</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t border-zinc-900 hover:bg-zinc-950">
                <td className="px-4 py-2 text-zinc-500">{fmtTicketNum(t.ticket_number)}</td>
                <td className="px-4 py-2">
                  <Link href={`/t/${t.ticket_number}`} className="hover:text-green-500">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-400">{t.projects?.name ?? "-"}</td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">{t.severity}</td>
                <td className="px-4 py-2 text-zinc-500">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
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
