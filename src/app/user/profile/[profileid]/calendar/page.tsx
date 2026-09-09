import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import StudentCalendar from "./_components/student-calendar";
import type { StudentCalendarData } from "./types";

function weekStart(dateValue?: string) {
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const readToday = (type: Intl.DateTimeFormatPartTypes) => todayParts.find((part) => part.type === type)?.value ?? "";
  const campusToday = `${readToday("year")}-${readToday("month")}-${readToday("day")}`;
  const selectedDate = dateValue && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : campusToday;
  const parsed = new Date(selectedDate + "T12:00:00.000Z");
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
  return start;
}

export default async function StudentCalendarPage({ params, searchParams }: {
  params: Promise<{ profileid: string }>;
  searchParams: Promise<{ date?: string; type?: string; club?: string; visibility?: string; view?: string }>;
}) {
  const [{ profileid }, query] = await Promise.all([params, searchParams]);
  const start = weekStart(query.date);
  const monthAnchor = new Date(start);
  monthAnchor.setUTCDate(monthAnchor.getUTCDate() + 3);
  const monthGridStart = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), 1));
  const firstDay = monthGridStart.getUTCDay();
  monthGridStart.setUTCDate(monthGridStart.getUTCDate() - (firstDay === 0 ? 6 : firstDay - 1));
  const monthGridEnd = new Date(monthGridStart);
  monthGridEnd.setUTCDate(monthGridEnd.getUTCDate() + 42);
  const queryStart = new Date(monthGridStart.getTime() - 12 * 60 * 60 * 1000);
  const queryEnd = new Date(monthGridEnd.getTime() + 12 * 60 * 60 * 1000);

  const supabase = await createClient();
  const [user, calendarResult] = await Promise.all([
    getUser(),
    supabase.rpc("get_student_calendar", {
      p_profile_id: profileid,
      p_start: queryStart.toISOString(),
      p_end: queryEnd.toISOString(),
    }),
  ]);

  if (!user) redirect("/user/login");
  if (user.id !== profileid) redirect("/user/profile/" + user.id + "/calendar");

  const raw = calendarResult.data;
  const data = raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw as unknown as StudentCalendarData
    : { events: [], event_types: [], clubs: [] };

  return (
    <StudentCalendar
      startDate={start.toISOString()}
      data={data}
      selectedType={query.type ?? null}
      selectedClub={query.club ?? null}
      selectedVisibility={query.visibility ?? null}
      initialView={query.view === "month" ? "month" : "week"}
    />
  );
}
