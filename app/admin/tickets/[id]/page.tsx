import { notFound } from "next/navigation";
import Link from "next/link";
import {
  supabaseAdmin,
  fmtTicketNum,
  type Ticket,
  type TicketAttachment,
  type TicketReply,
  type Project,
} from "@/lib/supabase";
import { AdminTicketActions } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data: ticket } = await sb.from("tickets").select("*").eq("id", id).maybeSingle();
  if (!ticket) notFound();
  const t = ticket as Ticket;
  const [{ data: proj }, { data: atts }, { data: reps }] = await Promise.all([
    sb.from("projects").select("*").eq("id", t.project_id).maybeSingle(),
    sb.from("ticket_attachments").select("*").eq("ticket_id", t.id),
    sb.from("ticket_replies").select("*").eq("ticket_id", t.id).order("created_at"),
  ]);
  const project = proj as Project | null;
  const attachments = (atts as TicketAttachment[]) ?? [];
  const replies = (reps as TicketReply[]) ?? [];

  return (
    <div>
      <Link href="/admin/tickets" className="text-sm text-zinc-500 hover:text-green-500">
        ← back
      </Link>
      <div className="mt-3 flex items-start justify-between">
        <div>
          <div className="text-xs text-zinc-500">{project?.name}</div>
          <h1 className="text-2xl font-semibold mt-1">
            <span className="text-zinc-500 mr-2">{fmtTicketNum(t.ticket_number)}</span>
            {t.title}
          </h1>
          <div className="mt-2 text-xs text-zinc-500">
            severity: {t.severity} · filed {new Date(t.created_at).toLocaleString()}
          </div>
        </div>
        <Link
          href={`/t/${t.ticket_number}`}
          target="_blank"
          className="text-xs text-zinc-500 hover:text-green-500"
        >
          public view
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5 whitespace-pre-wrap text-sm">
        {t.description}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Reporter</div>
          <div>{t.reporter_name ?? "anon"}</div>
        </div>
        <div className="rounded-md border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Contact</div>
          <div>{t.reporter_contact ?? "—"}</div>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {attachments.map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
              <img
                src={a.url}
                alt=""
                className="rounded-md border border-zinc-800 w-full h-28 object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <AdminTicketActions ticketId={t.id} currentStatus={t.status} />

      <h2 className="mt-8 text-sm font-medium text-zinc-400 uppercase tracking-wide">
        Replies
      </h2>
      <div className="mt-3 space-y-3">
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
        {replies.length === 0 && (
          <div className="text-sm text-zinc-500">No replies yet.</div>
        )}
      </div>
    </div>
  );
}
