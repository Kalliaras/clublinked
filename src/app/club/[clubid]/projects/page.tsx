import { createClient } from "@/lib/supabase/server";
import { ProjectList, type ClubProject } from "./_components/project-list";

export default async function ClubProjectsPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_projects")
    .select("id, club_id, title, description, created_at")
    .eq("club_id", clubid)
    .order("created_at", { ascending: false });

  if (error) console.error("Failed to fetch projects:", error.message);
  return <ProjectList projects={(data ?? []) as ClubProject[]} />;
}
