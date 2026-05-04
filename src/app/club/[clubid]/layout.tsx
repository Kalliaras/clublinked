import * as React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubDashboardClient from "./_components/club-dashboard-client";

export default async function ClubDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, created_at, university_id, member_count, description, club_image")
    .eq("id", clubid)
    .single();

  if (clubError || !club) {
    notFound();
  }

  let universityName: string | null = null;
  if (club.university_id) {
    const { data: university } = await supabase
      .from("universities")
      .select("name")
      .eq("id", club.university_id)
      .single();
    universityName = university?.name ?? null;
  }

  const clubImageUrl = club.club_image ?? null;

  // Check if user is a member of this club
  let isMember = false;
  const { data: { user } } = await supabase.auth.getUser();
  let isOwner = false;
  if (user) {
    const { data: membership } = await supabase
      .from("user_roles")
      .select("is_owner")
      .eq("user_id", user.id)
      .eq("club_id", clubid)
      .maybeSingle();
    isMember = !!membership;
    isOwner = membership?.is_owner ?? false;
  }

  return (
    <ClubDashboardClient
      clubId={club.id}
      clubName={club.name}
      clubImageUrl={clubImageUrl}
      members={club.member_count ?? 0}
      createdAt={club.created_at}
      universityName={universityName}
      isMember={isMember}
      isOwner={isOwner}
    >
      {children}
    </ClubDashboardClient>
  );
}
