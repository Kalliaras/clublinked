import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

import type { DiscoveryClub, DiscoveryTag } from "@/lib/club-discovery-types";
import type { Database } from "@/lib/supabase/database.types";

type ClubQueryRow = Omit<DiscoveryClub, "name" | "interests" | "skills"> & {
  name: string | null;
  club_interests: Array<{ interest_tags: DiscoveryTag | null }>;
  club_skills: Array<{ skill_tags: DiscoveryTag | null }>;
};

async function loadClubDiscoveryData() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const [clubsResult, interestsResult, skillsResult] = await Promise.all([
    supabase
      .from("clubs")
      .select(
        "id, name, description, type, club_image, club_banner_image, member_count, created_at, uses_applications, application_deadline, club_interests(interest_tags(id, name)), club_skills(skill_tags(id, name))"
      )
      .order("name")
      .limit(120),
    supabase.from("interest_tags").select("id, name").order("name"),
    supabase.from("skill_tags").select("id, name").order("name"),
  ]);

  const firstError = clubsResult.error ?? interestsResult.error ?? skillsResult.error;
  if (firstError) {
    throw new Error(`[club/search] Failed to load discovery data: ${firstError.message}`);
  }

  const clubs = ((clubsResult.data ?? []) as unknown as ClubQueryRow[])
    .filter((club): club is ClubQueryRow & { name: string } => Boolean(club.name))
    .map((club) => ({
      id: club.id,
      name: club.name,
      description: club.description,
      type: club.type,
      club_image: club.club_image,
      club_banner_image: club.club_banner_image,
      member_count: club.member_count,
      created_at: club.created_at,
      uses_applications: club.uses_applications,
      application_deadline: club.application_deadline,
      interests: club.club_interests
        .map((item) => item.interest_tags)
        .filter((tag): tag is DiscoveryTag => Boolean(tag)),
      skills: club.club_skills
        .map((item) => item.skill_tags)
        .filter((tag): tag is DiscoveryTag => Boolean(tag)),
    }));

  return {
    clubs,
    interests: interestsResult.data ?? [],
    skills: skillsResult.data ?? [],
  };
}

export const getClubDiscoveryData = unstable_cache(
  loadClubDiscoveryData,
  ["club-discovery-v1", process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""],
  { revalidate: 60, tags: ["club-discovery"] }
);
