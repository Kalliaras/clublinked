export type EventVisibility = "public" | "members_only";

export type ClubEvent = {
  id: string;
  club_id: string;
  title: string | null;
  description: string | null;
  time: string;
  event_type: string | null;
  status: EventVisibility;
  location: string | null;
};

export type EventInput = {
  title: string;
  description: string;
  time: string;
  eventType: string;
  status: EventVisibility;
  location: string;
};

export type EventActionResult = { success: true } | { errorMessage: string };
