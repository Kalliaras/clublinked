import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementsAdminClient } from "./_components/announcements-admin-client";
import { AnnouncementsAdminShell } from "./_components/announcements-admin-shell";
import type { AdminAnnouncement } from "./types";

export default async function AdminAnnouncementsPage({
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

  const [roleResult, clubResult, adminRolesResult, profileResult, announcementsResult] =
    await Promise.all([
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
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("club_announcements")
        .select("id, title, body, created_at")
        .eq("club_id", clubid)
        .order("created_at", { ascending: false })
        .limit(100),
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

  if (announcementsResult.error) {
    console.error("Failed to fetch admin announcements:", announcementsResult.error.message);
    return (
      <AnnouncementsAdminShell
        clubId={clubid}
        clubName={club.name ?? "Unnamed club"}
        adminClubs={adminClubs}
        userFirstName={profileResult.data?.first_name ?? null}
        userLastName={profileResult.data?.last_name ?? null}
      >
        <div className="mx-auto w-full max-w-5xl">
          <Alert variant="destructive" className="border-red-200 bg-white p-5">
            <AlertCircle />
            <AlertTitle>Announcements couldn&apos;t be loaded</AlertTitle>
            <AlertDescription>
              Refresh the page to try again. If the problem continues, please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </AnnouncementsAdminShell>
    );
  }

  const announcements = (announcementsResult.data ?? []) as unknown as AdminAnnouncement[];

  return (
    <AnnouncementsAdminShell
      clubId={clubid}
      clubName={club.name ?? "Unnamed club"}
      adminClubs={adminClubs}
      userFirstName={profileResult.data?.first_name ?? null}
      userLastName={profileResult.data?.last_name ?? null}
    >
      <AnnouncementsAdminClient
        clubId={clubid}
        clubName={club.name ?? "Unnamed club"}
        announcements={announcements}
      />
    </AnnouncementsAdminShell>
  );
}
