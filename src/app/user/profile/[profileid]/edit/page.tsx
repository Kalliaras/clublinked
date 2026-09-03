import { notFound, redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import { UserProfileEditor } from "./_components/user-profile-editor";

export default async function EditUserProfilePage({
  params,
}: {
  params: Promise<{ profileid: string }>;
}) {
  const { profileid } = await params;
  const user = await getUser();

  if (!user) redirect("/user/login");
  if (user.id !== profileid) redirect(`/user/profile/${profileid}`);

  const supabase = await createClient();
  const [profileResult, interestsResult, skillsResult, userInterestsResult, userSkillsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", profileid).single(),
      supabase.from("interest_tags").select("id, name").order("name"),
      supabase.from("skill_tags").select("id, name").order("name"),
      supabase.from("user_interests").select("interest_id").eq("user_id", profileid),
      supabase.from("user_skills").select("skill_id").eq("user_id", profileid),
    ]);

  if (profileResult.error || !profileResult.data) notFound();

  const profile = profileResult.data;
  let resumeUrl: string | null = null;
  if (profile.resume) {
    const { data } = await supabase.storage
      .from("users_resumes")
      .createSignedUrl(profile.resume, 60 * 60);
    resumeUrl = data?.signedUrl ?? null;
  }

  return (
    <UserProfileEditor
      profile={{
        id: profile.id,
        email: profile.email ?? user.email ?? "",
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
        major: profile.major ?? "",
        academicYear: profile.academic_year ?? "",
        bio: profile.bio ?? "",
        linkedinUrl: profile.linkedin_url ?? "",
        githubUrl: profile.github_url ?? "",
        instagramUrl: profile.instagram_url ?? "",
        xUrl: profile.x_url ?? "",
        portfolioUrl: profile.portfolio_url ?? "",
        resume: profile.resume,
        resumeUrl,
      }}
      availableInterests={interestsResult.data ?? []}
      availableSkills={skillsResult.data ?? []}
      initialInterestIds={(userInterestsResult.data ?? []).map((item) => item.interest_id)}
      initialSkillIds={(userSkillsResult.data ?? []).map((item) => item.skill_id)}
    />
  );
}
