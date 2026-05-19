import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { refreshProjectVersion } from "@/lib/version";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const version = await refreshProjectVersion(slug);
  if (!version) {
    return NextResponse.json({ ok: false, error: "Could not fetch version" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, slug, current_version: version });
}
