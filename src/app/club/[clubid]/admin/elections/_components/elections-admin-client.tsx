"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, History, LockKeyhole, Plus, Trash2, UserRound, Vote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ElectionSnapshot } from "../../../elections/types";
import { memberName } from "../../../elections/types";
import { addCandidateAction, addPositionAction, createElectionAction, finalizeElectionAction, openElectionAction, removeCandidateAction } from "../actions";

function dateLabel(value: string) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function ElectionsAdminClient({ clubId, clubName, snapshot }: { clubId: string; clubName: string; snapshot: ElectionSnapshot }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const election = snapshot.elections[0];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [holderId, setHolderId] = useState("");
  const [positionDescription, setPositionDescription] = useState("");
  const [candidateByPosition, setCandidateByPosition] = useState<Record<string, string>>({});
  const [statementByPosition, setStatementByPosition] = useState<Record<string, string>>({});

  const usedHolders = new Set(election?.positions.map((position) => position.current_holder_id) ?? []);
  const eligibleHolders = snapshot.members.filter((member) =>
    member.title.toLowerCase() !== "member" &&
    !usedHolders.has(member.id) &&
    (snapshot.viewer.is_owner || member.id === snapshot.viewer.id)
  );
  const nominatedIds = useMemo(() => new Set(election?.positions.flatMap((position) => position.candidates.map((candidate) => candidate.user_id)) ?? []), [election]);

  function run(action: () => Promise<{ success: true } | { errorMessage: string }>, successMessage: string, reset?: () => void) {
    startTransition(async () => {
      const result = await action();
      if ("errorMessage" in result) {
        toast.error(result.errorMessage);
      } else {
        toast.success(successMessage);
        reset?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Governance</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Elections<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-slate-500">Create a fair officer transition for {clubName}.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link href={`/club/${clubId}/elections/history`}><History className="size-4" />Past elections</Link></Button>
          {snapshot.viewer.is_owner && election && (
            <Button
              disabled={pending}
              variant="destructive"
              onClick={() => {
                const message = election.status === "active"
                  ? "End this election, archive it in election history, and apply the winning role changes? This cannot be undone."
                  : "Archive this election draft? It will be moved to election history and cannot be reopened.";
                if (window.confirm(message)) {
                  run(() => finalizeElectionAction(clubId, election.id), "Election ended and archived");
                }
              }}
            >
              End Election
            </Button>
          )}
        </div>
      </header>

      {!election ? (
        snapshot.viewer.is_owner ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="max-w-2xl"><h2 className="text-xl font-bold text-slate-950">Host a new election</h2><p className="mt-2 text-sm text-slate-500">Create the cycle first. Current position holders can then describe their role and nominate candidates.</p></div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">Election name<Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Spring 2027 officer election" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">Voting closes<Input type="datetime-local" value={closesAt} onChange={(event) => setClosesAt(event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 sm:col-span-2">Description<Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What members should know about this election" /></label>
            </div>
            <Button disabled={pending} className="mt-6" onClick={() => run(() => createElectionAction(clubId, { title, description, closesAt }), "Election created")}>Create election</Button>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Vote className="mx-auto size-8 text-slate-300" /><h2 className="mt-4 font-bold text-slate-900">No election is being prepared</h2><p className="mt-2 text-sm text-slate-500">The club owner can create the next election cycle.</p></div>
        )
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl bg-[#132A67] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{election.status === "draft" ? "Election setup" : "Active election"}</p><h2 className="mt-2 text-2xl font-extrabold">{election.title}</h2><p className="mt-2 max-w-2xl text-sm text-blue-100">{election.description || `Voting closes ${dateLabel(election.closes_at)}.`}</p></div>
              <div className="flex gap-6"><div><p className="text-2xl font-extrabold">{election.positions.length}</p><p className="text-xs text-blue-200">Positions</p></div><div><p className="text-2xl font-extrabold text-cyan-300">{election.ballots_cast}</p><p className="text-xs text-blue-200">Ballots cast</p></div><div><p className="text-2xl font-extrabold">{election.eligible_voters}</p><p className="text-xs text-blue-200">Eligible voters</p></div></div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5 text-sm text-blue-100"><Clock3 className="size-4" />Closes {dateLabel(election.closes_at)}<span className="flex-1" />{election.status === "active" && <Button variant="secondary" asChild><Link href={`/club/${clubId}/elections/${election.id}/vote`}>View ballot<ArrowRight className="size-4" /></Link></Button>}{snapshot.viewer.is_owner && election.status === "draft" && <Button disabled={pending} className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" onClick={() => run(() => openElectionAction(clubId, election.id), "Voting is now open")}>Open voting</Button>}</div>
          </section>

          {election.status === "active" && <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800"><LockKeyhole className="mt-0.5 size-4 shrink-0" /><div><strong>Results stay locked while voting is active.</strong><p className="mt-1 text-blue-700">Only turnout is shown. Finalizing applies each uncontested winner to the corresponding club role; ties retain the current holder.</p></div></div>}

          <div className="mt-6 space-y-5">
            {election.positions.map((position, index) => {
              const availableCandidates = snapshot.members.filter((member) => !nominatedIds.has(member.id));
              return (
                <section key={position.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><div className="max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-wider text-primary">Position {index + 1} of {election.positions.length}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{position.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{position.description}</p><p className="mt-3 text-xs text-slate-400">Prepared by current holder {position.current_holder_name}</p></div><span className="h-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-primary">{position.candidates.length} candidates</span></div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{position.candidates.map((candidate) => <article key={candidate.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{candidate.first_name?.[0]}{candidate.last_name?.[0]}</span><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900">{memberName(candidate)}</p><p className="truncate text-xs text-slate-500">{candidate.major || "Member"}{candidate.academic_year ? ` · ${candidate.academic_year}` : ""}</p></div>{position.can_manage && election.status === "draft" && <button disabled={pending} aria-label={`Remove ${memberName(candidate)}`} className="text-slate-400 hover:text-rose-600" onClick={() => run(() => removeCandidateAction(clubId, candidate.id), "Candidate removed")}><Trash2 className="size-4" /></button>}</div>{candidate.statement && <p className="mt-3 text-sm leading-relaxed text-slate-600">{candidate.statement}</p>}</article>)}</div>
                  {position.can_manage && election.status === "draft" && availableCandidates.length > 0 && <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[minmax(180px,0.7fr)_minmax(260px,1.3fr)_auto] sm:items-end"><label className="space-y-1.5 text-xs font-bold text-slate-600">Candidate<select value={candidateByPosition[position.id] ?? ""} onChange={(event) => setCandidateByPosition((current) => ({ ...current, [position.id]: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium"><option value="">Select a member</option>{availableCandidates.map((member) => <option key={member.id} value={member.id}>{memberName(member)} · {member.title}</option>)}</select></label><label className="space-y-1.5 text-xs font-bold text-slate-600">Candidate statement<Input value={statementByPosition[position.id] ?? ""} onChange={(event) => setStatementByPosition((current) => ({ ...current, [position.id]: event.target.value }))} placeholder="Why they are running" /></label><Button disabled={pending || !candidateByPosition[position.id]} onClick={() => run(() => addCandidateAction(clubId, position.id, candidateByPosition[position.id] ?? "", statementByPosition[position.id] ?? ""), "Candidate added", () => { setCandidateByPosition((current) => ({ ...current, [position.id]: "" })); setStatementByPosition((current) => ({ ...current, [position.id]: "" })); })}><Plus className="size-4" />Add</Button></div>}
                </section>
              );
            })}
          </div>

          {election.status === "draft" && eligibleHolders.length > 0 && <section className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary"><UserRound className="size-5" /></span><div><h3 className="font-bold text-slate-950">Add a position card</h3><p className="mt-1 text-sm text-slate-500">The current holder describes what the next person in their position will be responsible for.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-[minmax(200px,0.6fr)_minmax(280px,1.4fr)_auto] sm:items-end"><label className="space-y-1.5 text-xs font-bold text-slate-600">Current position holder<select value={holderId} onChange={(event) => setHolderId(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium"><option value="">Select a role</option>{eligibleHolders.map((member) => <option key={member.id} value={member.id}>{member.title} · {memberName(member)}</option>)}</select></label><label className="space-y-1.5 text-xs font-bold text-slate-600">Responsibilities<Textarea className="min-h-10" value={positionDescription} onChange={(event) => setPositionDescription(event.target.value)} placeholder="Describe what the incoming officer will own" /></label><Button disabled={pending || !holderId || !positionDescription.trim()} onClick={() => run(() => addPositionAction(clubId, election.id, holderId, positionDescription), "Position added", () => { setHolderId(""); setPositionDescription(""); })}><Plus className="size-4" />Add position</Button></div></section>}
        </>
      )}
    </div>
  );
}
