import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    fix_version?: string;
    fix_commit?: string;
    fix_notes?: string;
  };
  const fix_version = (body.fix_version ?? "").trim();
  const fix_commit = (body.fix_commit ?? "").trim();
  const fix_notes = (body.fix_notes ?? "").trim() || null;
  if (!fix_version || !fix_commit) {
    return NextResponse.json({ error: "fix_version and fix_commit required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: existing, error: e0 } = await sb
    .from("tickets")
    .select("id,ticket_number")
    .eq("id", id)
    .maybeSingle();
  if (e0) return NextResponse.json({ error: e0.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nowIso = new Date().toISOString();
  const { error } = await sb
    .from("tickets")
    .update({
      status: "fix_deployed",
      fix_version,
      fix_commit,
      fix_notes,
      fix_deployed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const replyBody = [
    `Fix deployed in v${fix_version} (commit ${fix_commit.slice(0, 7)}).`,
    fix_notes ? `Notes: ${fix_notes}` : null,
    "Please confirm or report it's still broken.",
  ]
    .filter(Boolean)
    .join("\n");

  await sb.from("ticket_replies").insert({
    ticket_id: id,
    author: "auto-fix bot",
    body: replyBody,
    is_admin: true,
  });

  return NextResponse.json({ ok: true, status: "fix_deployed" });
}
