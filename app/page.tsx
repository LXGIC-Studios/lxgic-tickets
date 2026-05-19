import Link from "next/link";
import { supabaseAdmin, type Project } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">
        Found a bug? <span className="text-green-500">Tell us.</span>
      </h1>
      <p className="mt-4 text-zinc-400">
        File a ticket for any Lxgic project. We track it, fix it, and reply on the same page.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/new?project=${p.slug}`}
            className="block rounded-lg border border-zinc-800 bg-zinc-950 p-5 hover:border-green-500/50 transition"
          >
            <div className="text-lg font-medium">{p.name}</div>
            {p.description && (
              <div className="text-sm text-zinc-400 mt-1">{p.description}</div>
            )}
            <div className="text-xs text-green-500 mt-3">file a ticket →</div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="text-zinc-500 text-sm col-span-full">No active projects yet.</div>
        )}
      </div>

      <div className="mt-10">
        <Link
          href="/new"
          className="inline-block rounded-md bg-green-500 px-5 py-3 font-medium text-black hover:bg-green-400"
        >
          File a ticket
        </Link>
      </div>
    </div>
  );
}
