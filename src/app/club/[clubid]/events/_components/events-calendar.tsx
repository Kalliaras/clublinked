"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export type ClubEvent = {
  id: string;
  club_id: string;
  title: string | null;
  description: string | null;
  time: string;
  event_type: string | null;
  status: string;
  location: string | null;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EventsCalendar({ events }: { events: ClubEvent[] }) {
  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, ClubEvent[]>();
    for (const event of events) {
      const date = new Date(event.time);
      if (Number.isNaN(date.getTime())) continue;
      const dateKey = getLocalDateKey(date);
      map.set(dateKey, [...(map.get(dateKey) ?? []), event]);
    }
    return map;
  }, [events]);

  if (events.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><CalendarDays /></EmptyMedia>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>There are no events available for your account yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Club Events</h2>
            <p className="text-sm text-slate-600">Tap an event badge to view its details, location, and visibility.</p>
          </div>
          <Calendar defaultMonth={new Date()} eventsByDay={eventsByDay} />
        </div>
      </Card>
    </div>
  );
}
