import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3, FolderKanban, MapPin, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getClubPublicData } from "@/lib/data/club-page";
import { createClient } from "@/lib/supabase/server";
import type { ElectionSnapshot } from "../elections/types";

function formatEventLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const eventDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function ClubOverviewPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const [{ clubid }, supabase] = await Promise.all([params, createClient()]);
  const [publicData, projectsResult, electionsResult] = await Promise.all([
    getClubPublicData(clubid),
    supabase
      .from("club_projects")
      .select("id, title, description, visibility")
      .eq("club_id", clubid)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.rpc("get_club_election", {
      p_club_id: clubid,
      p_manage: false,
      p_history: false,
    }),
  ]);
  if (!publicData) notFound();

  const { club, events: featuredEvents } = publicData;
  const featuredProjects = projectsResult.data ?? [];
  const electionSnapshot = electionsResult.data as ElectionSnapshot | null;
  const currentElection = electionSnapshot?.elections[0];
  const highlights = club.interests;

  return (
    <div className="space-y-7">
      <Card className="border-slate-200/80 p-6 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-900">About</h2>
        <p className="mt-5 text-sm leading-6 text-slate-700">
          {club.description || "This club has no description yet."}
        </p>
      </Card>

      <Card className="border-slate-200/80 p-6 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-900">Key highlights</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {highlights.length === 0 ? (
            <p className="text-sm leading-6 text-slate-700">
              No key highlights available for this club yet.
            </p>
          ) : (
            highlights.map((highlight) => (
              <Badge
                key={highlight}
                variant="secondary"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                <FolderKanban className="mr-2 h-4 w-4 text-slate-500" />
                {highlight}
              </Badge>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
        {currentElection && (
          <Card className="overflow-hidden border-blue-200 bg-gradient-to-br from-blue-950 to-blue-800 p-0 text-white shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                  <Vote className="size-4" /> Current election
                </div>
                <h2 className="mt-3 text-2xl font-bold">{currentElection.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-blue-100">
                  {currentElection.description || "Voting is open for this club's current election."}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-200">
                  <span>{currentElection.positions.length} position{currentElection.positions.length === 1 ? "" : "s"}</span>
                  <span>{currentElection.ballots_cast} ballot{currentElection.ballots_cast === 1 ? "" : "s"} cast</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />Closes {eventDateFormatter.format(new Date(currentElection.closes_at))}</span>
                </div>
              </div>
              <Link
                href={`/club/${clubid}/elections/${currentElection.id}/vote`}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
              >
                View election <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        )}

        <Card className="border-slate-200/80 p-6 shadow-sm sm:p-7 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Featured Events</div>
              <p className="mt-1 text-xs text-slate-500">Upcoming public events</p>
            </div>
            <Link
              href={`/club/${clubid}/events`}
              className="text-xs font-semibold text-sky-700 transition hover:text-sky-600"
            >
              View calendar
            </Link>
          </div>

          {featuredEvents.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <CalendarDays className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This club has no upcoming public events yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {featuredEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">
                      {formatEventLabel(event.event_type || "Event")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      {formatEventLabel(event.status)}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">
                    {event.title || "Untitled event"}
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <span className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      {eventDateFormatter.format(new Date(event.time))}
                    </span>
                    <span className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      {event.location || "Location to be announced"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card className="border-slate-200/80 p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Featured Projects</div>
              <p className="mt-1 text-xs text-slate-500">Current club initiatives</p>
            </div>
            <Link
              href={`/club/${clubid}/projects`}
              className="text-xs font-semibold text-sky-700 transition hover:text-sky-600"
            >
              View all
            </Link>
          </div>
          {featuredProjects.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <FolderKanban className="mx-auto size-5 text-slate-400" />
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This club has no visible projects yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {featuredProjects.map((project) => (
                <article key={project.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">
                      {project.title || "Untitled project"}
                    </h3>
                    <Badge variant="secondary" className="shrink-0 bg-slate-100 text-[11px] text-slate-600 hover:bg-slate-100">
                      {project.visibility === "members_only" ? "Members only" : "Public"}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
