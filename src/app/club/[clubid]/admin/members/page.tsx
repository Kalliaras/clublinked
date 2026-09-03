import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MembersClient,
  type ClubMember,
  type MemberActivity,
} from "./_components/members-client";
import { MembersAdminShell } from "./_components/members-admin-shell";

interface ClubMembersPageProps {
  params: Promise<{ clubid: string }>;
}

export default async function ClubMembersPage({ params }: ClubMembersPageProps) {
  const { clubid } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/user/login");

  const { data: viewerRole } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("club_id", clubid)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!viewerRole || (!viewerRole.is_owner && !viewerRole.is_admin)) {
    redirect(`/club/${clubid}`);
  }

  const [
    { data: memberRoles },
    { data: club },
    { data: recentActivities },
    { data: adminRoles },
  ] =
    await Promise.all([
      supabase
        .from("user_roles")
        .select(
          "user_id, title, is_owner, is_admin, created_at, attendance_score"
        )
        .eq("club_id", clubid)
        .order("created_at", { ascending: true }),
      supabase
        .from("clubs")
        .select("id, name, attandence_required")
        .eq("id", clubid)
        .single(),
      supabase.rpc("get_recent_club_member_activities", {
        p_club_id: clubid,
      }),
      supabase
        .from("user_roles")
        .select("club_id, clubs(name)")
        .eq("user_id", user.id)
        .or("is_owner.eq.true,is_admin.eq.true"),
    ]);

  if (!club) redirect(`/club/${clubid}`);

  const userIds = memberRoles?.map((role) => role.user_id) ?? [];
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, major, academic_year")
        .in("id", userIds)
    : { data: [] };

  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );
  const activitiesByUserId = new Map<string, MemberActivity[]>();

  for (const activity of recentActivities ?? []) {
    const current = activitiesByUserId.get(activity.user_id) ?? [];
    current.push({
      id: activity.id,
      activity: activity.activity,
      createdAt: activity.created_at,
    });
    activitiesByUserId.set(activity.user_id, current);
  }

  const members: ClubMember[] = (memberRoles ?? []).map((role) => {
    const profile = profileById.get(role.user_id);
    return {
      id: role.user_id,
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      email: profile?.email ?? null,
      major: profile?.major ?? null,
      academicYear: profile?.academic_year ?? null,
      title: role.title,
      isOwner: role.is_owner,
      isAdmin: role.is_admin,
      joinedAt: role.created_at,
      attendanceScore: role.attendance_score,
      activities: activitiesByUserId.get(role.user_id) ?? [],
    };
  });

  const adminClubs = (adminRoles ?? [])
    .filter((role) => role.clubs)
    .map((role) => ({
      club_id: role.club_id,
      name: (role.clubs as { name: string | null }).name ?? "Unnamed club",
    }));

  return (
    <MembersAdminShell
      clubId={clubid}
      clubName={club.name ?? "Unnamed club"}
      adminClubs={adminClubs}
    >
      <MembersClient
        clubId={clubid}
        members={members}
        attendanceRequired={club.attandence_required}
        viewerIsOwner={viewerRole.is_owner}
        viewerUserId={user.id}
      />
    </MembersAdminShell>
  );
}
