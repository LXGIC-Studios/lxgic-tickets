import { notFound } from "next/navigation";
import {
  supabaseAdmin,
  fmtTicketNum,
  type Ticket,
  type TicketAttachment,
  type TicketReply,
  type Project,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-500/10 text-green-400 border-green-500/30",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  resolved: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  wontfix: "bg-red-500/10 text-red-400 border-red-500/30",
  duplicate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketNumber: string }>;
}) {
  const { ticketNumber } = await params;
  const num = parseInt(ticketNumber, 10);
  if (!num) notFound();

  const sb = supabaseAdmin();
  const { data: ticket } = await sb
    .from("tickets")
    .select("*")
    .eq("ticket_number", num)
    .maybeSingle();
  if (!ticket) notFound();
  const t = ticket as Ticket;

  const [{ data: proj }, { data: atts }, { data: reps }] = await Promise.all([
    sb.from("projects").select("*").eq("id", t.project_id).maybeSingle(),
    sb.from("ticket_attachments").select("*").eq("ticket_id", t.id).order("created_at"),
    sb
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", t.id)
      .order("created_at"),
  ]);
  const project = proj as Project | null;
  const attachments = (atts as TicketAttachment[]) ?? [];
  const replies = (reps as TicketReply[]) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500">{project?.name}</div>
          <h1 className="text-2xl font-semibold mt-1">
            <span className="text-zinc-500 mr-2">{fmtTicketNum(t.ticket_number)}</span>
            {t.title}
          </h1>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs ${
            STATUS_COLORS[t.status] ?? ""
          }`}
        >
          {t.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-2 flex gap-3 text-xs text-zinc-500">
        <span>severity: {t.severity}</span>
        <span>filed {new Date(t.created_at).toLocaleString()}</span>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5 whitespace-pre-wrap text-sm">
        {t.description}
      </div>

      {attachments.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {attachments.map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
              <img
                src={a.url}
                alt={a.filename ?? ""}
                className="rounded-md border border-zinc-800 w-full h-32 object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-sm font-medium text-zinc-400 uppercase tracking-wide">
        Replies
      </h2>
      <div className="mt-3 space-y-3">
        {replies.length === 0 && (
          <div className="text-sm text-zinc-500">No replies yet.</div>
        )}
        {replies.map((r) => (
          <div
            key={r.id}
            className={`rounded-md border p-4 text-sm ${
              r.is_admin
                ? "border-green-500/30 bg-green-500/5"
                : "border-zinc-800 bg-zinc-950"
            }`}
          >
            <div className="text-xs text-zinc-500 mb-1">
              {r.author} {r.is_admin && <span className="text-green-500">(team)</span>} ·{" "}
              {new Date(r.created_at).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{r.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
