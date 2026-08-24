import * as React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClubPublicData } from "@/lib/data/club-page";
import ClubDashboardClient from "./_components/club-dashboard-client";

export default async function ClubDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const publicDataPromise = getClubPublicData(clubid);
  const supabase = await createClient();

  const [publicData, viewerResult] = await Promise.all([
    publicDataPromise,
    supabase.rpc("get_club_viewer_state", { p_club_id: clubid }),
  ]);

  if (!publicData) {
    notFound();
  }

  const club = publicData.club;
  const viewer =
    viewerResult.data && typeof viewerResult.data === "object" && !Array.isArray(viewerResult.data)
      ? (viewerResult.data as Record<string, unknown>)
      : {};
  const applicationsClosed = Boolean(
    club.application_deadline &&
      new Date(club.application_deadline).getTime() <= Date.now()
  );

  return (
    <ClubDashboardClient
      clubId={club.id}
      clubName={club.name}
      clubImageUrl={club.club_image ?? null}
      clubBannerImageUrl={club.club_banner_image ?? null}
      members={club.member_count ?? 0}
      createdAt={club.created_at}
      universityName={club.university_name}
      isMember={viewer.is_member === true}
      isOwner={viewer.is_owner === true}
      isAdmin={viewer.is_admin === true}
      usesApplications={club.uses_applications ?? false}
      applicationsClosed={applicationsClosed}
      hasApplied={viewer.has_applied === true}
    >
      {children}
    </ClubDashboardClient>
  );
}
