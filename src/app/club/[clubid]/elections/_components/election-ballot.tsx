"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock3, History, LockKeyhole, Vote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";
import type { ClubElection } from "../types";
import { memberName } from "../types";
import { castVoteAction } from "../actions";

export function ElectionBallot({ clubId, election }: { clubId: string; election: ClubElection }) {
  const router = useRouter();
  const initial = Object.fromEntries(election.positions.flatMap((position) => position.candidates.filter((candidate) => candidate.selected).map((candidate) => [position.id, candidate.id])));
  const [choices, setChoices] = useState<Record<string, string>>(initial);
  const [pendingPosition, setPendingPosition] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(positionId: string) {
    const candidateId = choices[positionId];
    if (!candidateId) return;
    setPendingPosition(positionId);
    startTransition(async () => {
      const result = await castVoteAction(clubId, positionId, candidateId);
      if ("errorMessage" in result) toast.error(result.errorMessage);
      else {
        toast.success("Your vote was saved.");
        router.refresh();
      }
      setPendingPosition(null);
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Member ballot</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{election.title}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">{election.description || "Choose one candidate for each position."}</p></div><Button variant="outline" asChild><Link href={`/club/${clubId}/elections/history`}><History className="size-4" />Past elections</Link></Button></header>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800"><Clock3 className="size-4" /><span>Voting closes {new Date(election.closes_at).toLocaleString("en-US", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}</span><span className="sm:ml-auto inline-flex items-center gap-2"><LockKeyhole className="size-4" />Live results are private</span></div>
      {election.positions.map((position, index) => (
        <section key={position.id} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Position {index + 1} of {election.positions.length}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{position.title}</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{position.description}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{position.candidates.map((candidate) => {
            const selected = choices[position.id] === candidate.id;
            return <button key={candidate.id} type="button" onClick={() => setChoices((current) => ({ ...current, [position.id]: candidate.id }))} className={cn("rounded-xl border p-4 text-left transition", selected ? "border-primary bg-blue-50 ring-2 ring-primary/10" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50")}><div className="flex items-center gap-3"><span className={cn("flex size-10 items-center justify-center rounded-full text-xs font-bold", selected ? "bg-primary text-white" : "bg-slate-100 text-slate-600")}>{candidate.first_name?.[0]}{candidate.last_name?.[0]}</span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-slate-950">{memberName(candidate)}</span><span className="block truncate text-xs text-slate-500">{candidate.major || "Club member"}{candidate.academic_year ? ` · ${candidate.academic_year}` : ""}</span></span>{selected && <Check className="size-5 text-primary" />}</div>{candidate.statement && <span className="mt-4 block text-sm leading-relaxed text-slate-600">{candidate.statement}</span>}</button>;
          })}</div>
          <div className="mt-5 flex justify-end"><Button disabled={pending || !choices[position.id]} onClick={() => save(position.id)}><Vote className="size-4" />{pendingPosition === position.id ? "Saving..." : position.candidates.some((candidate) => candidate.selected) ? "Update vote" : "Save vote"}</Button></div>
        </section>
      ))}
    </div>
  );
}
