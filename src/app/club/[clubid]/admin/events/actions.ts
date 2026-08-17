"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { EventActionResult, EventInput } from "./types";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Add an event title.").max(160),
  description: z.string().trim().max(4000),
  time: z.string().min(1, "Choose a date and time."),
  eventType: z.string().trim().min(1, "Add an event type.").max(80),
  status: z.enum(["public", "members_only"]),
  location: z.string().trim().min(1, "Add an event location.").max(300),
});

type AuthorizedClientResult =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; errorMessage: string };

type NormalizedEventResult =
  | {
      ok: true;
      value: {
        title: string;
        description: string | null;
        time: string;
        event_type: string;
        status: "public" | "members_only";
        location: string;
      };
    }
  | { ok: false; errorMessage: string };

async function getAuthorizedClient(clubId: string): Promise<AuthorizedClientResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, errorMessage: "You must be signed in." };

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    return { ok: false, errorMessage: "You do not have permission to manage these events." };
  }

  return { ok: true, supabase };
}

function normalizeInput(input: EventInput): NormalizedEventResult {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errorMessage: parsed.error.issues[0]?.message ?? "Check the event details." };
  }

  const date = new Date(parsed.data.time);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, errorMessage: "Choose a valid event date and time." };
  }

  return {
    ok: true,
    value: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      time: date.toISOString(),
      event_type: parsed.data.eventType,
      status: parsed.data.status,
      location: parsed.data.location,
    },
  };
}

function revalidateEventPages(clubId: string) {
  revalidatePath(`/club/${clubId}/admin/events`);
  revalidatePath(`/club/${clubId}/events`);
  revalidatePath(`/club/${clubId}/overview`);
  revalidatePath(`/club/${clubId}`);
}

export async function createEventAction(
  clubId: string,
  input: EventInput
): Promise<EventActionResult> {
  const normalized = normalizeInput(input);
  if (!normalized.ok) return { errorMessage: normalized.errorMessage };

  const auth = await getAuthorizedClient(clubId);
  if (!auth.ok) return { errorMessage: auth.errorMessage };

  const { error } = await auth.supabase.from("club_events").insert({
    club_id: clubId,
    ...normalized.value,
  });

  if (error) return { errorMessage: error.message };
  revalidateEventPages(clubId);
  return { success: true };
}

export async function updateEventAction(
  clubId: string,
  eventId: string,
  input: EventInput
): Promise<EventActionResult> {
  const normalized = normalizeInput(input);
  if (!normalized.ok) return { errorMessage: normalized.errorMessage };

  const auth = await getAuthorizedClient(clubId);
  if (!auth.ok) return { errorMessage: auth.errorMessage };

  const { data: updatedEvent, error } = await auth.supabase
    .from("club_events")
    .update(normalized.value)
    .eq("id", eventId)
    .eq("club_id", clubId)
    .select("id")
    .maybeSingle();

  if (error) return { errorMessage: error.message };
  if (!updatedEvent) {
    return { errorMessage: "This event no longer exists or could not be updated." };
  }
  revalidateEventPages(clubId);
  return { success: true };
}

export async function deleteEventAction(
  clubId: string,
  eventId: string
): Promise<EventActionResult> {
  const auth = await getAuthorizedClient(clubId);
  if (!auth.ok) return { errorMessage: auth.errorMessage };

  const { data: deletedEvent, error } = await auth.supabase
    .from("club_events")
    .delete()
    .eq("id", eventId)
    .eq("club_id", clubId)
    .select("id")
    .maybeSingle();

  if (error) return { errorMessage: error.message };
  if (!deletedEvent) {
    return { errorMessage: "This event no longer exists or could not be deleted." };
  }
  revalidateEventPages(clubId);
  return { success: true };
}
