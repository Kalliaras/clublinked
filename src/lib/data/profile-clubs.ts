import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DiscoveryClub, DiscoveryTag } from "@/lib/club-discovery-types";

type JoinedClub = Omit<DiscoveryClub, "name" | "interests" | "skills"> & {
  name: string | null;
  club_interests: Array<{ interest_tags: DiscoveryTag | null }>;
  club_skills: Array<{ skill_tags: DiscoveryTag | null }>;
};

type UserRoleWithClub = {
  clubs: JoinedClub | null;
};

export async function getProfileClubsData(profileId: string) {
  const supabase = await createClient();

  const [profileResult, rolesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", profileId)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select(
        "clubs(id, name, description, type, club_image, club_banner_image, member_count, created_at, uses_applications, application_deadline, club_interests(interest_tags(id, name)), club_skills(skill_tags(id, name)))"
      )
      .eq("user_id", profileId),
  ]);

  if (profileResult.error) {
    throw new Error(`[profile/clubs] Failed to load profile: ${profileResult.error.message}`);
  }
  if (rolesResult.error) {
    throw new Error(`[profile/clubs] Failed to load memberships: ${rolesResult.error.message}`);
  }

  const clubs = ((rolesResult.data ?? []) as unknown as UserRoleWithClub[])
    .map((role) => role.clubs)
    .filter((club): club is JoinedClub & { name: string } => Boolean(club?.name))
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

  const uniqueTags = (tags: DiscoveryTag[]) =>
    Array.from(new Map(tags.map((tag) => [tag.id, tag])).values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    );

  return {
    profile: profileResult.data,
    clubs,
    interests: uniqueTags(clubs.flatMap((club) => club.interests)),
    skills: uniqueTags(clubs.flatMap((club) => club.skills)),
  };
}
