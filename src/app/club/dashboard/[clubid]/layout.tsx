import * as React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubDashboardClient from "./ClubDashboardClient";

type Club = {
  id: string;
  name: string;
  created_at: string;
  university_id: string | null;
  members: number | null;
  about: string | null;
};

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
    .select("id, name, created_at, university_id, members, about")
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

  return (
    <ClubDashboardClient
      clubId={club.id}
      clubName={club.name}
      members={club.members ?? 0}
      createdAt={club.created_at}
      universityName={universityName}
    >
      {children}
    </ClubDashboardClient>
  );
}
