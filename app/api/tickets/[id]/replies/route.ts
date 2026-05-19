import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, type Ticket } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { body?: string };
  const text = (body.body ?? "").trim();
  if (text.length < 1) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data } = await sb.from("tickets").select("user_id").eq("id", id).maybeSingle();
  const t = data as Pick<Ticket, "user_id"> | null;
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await sb.from("ticket_replies").insert({
    ticket_id: id,
    author: user.display_name ?? user.email,
    body: text,
    is_admin: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb
    .from("tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
