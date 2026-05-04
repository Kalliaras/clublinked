"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ClubEvent = {
  id: string;
  club_id: string;
  title: string | null;
  description: string | null;
  time: string;
};

const EVENT_BADGE_LIMIT = 16;

function truncateTitle(title: string) {
  return title.length > EVENT_BADGE_LIMIT
    ? `${title.slice(0, EVENT_BADGE_LIMIT - 1).trimEnd()}…`
    : title;
}

export default function ClubEventsPage() {
  const params = useParams();
  const clubId = params?.clubid as string | undefined;
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!clubId) {
      return;
    }

    const supabase = createClient();

    const loadEvents = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("club_events")
        .select("id, club_id, title, description, time")
        .eq("club_id", clubId)
        .order("time", { ascending: true });

      setEvents((data ?? []) as ClubEvent[]);
      setLoading(false);
    };

    loadEvents();
  }, [clubId]);

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, ClubEvent[]>();

    events.forEach((event) => {
      const date = new Date(event.time);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const dateKey = date.toISOString().slice(0, 10);
      const existing = map.get(dateKey) ?? [];
      existing.push(event);
      map.set(dateKey, existing);
    });

    return map;
  }, [events]);

  if (!clubId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays />
          </EmptyMedia>
          <EmptyTitle>Missing club</EmptyTitle>
          <EmptyDescription>Club ID is required to load events.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (loading) {
    return (
      <Card className="border-slate-200 p-6">
        <p className="text-sm text-slate-700">Loading events…</p>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays />
          </EmptyMedia>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>
            Create events for your club members to see and attend.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">Create Event</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Club Events</h2>
              <p className="text-sm text-slate-600">
                Tap an event badge to view the title and description.
              </p>
            </div>
          </div>

          <Calendar defaultMonth={new Date()} eventsByDay={eventsByDay} />
        </div>
      </Card>
    </div>
  );
}
