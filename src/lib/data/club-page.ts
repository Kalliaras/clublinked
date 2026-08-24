import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export type ClubPageEvent = {
  id: string;
  title: string | null;
  time: string;
  event_type: string | null;
  status: string;
  location: string | null;
};

type ClubPageQueryRow = {
  id: string;
  name: string | null;
  description: string | null;
  history: string | null;
  created_at: string;
  member_count: number | null;
  club_image: string | null;
  club_banner_image: string | null;
  uses_applications: boolean;
  application_deadline: string | null;
  universities: { name: string | null } | null;
  club_interests: Array<{ interest_tags: { name: string } | null }>;
};

async function loadClubPublicData(clubId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const [clubResult, eventsResult] = await Promise.all([
    supabase
      .from("clubs")
      .select(
        "id, name, description, history, created_at, member_count, club_image, club_banner_image, uses_applications, application_deadline, universities(name), club_interests(interest_tags(name))"
      )
      .eq("id", clubId)
      .single(),
    supabase
      .from("club_events")
      .select("id, title, time, event_type, status, location")
      .eq("club_id", clubId)
      .eq("status", "public")
      .gte("time", new Date().toISOString())
      .order("time", { ascending: true })
      .limit(3),
  ]);

  if (clubResult.error) {
    if (clubResult.error.code === "PGRST116") return null;
    throw new Error(`[club] Failed to load club: ${clubResult.error.message}`);
  }
  if (eventsResult.error) {
    throw new Error(`[club] Failed to load events: ${eventsResult.error.message}`);
  }

  const club = clubResult.data as unknown as ClubPageQueryRow;
  return {
    club: {
      id: club.id,
      name: club.name,
      description: club.description,
      history: club.history,
      created_at: club.created_at,
      member_count: club.member_count,
      club_image: club.club_image,
      club_banner_image: club.club_banner_image,
      uses_applications: club.uses_applications,
      application_deadline: club.application_deadline,
      university_name: club.universities?.name ?? null,
      interests: club.club_interests
        .map((item) => item.interest_tags?.name)
        .filter((name): name is string => Boolean(name)),
    },
    events: (eventsResult.data ?? []) as ClubPageEvent[],
  };
}

const getCachedClubPublicData = unstable_cache(
  loadClubPublicData,
  ["club-public-page-v1", process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""],
  { revalidate: 60, tags: ["club-page"] }
);

export const getClubPublicData = cache(getCachedClubPublicData);
