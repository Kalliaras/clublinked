import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { ElectionSnapshot } from "../types";
import { memberName } from "../types";

export default async function ElectionHistoryPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_club_election", { p_club_id: clubid, p_manage: false, p_history: true });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) redirect(`/club/${clubid}`);
  const snapshot = data as unknown as ElectionSnapshot;

  return (
    <div>
      <header className="mb-8 flex items-start gap-4"><Button variant="outline" size="icon" asChild><Link href={`/club/${clubid}/elections`} aria-label="Back to elections"><ArrowLeft className="size-4" /></Link></Button><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Club governance</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Past elections<span className="text-primary">.</span></h2><p className="mt-2 text-sm text-slate-500">A record of completed officer elections and their outcomes.</p></div></header>
      {snapshot.elections.length ? <div className="space-y-6">{snapshot.elections.map((election) => (
        <section key={election.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between"><div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="size-3.5" />Completed</span><h3 className="mt-3 text-xl font-bold text-slate-950">{election.title}</h3><p className="mt-1 text-sm text-slate-500">Finalized {new Date(election.completed_at ?? election.closes_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div><div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><Users className="size-4 text-slate-400" />{election.ballots_cast} of {election.eligible_voters} members voted</div></div>
          <div className="divide-y divide-slate-100">{election.positions.map((position) => {
            const winner = position.candidates.find((candidate) => candidate.id === position.winner_candidate_id);
            return <div key={position.id} className="p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="max-w-2xl"><p className="font-bold text-slate-950">{position.title}</p><p className="mt-1 text-sm leading-relaxed text-slate-500">{position.description}</p></div>{winner ? <div className="flex min-w-56 items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3"><span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700"><Trophy className="size-4" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Elected · {winner.vote_count ?? 0} votes</p><p className="font-bold text-slate-950">{memberName(winner)}</p></div></div> : <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">Tie or no votes · role unchanged</div>}</div><div className="mt-4 flex flex-wrap gap-2">{position.candidates.map((candidate) => <span key={candidate.id} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">{memberName(candidate)} · {candidate.vote_count ?? 0}</span>)}</div></div>;
          })}</div>
        </section>
      ))}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">Completed elections will appear here.</div>}
    </div>
  );
}
