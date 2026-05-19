import { NextResponse } from "next/server";
import { supabaseAdmin, type Project } from "@/lib/supabase";
import { maybeRefreshAllVersions } from "@/lib/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // best-effort background refresh
  void maybeRefreshAllVersions();

  const { data, error } = await supabaseAdmin()
    .from("projects")
    .select("slug,name,description,current_version,version_checked_at,repo_url")
    .eq("is_active", true)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const projects = (data ?? []) as Array<Pick<Project, "slug" | "name" | "description" | "current_version" | "version_checked_at" | "repo_url">>;
  return NextResponse.json({ projects });
}
