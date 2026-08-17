import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { EventsAdminClient } from "./_components/events-admin-client";
import { EventsAdminShell } from "./_components/events-admin-shell";
import type { ClubEvent, EventVisibility } from "./types";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/user/login");

  const [roleResult, clubResult, adminRolesResult, profileResult, eventsResult] =
    await Promise.all([
      supabase
        .from("user_roles")
        .select("is_owner, is_admin")
        .eq("club_id", clubid)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("clubs").select("id, name").eq("id", clubid).single(),
      supabase
        .from("user_roles")
        .select("club_id, clubs(name)")
        .eq("user_id", user.id)
        .or("is_owner.eq.true,is_admin.eq.true"),
      supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("club_events")
        .select("id, club_id, title, description, time, event_type, status, location")
        .eq("club_id", clubid)
        .order("time", { ascending: true }),
    ]);

  const role = roleResult.data;
  if (!role || (!role.is_owner && !role.is_admin)) redirect(`/club/${clubid}`);

  const club = clubResult.data;
  if (!club) redirect(`/club/${clubid}`);

  const adminClubs = (adminRolesResult.data ?? [])
    .filter((roleItem) => roleItem.clubs)
    .map((roleItem) => ({
      club_id: roleItem.club_id,
      name: (roleItem.clubs as { name: string | null }).name ?? "Unnamed club",
    }));

  const events: ClubEvent[] = (eventsResult.data ?? []).map((event) => ({
    id: event.id,
    club_id: event.club_id,
    title: event.title,
    description: event.description,
    time: event.time,
    event_type: event.event_type,
    status: (event.status === "members_only" ? "members_only" : "public") as EventVisibility,
    location: event.location,
  }));

  return (
    <EventsAdminShell
      clubId={clubid}
      clubName={club.name ?? "Unnamed club"}
      adminClubs={adminClubs}
      userFirstName={profileResult.data?.first_name ?? null}
      userLastName={profileResult.data?.last_name ?? null}
    >
      <EventsAdminClient clubId={clubid} clubName={club.name ?? "Unnamed club"} events={events} />
    </EventsAdminShell>
  );
}
