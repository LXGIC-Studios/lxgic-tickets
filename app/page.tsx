import Link from "next/link";
import { supabaseAdmin, type Project } from "@/lib/supabase";
import { maybeRefreshAllVersions } from "@/lib/version";

export const dynamic = "force-dynamic";

function isRecent(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;
}

export default async function Home() {
  // best-effort refresh
  void maybeRefreshAllVersions();

  let projects: Project[] = [];
  try {
    const { data } = await supabaseAdmin()
      .from("projects")
      .select("*")
      .eq("is_active", true)
      .order("name");
    projects = (data as Project[]) ?? [];
  } catch {
    projects = [];
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Bug tracker for <span className="text-green-500">Lxgic Studios</span>.
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          File issues. Watch them get fixed. Confirm when ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/new"
            className="rounded-lg bg-green-500 hover:bg-green-400 text-black font-medium px-5 py-2.5 transition-colors"
          >
            File a ticket
          </Link>
          <Link
            href="/my-tickets"
            className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 px-5 py-2.5 transition-colors"
          >
            My tickets
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Active projects</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const ver = p.current_version;
            const recent = isRecent(p.version_checked_at);
            return (
              <div
                key={p.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{p.name}</div>
                    {p.description && (
                      <div className="text-sm text-zinc-400 mt-1">{p.description}</div>
                    )}
                  </div>
                  <span
                    className={
                      ver
                        ? recent
                          ? "rounded-full px-2.5 py-0.5 text-xs font-mono bg-green-500/15 text-green-300 border border-green-500/30"
                          : "rounded-full px-2.5 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400"
                        : "rounded-full px-2.5 py-0.5 text-xs bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }
                  >
                    {ver ? `v${ver}` : "version unknown"}
                  </span>
                </div>
                <div className="mt-5">
                  <Link
                    href={`/new?project=${p.slug}`}
                    className="text-sm text-green-500 hover:text-green-400 transition-colors"
                  >
                    File a ticket for {p.name} →
                  </Link>
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="text-zinc-500 text-sm">No active projects yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
