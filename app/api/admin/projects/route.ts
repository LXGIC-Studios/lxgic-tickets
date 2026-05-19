import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    is_active?: boolean;
  };
  const sb = supabaseAdmin();
  if (body.id) {
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.slug !== undefined) update.slug = body.slug;
    if (body.description !== undefined) update.description = body.description;
    if (body.is_active !== undefined) update.is_active = body.is_active;
    const { error } = await sb.from("projects").update(update).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const { error } = await sb.from("projects").insert({
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
