import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventsAdminShell } from "../events/_components/events-admin-shell";
import { ElectionsAdminClient } from "./_components/elections-admin-client";
import type { ElectionSnapshot } from "../../elections/types";

export default async function AdminElectionsPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/user/login");

  const [clubResult, snapshotResult, adminRolesResult] = await Promise.all([
    supabase.from("clubs").select("id, name").eq("id", clubid).maybeSingle(),
    supabase.rpc("get_club_election", { p_club_id: clubid, p_manage: true, p_history: false }),
    supabase.from("user_roles").select("club_id, clubs(name)").eq("user_id", user.id).or("is_owner.eq.true,is_admin.eq.true"),
  ]);
  if (!clubResult.data || snapshotResult.error || !snapshotResult.data || typeof snapshotResult.data !== "object" || Array.isArray(snapshotResult.data)) redirect(`/club/${clubid}`);

  let snapshot = snapshotResult.data as unknown as ElectionSnapshot;
  const active = snapshot.elections.find((election) => election.status === "active");
  if (active && new Date(active.closes_at).getTime() <= Date.now()) {
    await supabase.rpc("finalize_club_election", { p_election_id: active.id });
    const refreshed = await supabase.rpc("get_club_election", { p_club_id: clubid, p_manage: true, p_history: false });
    if (refreshed.data && typeof refreshed.data === "object" && !Array.isArray(refreshed.data)) snapshot = refreshed.data as unknown as ElectionSnapshot;
  }

  const adminClubs = (adminRolesResult.data ?? []).filter((item) => item.clubs).map((item) => ({ club_id: item.club_id, name: (item.clubs as { name: string | null }).name ?? "Unnamed club" }));
  if (!adminClubs.some((club) => club.club_id === clubid)) adminClubs.push({ club_id: clubid, name: clubResult.data.name ?? "Unnamed club" });

  return <EventsAdminShell clubId={clubid} clubName={clubResult.data.name ?? "Unnamed club"} adminClubs={adminClubs} activePage="elections"><ElectionsAdminClient clubId={clubid} clubName={clubResult.data.name ?? "Unnamed club"} snapshot={snapshot} /></EventsAdminShell>;
}
