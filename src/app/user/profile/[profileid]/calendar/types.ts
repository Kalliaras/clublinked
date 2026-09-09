export type StudentCalendarEvent = {
  id: string;
  club_id: string;
  club_name: string | null;
  club_image: string | null;
  title: string | null;
  description: string | null;
  time: string;
  event_type: string;
  status: string;
  location: string | null;
};

export type StudentCalendarData = {
  events: StudentCalendarEvent[];
  event_types: string[];
  clubs: Array<{ id: string; name: string | null; club_image: string | null }>;
};
