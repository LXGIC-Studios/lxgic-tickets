import { supabaseAdmin, type Project } from "@/lib/supabase";

const TEN_MIN = 10 * 60 * 1000;

interface HealthShape {
  version?: unknown;
}

async function fetchVersion(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const j = (await res.json()) as HealthShape;
    if (typeof j.version === "string" && j.version.trim()) return j.version.trim();
    return null;
  } catch {
    return null;
  }
}

export async function refreshProjectVersion(slug: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("projects")
    .select("slug,health_url")
    .eq("slug", slug)
    .maybeSingle();
  const proj = data as Pick<Project, "slug" | "health_url"> | null;
  if (!proj?.health_url) return null;
  const v = await fetchVersion(proj.health_url);
  if (!v) {
    await sb
      .from("projects")
      .update({ version_checked_at: new Date().toISOString() })
      .eq("slug", slug);
    return null;
  }
  await sb
    .from("projects")
    .update({ current_version: v, version_checked_at: new Date().toISOString() })
    .eq("slug", slug);
  return v;
}

export async function maybeRefreshAllVersions(): Promise<void> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("projects")
    .select("slug,health_url,version_checked_at")
    .eq("is_active", true);
  const rows = (data ?? []) as Array<{
    slug: string;
    health_url: string | null;
    version_checked_at: string | null;
  }>;
  const stale = rows.filter((r) => {
    if (!r.health_url) return false;
    if (!r.version_checked_at) return true;
    return Date.now() - new Date(r.version_checked_at).getTime() > TEN_MIN;
  });
  await Promise.allSettled(stale.map((r) => refreshProjectVersion(r.slug)));
}
