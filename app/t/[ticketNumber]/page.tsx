import { notFound } from "next/navigation";
import {
  supabaseAdmin,
  fmtTicketNum,
  type Ticket,
  type TicketAttachment,
  type TicketReply,
  type Project,
} from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ConfirmFixBlock } from "@/components/ConfirmFixBlock";
import { TicketReplyComposer } from "./reply-composer";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

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

  const [{ data: proj }, { data: atts }, { data: reps }, user] = await Promise.all([
    sb.from("projects").select("*").eq("id", t.project_id).maybeSingle(),
    sb.from("ticket_attachments").select("*").eq("ticket_id", t.id).order("created_at"),
    sb.from("ticket_replies").select("*").eq("ticket_id", t.id).order("created_at"),
    getCurrentUser(),
  ]);
  const project = proj as Project | null;
  const attachments = (atts as TicketAttachment[]) ?? [];
  const replies = (reps as TicketReply[]) ?? [];
  const isOwner = !!(user && t.user_id && user.id === t.user_id);
  const denialCount = t.denial_count ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-zinc-500 font-mono">
              {fmtTicketNum(t.ticket_number)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.title}</h1>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>filed by {t.reporter_name ?? "anon"}</span>
            <span>·</span>
            <span>{relativeTime(t.created_at)}</span>
            {project && (
              <>
                <span>·</span>
                <span>{project.name}</span>
              </>
            )}
            {t.ticket_version && (
              <>
                <span>·</span>
                <span>Filed against <span className="font-mono text-zinc-400">v{t.ticket_version}</span></span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={t.severity} />
          <StatusBadge status={t.status} />
        </div>
      </div>

      {denialCount > 0 && t.status !== "fix_deployed" && (
        <div className="mt-4 inline-block rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs text-amber-300">
          Previously denied {denialCount} {denialCount === 1 ? "time" : "times"}
        </div>
      )}

      {t.status === "fix_deployed" && (
        <div className="mt-6">
          <ConfirmFixBlock
            ticketId={t.id}
            fixVersion={t.fix_version ?? null}
            fixNotes={t.fix_notes ?? null}
            denialCount={denialCount}
            lastDenialReason={t.last_denial_reason ?? null}
            canAct={isOwner}
          />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 whitespace-pre-wrap text-sm text-zinc-200">
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
                className="rounded-lg border border-zinc-800 hover:border-zinc-700 w-full h-32 object-cover transition-colors"
              />
            </a>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-sm font-semibold text-zinc-400 uppercase tracking-wide">
        Replies
      </h2>
      <div className="mt-3 space-y-3">
        {replies.length === 0 && (
          <div className="text-sm text-zinc-500">No replies yet.</div>
        )}
        {replies.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border p-4 text-sm ${
              r.is_admin
                ? "border-green-500/30 bg-green-500/5"
                : "border-zinc-800 bg-zinc-950/50"
            }`}
          >
            <div className="text-xs text-zinc-500 mb-1.5">
              <span className={r.is_admin ? "text-green-400 font-medium" : "text-zinc-300"}>
                {r.author}
              </span>{" "}
              {r.is_admin && <span className="text-green-500">· team</span>} ·{" "}
              {relativeTime(r.created_at)}
            </div>
            <div className="whitespace-pre-wrap text-zinc-200">{r.body}</div>
          </div>
        ))}
      </div>

      {isOwner && <TicketReplyComposer ticketId={t.id} />}
    </div>
  );
}
