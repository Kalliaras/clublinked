import { createClient } from "@/lib/supabase/server";
import { EventsCalendar, type ClubEvent } from "./_components/events-calendar";

export default async function ClubEventsPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_events")
    .select("id, club_id, title, description, time, event_type, status, location")
    .eq("club_id", clubid)
    .order("time", { ascending: true });

  if (error) console.error("Failed to fetch events:", error.message);
  return <EventsCalendar events={(data ?? []) as ClubEvent[]} />;
}
