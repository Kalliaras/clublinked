import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SettingsAdminShell } from "./_components/settings-admin-shell";
import { ProfileEditor } from "./_components/profile-editor";

type ClubProfileRow = {
  id: string;
  name: string | null;
  description: string | null;
  type: string | null;
  uses_applications: boolean | null;
  application_deadline: string | null;
  club_image: string | null;
  club_banner_image: string | null;
};

export default async function AdminSettingsPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/user/login");

  const [roleResult, clubResult, adminRolesResult] = await Promise.all([
    supabase.from("user_roles").select("is_owner, is_admin").eq("club_id", clubid).eq("user_id", user.id).maybeSingle(),
    supabase.from("clubs").select("id, name, description, type, uses_applications, application_deadline, club_image, club_banner_image").eq("id", clubid).single(),
    supabase.from("user_roles").select("club_id, clubs(name)").eq("user_id", user.id).or("is_owner.eq.true,is_admin.eq.true"),
  ]);

  const role = roleResult.data;
  if (!role || (!role.is_owner && !role.is_admin)) redirect(`/club/${clubid}`);
  if (clubResult.error || !clubResult.data) redirect(`/club/${clubid}`);
  const club = clubResult.data as unknown as ClubProfileRow;

  const adminClubs = (adminRolesResult.data ?? [])
    .filter((item) => item.clubs)
    .map((item) => ({
      club_id: item.club_id,
      name: (item.clubs as { name: string | null }).name ?? "Unnamed club",
    }));

  return (
    <SettingsAdminShell
      clubId={clubid}
      clubName={club.name ?? "Unnamed club"}
      adminClubs={adminClubs}
    >
      <ProfileEditor
        clubId={clubid}
        initialValues={{
          name: club.name ?? "",
          description: club.description ?? "",
          type: club.type ?? "",
          usesApplications: club.uses_applications ?? false,
          applicationDeadline: club.application_deadline?.slice(0, 16) ?? null,
          clubImage: club.club_image,
          clubBannerImage: club.club_banner_image,
        }}
      />
    </SettingsAdminShell>
  );
}
