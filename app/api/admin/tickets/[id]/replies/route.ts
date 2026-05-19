import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { author, body, is_admin } = (await req.json()) as {
    author?: string;
    body?: string;
    is_admin?: boolean;
  };
  if (!author || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const { error } = await supabaseAdmin().from("ticket_replies").insert({
    ticket_id: id,
    author,
    body,
    is_admin: !!is_admin,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
