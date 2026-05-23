import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { maybeRefreshAllVersions } from "@/lib/version";

export const runtime = "nodejs";

interface JoinedTicket {
  id: string;
  ticket_number: number;
  project_id: string;
  user_id: string | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  reporter_name: string | null;
  reporter_contact: string | null;
  created_at: string;
  updated_at: string;
  projects: { name: string; slug: string } | null;
  portal_users: { id: string; email: string; display_name: string | null } | null;
  ticket_attachments: { url: string; filename: string | null }[];
  ticket_replies: { author: string; body: string; is_admin: boolean; created_at: string }[];
}

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const jar = await cookies();
  if (jar.get("admin_session")?.value === "ok") return true;
  const auth = req.headers.get("authorization");
  const token = process.env.ADMIN_API_TOKEN;
  if (auth && token && auth === `Bearer ${token}`) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // best-effort: refresh project versions if stale
  void maybeRefreshAllVersions();

  const url = new URL(req.url);
  const since = url.searchParams.get("since");
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  const project = url.searchParams.get("project");

  let q = supabaseAdmin()
    .from("tickets")
    .select(
      "id,ticket_number,project_id,user_id,title,description,severity,status,reporter_name,reporter_contact,created_at,updated_at,projects(name,slug),portal_users(id,email,display_name),ticket_attachments(url,filename),ticket_replies(author,body,is_admin,created_at)"
    )
    .order("updated_at", { ascending: false });

  if (since) q = q.gte("updated_at", since);
  if (status) q = q.eq("status", status);
  if (severity) q = q.eq("severity", severity);
  if (project) q = q.eq("project_id", project);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tickets = (data as unknown as JoinedTicket[]) ?? [];
  return NextResponse.json({
    tickets,
    count: tickets.length,
    fetched_at: new Date().toISOString(),
  });
}
