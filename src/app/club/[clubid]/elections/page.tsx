import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, History, Users, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
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
  if (election) {
    const votedPositions = election.positions.filter((position) =>
      position.candidates.some((candidate) => candidate.selected)
    ).length;

    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Club governance</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Current election<span className="text-primary">.</span></h2>
            <p className="mt-2 text-sm text-slate-500">Review the open election and cast your member ballot.</p>
          </div>
          <Button variant="outline" asChild><Link href={`/club/${clubid}/elections/history`}><History className="size-4" />Past elections</Link></Button>
        </header>

        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-blue-950 to-blue-800 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200"><span className="size-2 rounded-full bg-emerald-300" />Voting open</span>
                <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">{election.title}</h3>
                <p className="mt-3 text-sm leading-6 text-blue-100">{election.description || "Choose the members who will lead the club in each open position."}</p>
              </div>
              <Button size="lg" className="shrink-0 bg-cyan-300 text-blue-950 hover:bg-cyan-200" asChild>
                <Link href={`/club/${clubid}/elections/${election.id}/vote`}>{votedPositions > 0 ? "Continue voting" : "Vote now"}<ArrowRight className="size-4" /></Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-3 border-t border-white/15 pt-5 text-sm text-blue-100 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-cyan-300" />Closes {new Date(election.closes_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              <span className="inline-flex items-center gap-2"><Vote className="size-4 text-cyan-300" />{election.positions.length} position{election.positions.length === 1 ? "" : "s"}</span>
              <span className="inline-flex items-center gap-2"><Users className="size-4 text-cyan-300" />{election.ballots_cast} of {election.eligible_voters} members voted</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="font-bold text-slate-950">Positions on the ballot</h3><p className="mt-1 text-sm text-slate-500">Open the ballot to read every candidate statement and save your selections.</p></div>
              {votedPositions > 0 && <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="size-3.5" />{votedPositions}/{election.positions.length} voted</span>}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {election.positions.map((position) => (
                <article key={position.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-slate-900">{position.title}</h4><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{position.description}</p></div><span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{position.candidates.length} candidate{position.candidates.length === 1 ? "" : "s"}</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
  const canPrepare = snapshot.viewer.is_owner || snapshot.viewer.title.toLowerCase() !== "member";
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"><Vote className="mx-auto size-8 text-slate-300" /><h2 className="mt-4 text-lg font-bold text-slate-950">No active election</h2><p className="mt-2 text-sm text-slate-500">There is no ballot open for this club right now.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="outline" asChild><Link href={`/club/${clubid}/elections/history`}><History className="size-4" />View past elections</Link></Button>{canPrepare && <Button asChild><Link href={`/club/${clubid}/admin/elections`}>Prepare election</Link></Button>}</div></div>;
}
