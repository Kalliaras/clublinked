import { connection } from "next/server";

import { getClubDiscoveryData } from "@/lib/data/club-discovery";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import { ClubSearchClient } from "./_components/club-search-client";

export default async function ClubDiscoveryPage() {
  await connection();
  const user = await getUser();
  let universityId: string | null = null;

  if (user) {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`[club/search] Failed to load the user's university: ${error.message}`);
    }
    universityId = profile?.university_id ?? null;
  }

  const { clubs, interests, skills } = await getClubDiscoveryData(universityId);

  return (
    <div className="clublinked-page-background min-h-screen">
      <main className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <header className="mb-9">
          <h1 className="text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[42px]">
            Discover <span className="text-primary">clubs.</span>
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:text-[17px]">
            Explore {clubs.length} campus organizations and find the communities that match what you care about.
          </p>
        </header>
        <ClubSearchClient
          clubs={clubs}
          interests={interests}
          skills={skills}
          now={new Date().toISOString()}
        />
      </main>
    </div>
  );
}
