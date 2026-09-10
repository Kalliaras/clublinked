import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import { Infobox } from "./_components/infobox";

export default async function ClubCreatePage() {
  const user = await getUser();
  if (!user) redirect("/user/login");
  const supabase = await createClient();
  const [profileResult, interestsResult, skillsResult] = await Promise.all([
    supabase.from("profiles").select("university_id, universities(name)").eq("id", user.id).maybeSingle(),
    supabase.from("interest_tags").select("id, name").order("name"),
    supabase.from("skill_tags").select("id, name").order("name"),
  ]);
  if (!profileResult.data?.university_id) redirect(`/user/profile/${user.id}/edit`);
  const university = profileResult.data.universities as { name: string | null } | null;

  return (
    <div className="clublinked-page-background min-h-screen px-5 py-10 sm:px-8 lg:px-12">
      <Infobox
        universityName={university?.name ?? "your university"}
        interests={(interestsResult.data ?? []).filter((tag): tag is { id: string; name: string } => Boolean(tag.name))}
        skills={(skillsResult.data ?? []).filter((tag): tag is { id: string; name: string } => Boolean(tag.name))}
      />
    </div>
  );
}
