import { notFound } from "next/navigation";

import { ClubSearchClient } from "@/app/club/search/_components/club-search-client";
import { getProfileClubsData } from "@/lib/data/profile-clubs";
import { getUser } from "@/lib/supabase/get-user";

interface ProfileClubsPageProps {
  params: Promise<{ profileid: string }>;
}

export default async function ProfileClubsPage({ params }: ProfileClubsPageProps) {
  const { profileid } = await params;
  const [{ profile, clubs, interests, skills }, currentUser] = await Promise.all([
    getProfileClubsData(profileid),
    getUser(),
  ]);

  if (!profile) notFound();

  const isOwnProfile = currentUser?.id === profileid;
  const ownerName = profile.first_name?.trim() || "This user";

  return (
    <div className="clublinked-page-background min-h-screen">
      <main className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <header className="mb-9">
          <h1 className="text-4xl font-extrabold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[42px]">
            {isOwnProfile ? "My" : `${ownerName}'s`} <span className="text-primary">clubs.</span>
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:text-[17px]">
            {clubs.length === 1
              ? `${isOwnProfile ? "Your" : `${ownerName}'s`} club community, all in one place.`
              : `All ${clubs.length} clubs ${isOwnProfile ? "you have" : `${ownerName} has`} joined, in one place.`}
          </p>
        </header>
        <ClubSearchClient
          clubs={clubs}
          interests={interests}
          skills={skills}
          now={new Date().toISOString()}
          emptyCollection={{
            title: isOwnProfile
              ? "You haven't joined any clubs yet."
              : `${ownerName} hasn't joined any clubs yet.`,
            description: "Discover campus organizations and find your community.",
            actionLabel: "Discover clubs",
            actionHref: "/club/search",
          }}
        />
      </main>
    </div>
  );
}
