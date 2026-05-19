import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, type Ticket } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const reason = (body.reason ?? "").trim();
  if (reason.length < 5) {
    return NextResponse.json({ error: "Reason must be at least 5 characters" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tickets")
    .select("id,user_id,status,denial_count")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const t = data as Pick<Ticket, "id" | "user_id" | "status" | "denial_count"> | null;
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (t.status !== "fix_deployed") {
    return NextResponse.json({ error: "Ticket is not awaiting confirmation" }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const denials = (t.denial_count ?? 0) + 1;
  const { error: e1 } = await sb
    .from("tickets")
    .update({
      status: "open",
      denial_count: denials,
      last_denial_reason: reason,
      updated_at: nowIso,
    })
    .eq("id", id);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  await sb.from("ticket_replies").insert({
    ticket_id: id,
    author: user.display_name ?? user.email,
    body: `Fix denied. Still broken: ${reason}`,
    is_admin: false,
  });

  return NextResponse.json({ ok: true, status: "open", denial_count: denials });
}
