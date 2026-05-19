import { supabaseAdmin, type Project } from "@/lib/supabase";
import { NewTicketForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const sp = await searchParams;
  const { data } = await supabaseAdmin()
    .from("projects")
    .select("*")
    .eq("is_active", true)
    .order("name");
  const projects = (data as Project[]) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">File a ticket</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Tell us what broke. Add screenshots if you have them.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NewTicketForm projects={projects} preselect={sp.project} />
        </div>
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 text-sm">
            <h2 className="text-sm font-semibold text-zinc-200">What gets captured</h2>
            <ul className="mt-3 space-y-2 text-zinc-400">
              <li>• Your launch settings</li>
              <li>• Wallet addresses</li>
              <li>• Transaction hashes</li>
              <li>• Platform version</li>
              <li>• Any screenshots you attach</li>
            </ul>
            <div className="mt-5 text-xs text-zinc-500">
              We keep tickets public so others can find them. Don&rsquo;t paste secrets.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
