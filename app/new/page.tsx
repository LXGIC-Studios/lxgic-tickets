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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">File a ticket</h1>
      <p className="mt-2 text-zinc-400 text-sm">
        Tell us what broke. Add screenshots if you have them.
      </p>
      <NewTicketForm projects={projects} preselect={sp.project} />
    </div>
  );
}
