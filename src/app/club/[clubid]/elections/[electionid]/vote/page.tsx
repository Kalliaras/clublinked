import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ElectionBallot } from "../../_components/election-ballot";
import type { ElectionSnapshot } from "../../types";

export default async function ElectionVotePage({
  params,
}: {
  params: Promise<{ clubid: string; electionid: string }>;
}) {
  const { clubid, electionid } = await params;
  const supabase = await createClient();
  let result = await supabase.rpc("get_club_election", {
    p_club_id: clubid,
    p_manage: false,
    p_history: false,
  });

  if (result.error) redirect(`/club/${clubid}`);

  let snapshot = result.data as unknown as ElectionSnapshot;
  let election = snapshot.elections.find((item) => item.id === electionid);

  if (election && new Date(election.closes_at).getTime() <= Date.now()) {
    await supabase.rpc("finalize_club_election", { p_election_id: election.id });
    result = await supabase.rpc("get_club_election", {
      p_club_id: clubid,
      p_manage: false,
      p_history: false,
    });
    snapshot = result.data as unknown as ElectionSnapshot;
    election = snapshot.elections.find((item) => item.id === electionid);
  }

  if (!election) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="-ml-3 text-slate-600" asChild>
        <Link href={`/club/${clubid}/elections`}><ArrowLeft className="size-4" />Back to elections</Link>
      </Button>
      <ElectionBallot clubId={clubid} election={election} />
    </div>
  );
}
