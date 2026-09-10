import { redirect } from "next/navigation";
import Link from "next/link";
import { History, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ElectionBallot } from "./_components/election-ballot";
import type { ElectionSnapshot } from "./types";

export default async function ElectionsPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  let result = await supabase.rpc("get_club_election", { p_club_id: clubid, p_manage: false, p_history: false });
  if (result.error) redirect(`/club/${clubid}`);
  let snapshot = result.data as unknown as ElectionSnapshot;
  let election = snapshot.elections[0];
  if (election && new Date(election.closes_at).getTime() <= Date.now()) {
    await supabase.rpc("finalize_club_election", { p_election_id: election.id });
    result = await supabase.rpc("get_club_election", { p_club_id: clubid, p_manage: false, p_history: false });
    snapshot = result.data as unknown as ElectionSnapshot;
    election = snapshot.elections[0];
  }
  if (election) return <ElectionBallot clubId={clubid} election={election} />;
  const canPrepare = snapshot.viewer.is_owner || snapshot.viewer.title.toLowerCase() !== "member";
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"><Vote className="mx-auto size-8 text-slate-300" /><h2 className="mt-4 text-lg font-bold text-slate-950">No active election</h2><p className="mt-2 text-sm text-slate-500">There is no ballot open for this club right now.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="outline" asChild><Link href={`/club/${clubid}/elections/history`}><History className="size-4" />View past elections</Link></Button>{canPrepare && <Button asChild><Link href={`/club/${clubid}/admin/elections`}>Prepare election</Link></Button>}</div></div>;
}
