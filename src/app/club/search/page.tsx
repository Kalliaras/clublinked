import { createClient } from "@/lib/supabase/server";
import { ClubSearchClient, type Club } from "./_components/club-search-client";

export default async function ClubDiscoveryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, description, type, club_image")
    .order("name");

  if (error) {
    console.error("[club/search] Failed to load clubs:", error.message);
  }

  const clubs = (data ?? []).filter(
    (club): club is Club => typeof club.name === "string"
  );

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary">
            Explore Clubs
          </h1>

        </div>
        <ClubSearchClient clubs={clubs} />
      </main>
    </div>
  );
}
