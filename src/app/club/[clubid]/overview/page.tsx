import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, FolderKanban, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getClubPublicData } from "@/lib/data/club-page";

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
  const { clubid } = await params;
  const publicData = await getClubPublicData(clubid);
  if (!publicData) notFound();

  const { club, events: featuredEvents } = publicData;
  const highlights = club.interests;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">About</h2>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {club.description || "This club has no description yet."}
        </p>
      </Card>

      <Card className="border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Key highlights</h2>
        <div className="mt-4 flex flex-wrap gap-3">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 p-6 lg:col-span-2">
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

        <Card className="border-slate-200 p-6">
          <div className="text-sm font-semibold text-slate-900">Featured Projects</div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            This club has no featured projects yet.
          </p>
        </Card>
      </div>
    </div>
  );
}
