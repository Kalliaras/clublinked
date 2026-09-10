"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";
import type { StudentCalendarData, StudentCalendarEvent } from "../types";

const CAMPUS_TIME_ZONE = "America/Los_Angeles";
const eventColors = [
  "border-blue-500 bg-blue-50 text-blue-800",
  "border-amber-500 bg-amber-50 text-amber-800",
  "border-violet-500 bg-violet-50 text-violet-800",
  "border-emerald-500 bg-emerald-50 text-emerald-800",
  "border-rose-500 bg-rose-50 text-rose-800",
  "border-cyan-500 bg-cyan-50 text-cyan-800",
];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function eventDateParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { key: `${read("year")}-${read("month")}-${read("day")}`, hour: Number(read("hour")) };
}

function eventTypeColor(eventType: string) {
  let hash = 0;
  for (const character of eventType) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return eventColors[Math.abs(hash) % eventColors.length];
}

function initials(name: string | null) {
  return (name ?? "Club").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function queryHref(current: Record<string, string | null>, key: string, value: string | null) {
  const query = new URLSearchParams();
  for (const [name, entry] of Object.entries(current)) if (entry) query.set(name, entry);
  if (value) query.set(key, value); else query.delete(key);
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "?";
}

function EventCard({ event }: { event: StudentCalendarEvent }) {
  return (
    <Link
      href={`/club/${event.club_id}/events`}
      title={[event.title, event.club_name, event.location].filter(Boolean).join(" · ")}
      className={cn("block min-h-14 overflow-hidden rounded-lg border-l-4 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", eventTypeColor(event.event_type || "Event"))}
    >
      <p className="text-[10px] font-bold opacity-75">
        {new Intl.DateTimeFormat("en-US", { timeZone: CAMPUS_TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(new Date(event.time))}
      </p>
      <p className="line-clamp-2 text-[11px] font-bold leading-tight">{event.title ?? "Untitled event"}</p>
      <p className="mt-1 truncate text-[9px] opacity-70">{event.club_name}</p>
    </Link>
  );
}

export default function StudentCalendar({
  startDate,
  data,
  selectedType,
  selectedClub,
  selectedVisibility,
  initialView,
}: {
  startDate: string;
  data: StudentCalendarData;
  selectedType: string | null;
  selectedClub: string | null;
  selectedVisibility: string | null;
  initialView: "week" | "month";
}) {
  const [view, setView] = useState<"week" | "month">(initialView);
  const start = new Date(startDate);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + index);
    return day;
  });
  const monthAnchor = new Date(start);
  monthAnchor.setUTCDate(monthAnchor.getUTCDate() + 3);
  const firstOfMonth = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), 1));
  const monthGridStart = new Date(firstOfMonth);
  const firstDay = monthGridStart.getUTCDay();
  monthGridStart.setUTCDate(monthGridStart.getUTCDate() - (firstDay === 0 ? 6 : firstDay - 1));
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(monthGridStart);
    day.setUTCDate(day.getUTCDate() + index);
    return day;
  });
  const currentQuery = { date: dateKey(start), type: selectedType, club: selectedClub, visibility: selectedVisibility, view };
  const previousPeriod = view === "week"
    ? new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() - 1, 15));
  const nextPeriod = view === "week"
    ? new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    : new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + 1, 15));

  const filteredEvents = data.events.filter((event) => {
    if (selectedType && event.event_type !== selectedType) return false;
    if (selectedClub && event.club_id !== selectedClub) return false;
    if (selectedVisibility && event.status !== selectedVisibility) return false;
    return true;
  });
  const visibleEvents = filteredEvents.filter((event) => days.some((day) => dateKey(day) === eventDateParts(event.time).key));
  const monthEvents = filteredEvents.filter((event) => monthDays.some((day) => dateKey(day) === eventDateParts(event.time).key));
  const displayedEvents = view === "week" ? visibleEvents : monthEvents;
  const eventHours = visibleEvents.map((event) => eventDateParts(event.time).hour);
  const firstHour = eventHours.length ? Math.min(8, ...eventHours) : 8;
  const lastHour = eventHours.length ? Math.max(20, ...eventHours) : 20;
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => firstHour + index);
  const monthLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(monthAnchor);

  return (
    <main className="clublinked-page-background min-h-screen px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Your campus <span className="text-primary">calendar.</span></h1>
          <p className="mt-3 text-base text-slate-500">{displayedEvents.length} events this {view} across {data.clubs.length} enrolled {data.clubs.length === 1 ? "club" : "clubs"}.</p>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-2 text-xl font-bold text-slate-950">{monthLabel}</h2>
            <Link href={queryHref(currentQuery, "date", dateKey(previousPeriod))} aria-label={`Previous ${view}`} className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ChevronLeft className="size-4" /></Link>
            <Link href={queryHref(currentQuery, "date", null)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50">Today</Link>
            <Link href={queryHref(currentQuery, "date", dateKey(nextPeriod))} aria-label={`Next ${view}`} className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ChevronRight className="size-4" /></Link>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" aria-label="Calendar view">
            <button type="button" onClick={() => setView("week")} aria-pressed={view === "week"} className={cn("rounded-lg px-4 py-2 text-sm font-bold transition", view === "week" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-slate-50")}>Week</button>
            <button type="button" onClick={() => setView("month")} aria-pressed={view === "month"} className={cn("rounded-lg px-4 py-2 text-sm font-bold transition", view === "month" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-slate-50")}>Month</button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {view === "week" ? (
              <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-slate-200">
                  <div />
                  {days.map((day) => {
                    const today = dateKey(day) === eventDateParts(new Date().toISOString()).key;
                    return <div key={dateKey(day)} className={cn("border-l border-slate-100 px-2 py-3 text-center", today && "bg-blue-50")}><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{day.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" })}</p><p className={cn("mt-1 text-lg font-bold", today ? "text-primary" : "text-slate-950")}>{day.getUTCDate()}</p></div>;
                  })}
                </div>
                {hours.map((hour) => (
                  <div key={hour} className="grid min-h-[76px] grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-slate-100 last:border-b-0">
                    <div className="pr-3 pt-2 text-right text-[10px] font-semibold text-slate-400">{new Date(Date.UTC(2020, 0, 1, hour)).toLocaleTimeString("en-US", { timeZone: "UTC", hour: "numeric" })}</div>
                    {days.map((day) => {
                      const events = visibleEvents.filter((event) => {
                        const parts = eventDateParts(event.time);
                        return parts.key === dateKey(day) && parts.hour === hour;
                      });
                      return <div key={dateKey(day)} className="space-y-1 border-l border-slate-100 p-1.5">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>;
                    })}
                  </div>
                ))}
              </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[840px]">
                  <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {monthDays.slice(0, 7).map((day) => (
                      <div key={dateKey(day)} className="border-l border-slate-100 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 first:border-l-0">
                        {day.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" })}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {monthDays.map((day, index) => {
                      const events = monthEvents.filter((event) => eventDateParts(event.time).key === dateKey(day));
                      const today = dateKey(day) === eventDateParts(new Date().toISOString()).key;
                      const inMonth = day.getUTCMonth() === monthAnchor.getUTCMonth();
                      return (
                        <div key={dateKey(day)} className={cn("min-h-32 border-b border-l border-slate-100 p-2", index % 7 === 0 && "border-l-0", !inMonth && "bg-slate-50/70")}>
                          <span className={cn("mb-2 flex size-7 items-center justify-center rounded-full text-xs font-bold", today ? "bg-primary text-white" : inMonth ? "text-slate-800" : "text-slate-400")}>{day.getUTCDate()}</span>
                          <div className="space-y-1">{events.slice(0, 3).map((event) => <EventCard key={event.id} event={event} />)}</div>
                          {events.length > 3 && <p className="mt-1 text-[10px] font-semibold text-slate-500">+{events.length - 3} more</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="h-fit space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Event type</h2>
              <div className="space-y-1.5">
                {data.event_types.length === 0 && <p className="text-xs text-slate-400">No event types yet.</p>}
                {data.event_types.map((eventType) => {
                  const selected = selectedType === eventType;
                  return <Link key={eventType} href={queryHref(currentQuery, "type", selected ? null : eventType)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"><span className={cn("flex size-4 items-center justify-center rounded border", selected ? "border-primary bg-primary text-white" : "border-slate-300")} aria-hidden="true">{selected && "✓"}</span><span className="min-w-0 flex-1 truncate text-slate-700">{eventType}</span><span className="text-xs text-slate-400">{data.events.filter((event) => event.event_type === eventType).length}</span></Link>;
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Clubs</h2>
              <div className="space-y-1.5">{data.clubs.map((club) => {
                const selected = selectedClub === club.id;
                return <Link key={club.id} href={queryHref(currentQuery, "club", selected ? null : club.id)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"><span className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[8px] font-bold text-white">{club.club_image ? <Image src={club.club_image} alt="" fill sizes="24px" className="object-cover" /> : initials(club.name)}</span><span className={cn("min-w-0 flex-1 truncate", selected ? "font-bold text-primary" : "text-slate-700")}>{club.name ?? "Unnamed club"}</span></Link>;
              })}</div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Visibility</h2>
              <div className="space-y-1.5">{[["public", "Public events"], ["members_only", "Members only"]].map(([value, label]) => {
                const selected = selectedVisibility === value;
                return <Link key={value} href={queryHref(currentQuery, "visibility", selected ? null : value)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"><span className={cn("flex size-4 items-center justify-center rounded border", selected ? "border-primary bg-primary text-white" : "border-slate-300")} aria-hidden="true">{selected && "✓"}</span>{label}</Link>;
              })}</div>
            </div>

            {displayedEvents.length === 0 && <div className="rounded-xl bg-slate-50 p-4 text-center"><CalendarDays className="mx-auto size-5 text-slate-400" /><p className="mt-2 text-xs text-slate-500">No events match this {view} and filter.</p></div>}
            {displayedEvents[0] && <div className="border-t border-slate-100 pt-5 text-xs text-slate-500"><p className="flex items-center gap-2"><Clock3 className="size-3.5" />Times shown in Pacific Time</p>{displayedEvents[0].location && <p className="mt-2 flex items-center gap-2"><MapPin className="size-3.5" />Locations open with each club calendar</p>}</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
