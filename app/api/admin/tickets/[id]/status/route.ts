import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthorized } from "@/lib/admin-auth";

const STATUSES = ["open", "in_progress", "fix_deployed", "wontfix", "duplicate"];

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { status } = (await req.json()) as { status?: string };
  if (status === "resolved") {
    return NextResponse.json(
      { error: "Admins cannot mark resolved. Use /mark-fixed; client must confirm." },
      { status: 403 }
    );
  }
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Bad status" }, { status: 400 });
  }
  const { error } = await supabaseAdmin()
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
