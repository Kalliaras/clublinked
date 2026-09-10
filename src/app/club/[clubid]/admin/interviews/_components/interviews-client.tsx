"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Settings,
  Star,
  Users,
  Vote,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";
import { saveInterviewFeedbackAction } from "../actions";
import type {
  AdminInterview,
  AdminInterviewsData,
  ScorecardInput,
} from "../types";

const DISPLAY_TIME_ZONE = "America/Los_Angeles";

function fullName(interview: AdminInterview) {
  return [interview.applicant.first_name, interview.applicant.last_name]
    .filter(Boolean)
    .join(" ") || "Applicant";
}

function initials(interview: AdminInterview) {
  return [interview.applicant.first_name, interview.applicant.last_name]
    .filter(Boolean)
    .map((part) => part![0]?.toUpperCase())
    .join("") || "?";
}

function dateKey(value: string | null) {
  if (!value) return "unscheduled";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(value));
}

function dayLabel(value: string | null) {
  if (!value) return "Unscheduled";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(value));
}

function timeLabel(value: string | null) {
  if (!value) return "Time TBD";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(value));
}

function StarScore({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (score: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} out of 5`}
            onClick={() => onChange(score)}
            className="rounded p-0.5 text-slate-300 transition hover:scale-110 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Star
              className={cn("size-5", value !== null && score <= value && "fill-amber-400 text-amber-400")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Scorecard({
  clubId,
  interview,
}: {
  clubId: string;
  interview: AdminInterview;
}) {
  const router = useRouter();
  const existing = interview.viewer_note;
  const [scorecard, setScorecard] = useState<ScorecardInput>({
    analyticalThinking: existing?.analytical_thinking_score ?? null,
    communication: existing?.communication_score ?? null,
    teamwork: existing?.teamwork_score ?? null,
    cultureFit: existing?.culture_fit_score ?? null,
    recommendation: existing?.recommendation ?? null,
    notes: existing?.notes ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const canSubmit =
    scorecard.analyticalThinking !== null &&
    scorecard.communication !== null &&
    scorecard.teamwork !== null &&
    scorecard.cultureFit !== null &&
    scorecard.recommendation !== null;

  const setScore = (key: keyof ScorecardInput, value: number) => {
    setScorecard((current) => ({ ...current, [key]: value }));
  };

  const save = (submit: boolean) => {
    startTransition(async () => {
      const result = await saveInterviewFeedbackAction(
        clubId,
        interview.id,
        scorecard,
        submit
      );
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      toast.success(submit ? "Feedback submitted." : "Draft saved.");
      router.refresh();
    });
  };

  return (
    <aside className="overflow-hidden rounded-[20px] border border-slate-200 bg-white lg:sticky lg:top-6">
      <div className="border-b border-slate-100 p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
          Round {interview.interview_round} interview
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {initials(interview)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-950">{fullName(interview)}</h2>
            <p className="truncate text-sm text-slate-500">
              {[interview.applicant.major, interview.applicant.academic_year]
                .filter(Boolean)
                .join(" · ") || "Academic details unavailable"}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <Clock3 className="size-4 text-slate-400" />
            {interview.interview_time
              ? `${dayLabel(interview.interview_time)} at ${timeLabel(interview.interview_time)}`
              : "Interview time not scheduled"}
          </p>
          {interview.applicant.email && (
            <p className="flex items-center gap-2 truncate">
              <Mail className="size-4 shrink-0 text-slate-400" />
              {interview.applicant.email}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scorecard</h3>
          <div className="mt-2">
            <StarScore
              label="Analytical thinking"
              value={scorecard.analyticalThinking}
              onChange={(value) => setScore("analyticalThinking", value)}
            />
            <StarScore
              label="Communication"
              value={scorecard.communication}
              onChange={(value) => setScore("communication", value)}
            />
            <StarScore
              label="Teamwork"
              value={scorecard.teamwork}
              onChange={(value) => setScore("teamwork", value)}
            />
            <StarScore
              label="Culture fit"
              value={scorecard.cultureFit}
              onChange={(value) => setScore("cultureFit", value)}
            />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommendation</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["advance", "maybe", "reject"] as const).map((recommendation) => (
              <button
                key={recommendation}
                type="button"
                aria-pressed={scorecard.recommendation === recommendation}
                onClick={() => setScorecard((current) => ({ ...current, recommendation }))}
                className={cn(
                  "rounded-xl border px-2 py-2.5 text-xs font-bold capitalize transition",
                  scorecard.recommendation === recommendation
                    ? recommendation === "advance"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : recommendation === "reject"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {recommendation}
              </button>
            ))}
          </div>
        </section>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interview notes
          </span>
          <textarea
            value={scorecard.notes}
            maxLength={10_000}
            onChange={(event) => setScorecard((current) => ({ ...current, notes: event.target.value }))}
            placeholder="What stood out, what concerned you, and any context the next reviewer needs."
            className="mt-3 min-h-32 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>
      </div>

      <div className="flex gap-2 border-t border-slate-100 bg-slate-50 p-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl"
          disabled={isPending}
          onClick={() => save(existing?.is_submitted ?? false)}
        >
          {existing?.is_submitted ? "Save changes" : "Save draft"}
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-xl"
          disabled={isPending || !canSubmit}
          onClick={() => save(true)}
        >
          <Check className="size-4" />
          {existing?.is_submitted ? "Update feedback" : "Submit feedback"}
        </Button>
      </div>
    </aside>
  );
}

function InterviewStatus({ interview, nowMs }: { interview: AdminInterview; nowMs: number }) {
  if (interview.submitted_feedback_count > 0) {
    return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Scored</span>;
  }
  if (interview.interview_time && new Date(interview.interview_time).getTime() <= nowMs) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Awaiting score</span>;
  }
  return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">Scheduled</span>;
}

export default function InterviewsClient({
  clubId,
  data,
  now,
}: {
  clubId: string;
  data: AdminInterviewsData;
  now: string;
}) {
  const adminBase = `/club/${clubId}/admin`;
  const [activeRound, setActiveRound] = useState(data.rounds[0] ?? 1);
  const roundInterviews = useMemo(
    () => data.interviews.filter((interview) => interview.interview_round === activeRound),
    [activeRound, data.interviews]
  );
  const [selectedInterviewId, setSelectedInterviewId] = useState(
    data.interviews.find((interview) => interview.interview_round === activeRound)?.id ?? null
  );
  const selectedInterview =
    roundInterviews.find((interview) => interview.id === selectedInterviewId) ??
    roundInterviews[0] ??
    null;
  const nowMs = new Date(now).getTime();

  const groupedInterviews = useMemo(() => {
    const groups = new Map<string, AdminInterview[]>();
    for (const interview of roundInterviews) {
      const key = dateKey(interview.interview_time);
      groups.set(key, [...(groups.get(key) ?? []), interview]);
    }
    return Array.from(groups.values());
  }, [roundInterviews]);

  const scored = roundInterviews.filter((interview) => interview.submitted_feedback_count > 0).length;
  const awaitingScore = roundInterviews.filter(
    (interview) =>
      interview.submitted_feedback_count === 0 &&
      interview.interview_time &&
      new Date(interview.interview_time).getTime() <= nowMs
  ).length;

  const navItems = [
    { href: adminBase, label: "Dashboard", icon: LayoutDashboard },
    { href: `${adminBase}/applications`, label: "Applications", icon: FileText },
    { href: `${adminBase}/interviews`, label: "Interviews", icon: CalendarClock },
    { href: `${adminBase}/projects`, label: "Projects", icon: Wrench },
    { href: `${adminBase}/members`, label: "Members", icon: Users },
    { href: `${adminBase}/events`, label: "Events", icon: CalendarDays },
    { href: `${adminBase}/announcements`, label: "Announcements", icon: Bell },
    { href: `${adminBase}/elections`, label: "Elections", icon: Vote },
    { href: `${adminBase}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <div className="clublinked-page-background flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white">
        <div className="px-5 pb-4 pt-6">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-primary">
            <Logo size={36} />
            <span>ClubLinked</span>
          </Link>
        </div>
        <div className="relative px-3 pb-4">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Managing</p>
                <p className="truncate text-sm font-semibold text-slate-900">{data.club.name}</p>
              </div>
              <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
            </summary>
            {data.admin_clubs.length > 1 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {data.admin_clubs.map((club) => (
                  <Link
                    key={club.club_id}
                    href={`/club/${club.club_id}/admin/interviews`}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium hover:bg-slate-50",
                      club.club_id === clubId ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    )}
                  >
                    {club.name || "Unnamed club"}
                  </Link>
                ))}
              </div>
            )}
          </details>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === `${adminBase}/interviews`;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("size-4", active ? "text-blue-600" : "text-slate-400")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="ml-[260px] min-h-screen min-w-0 flex-1 px-8 py-9">
        <div className="mx-auto max-w-6xl">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Interviews<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              {data.application_title
                ? `${data.application_title} recruitment cycle.`
                : "Review scheduled candidates and submit structured feedback."}
            </p>
          </header>

          {data.rounds.length > 0 ? (
            <>
              <div className="mt-7 flex gap-1 border-b border-slate-200">
                {data.rounds.map((round) => {
                  const count = data.interviews.filter((item) => item.interview_round === round).length;
                  return (
                    <button
                      key={round}
                      type="button"
                      onClick={() => {
                        setActiveRound(round);
                        setSelectedInterviewId(
                          data.interviews.find((item) => item.interview_round === round)?.id ?? null
                        );
                      }}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-3 text-sm font-semibold",
                        activeRound === round ? "text-primary" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Round {round}
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px]", activeRound === round ? "bg-blue-50" : "bg-slate-100")}>
                        {count}
                      </span>
                      {activeRound === round && <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded bg-primary" />}
                    </button>
                  );
                })}
              </div>

              <section className="mt-7 grid gap-6 rounded-[20px] border border-slate-200 bg-white p-6 md:grid-cols-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active round</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Round {activeRound}</h2>
                  <p className="mt-1 text-sm text-slate-500">{roundInterviews.length} candidates</p>
                </div>
                <div className="border-slate-100 md:border-l md:pl-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">{roundInterviews.filter((item) => item.interview_time).length}</p>
                  <p className="mt-1 text-xs text-slate-500">interviews</p>
                </div>
                <div className="border-slate-100 md:border-l md:pl-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scored</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600">{scored}</p>
                  <p className="mt-1 text-xs text-slate-500">interviews</p>
                </div>
                <div className="border-slate-100 md:border-l md:pl-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Awaiting score</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-600">{awaitingScore}</p>
                  <p className="mt-1 text-xs text-slate-500">interviews</p>
                </div>
              </section>

              <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
                <div>
                  {groupedInterviews.map((interviews) => (
                    <section key={dateKey(interviews[0]?.interview_time ?? null)} className="mb-7">
                      <div className="mb-3 flex items-baseline gap-3 border-b border-slate-200 pb-2">
                        <h2 className="font-bold text-slate-900">{dayLabel(interviews[0]?.interview_time ?? null)}</h2>
                        <span className="text-xs text-slate-500">{interviews.length} interviews</span>
                      </div>
                      <div className="space-y-2.5">
                        {interviews.map((interview) => (
                          <button
                            key={interview.id}
                            type="button"
                            onClick={() => setSelectedInterviewId(interview.id)}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition hover:border-transparent hover:shadow-md",
                              selectedInterview?.id === interview.id
                                ? "border-primary bg-blue-50/50"
                                : "border-slate-200"
                            )}
                          >
                            <div className="w-20 shrink-0">
                              <p className="text-sm font-bold text-slate-900">{timeLabel(interview.interview_time)}</p>
                              <p className="text-[11px] text-slate-400">Round {interview.interview_round}</p>
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                              {initials(interview)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-900">{fullName(interview)}</p>
                              <p className="truncate text-xs text-slate-500">
                                {[interview.applicant.major, interview.applicant.academic_year].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                            <InterviewStatus interview={interview} nowMs={nowMs} />
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                {selectedInterview && (
                  <Scorecard key={selectedInterview.id} clubId={clubId} interview={selectedInterview} />
                )}
              </div>
            </>
          ) : (
            <section className="mt-8 rounded-[20px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-primary">
                <MessageSquareText className="size-5" />
              </span>
              <h2 className="mt-4 font-bold text-slate-950">No interview rounds yet</h2>
              <p className="mt-1 text-sm text-slate-500">
                Schedule an applicant from application review to create Round 1.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link href={`${adminBase}/applications`}>Review applications</Link>
              </Button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
