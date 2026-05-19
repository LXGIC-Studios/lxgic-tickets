import { supabaseAdmin, type Project } from "@/lib/supabase";
import { ProjectsAdmin } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  const { data } = await supabaseAdmin().from("projects").select("*").order("name");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <ProjectsAdmin initial={(data as Project[]) ?? []} />
    </div>
  );
}
