import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProjectsAdminClient } from "./_components/projects-admin-client";
import { ProjectsAdminShell } from "./_components/projects-admin-shell";
import type { ClubProject, ProjectVisibility } from "./types";

export default async function AdminProjectsPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/user/login");

  const [roleResult, clubResult, adminRolesResult, projectsResult] = await Promise.all([
    supabase
      .from("user_roles")
      .select("is_owner, is_admin")
      .eq("club_id", clubid)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("clubs").select("id, name").eq("id", clubid).single(),
    supabase
      .from("user_roles")
      .select("club_id, clubs(name)")
      .eq("user_id", user.id)
      .or("is_owner.eq.true,is_admin.eq.true"),
    supabase
      .from("club_projects")
      .select("id, club_id, title, description, visibility, created_at")
      .eq("club_id", clubid)
      .order("created_at", { ascending: false }),
  ]);

  const role = roleResult.data;
  if (!role || (!role.is_owner && !role.is_admin)) redirect(`/club/${clubid}`);

  const club = clubResult.data;
  if (!club) redirect(`/club/${clubid}`);

  const adminClubs = (adminRolesResult.data ?? [])
    .filter((roleItem) => roleItem.clubs)
    .map((roleItem) => ({
      club_id: roleItem.club_id,
      name: (roleItem.clubs as { name: string | null }).name ?? "Unnamed club",
    }));

  const projects: ClubProject[] = (projectsResult.data ?? []).map((project) => ({
    ...project,
    visibility: (project.visibility === "members_only" ? "members_only" : "public") as ProjectVisibility,
  }));

  return (
    <ProjectsAdminShell
      clubId={clubid}
      clubName={club.name ?? "Unnamed club"}
      adminClubs={adminClubs}
    >
      <ProjectsAdminClient
        clubId={clubid}
        clubName={club.name ?? "Unnamed club"}
        projects={projects}
      />
    </ProjectsAdminShell>
  );
}
