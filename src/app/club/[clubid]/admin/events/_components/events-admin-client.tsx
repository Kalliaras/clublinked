"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  Copy,
  List,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/tailwind";
import { createEventAction, deleteEventAction, updateEventAction } from "../actions";
import type { ClubEvent, EventInput, EventVisibility } from "../types";
import { AddressAutocomplete } from "./address-autocomplete";

const EMPTY_FORM: EventInput = {
  title: "",
  description: "",
  time: "",
  eventType: "",
  status: "public",
  location: "",
};

const EVENT_TYPE_SUGGESTIONS = [
  "Workshop",
  "Hackathon",
  "Social",
  "General meeting",
  "Networking",
  "Speaker event",
];

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function eventToForm(event: ClubEvent): EventInput {
  return {
    title: event.title ?? "",
    description: event.description ?? "",
    time: toDateTimeLocal(event.time),
    eventType: event.event_type ?? "",
    status: event.status,
    location: event.location ?? "",
  };
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function EventEditor({
  open,
  onOpenChange,
  clubId,
  event,
  duplicate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  event: ClubEvent | null;
  duplicate: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<EventInput>(EMPTY_FORM);

  React.useEffect(() => {
    if (!open) return;
    setForm(event ? eventToForm(event) : EMPTY_FORM);
  }, [event, open]);

  const isEditing = Boolean(event && !duplicate);
  const heading = isEditing ? "Edit event" : duplicate ? "Duplicate event" : "Create event";

  function update<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(eventObject: React.FormEvent<HTMLFormElement>) {
    eventObject.preventDefault();
    startTransition(async () => {
      const result = isEditing && event
        ? await updateEventAction(clubId, event.id, form)
        : await createEventAction(clubId, form);

      if ("errorMessage" in result) {
        toast.error(result.errorMessage);
        return;
      }

      toast.success(isEditing ? "Event updated." : "Event created.");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>
              Add the details members need to find and understand this event.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(eventInput) => update("title", eventInput.target.value)}
                placeholder="Intro to machine learning"
                maxLength={160}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={form.description}
                onChange={(eventInput) => update("description", eventInput.target.value)}
                placeholder="What should attendees expect?"
                maxLength={4000}
                rows={4}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="event-time">Date and time</Label>
                <Input
                  id="event-time"
                  type="datetime-local"
                  value={form.time}
                  onChange={(eventInput) => update("time", eventInput.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-type">Event type</Label>
                <Input
                  id="event-type"
                  list="event-type-suggestions"
                  value={form.eventType}
                  onChange={(eventInput) => update("eventType", eventInput.target.value)}
                  placeholder="Workshop, hackathon…"
                  maxLength={80}
                  required
                />
                <datalist id="event-type-suggestions">
                  {EVENT_TYPE_SUGGESTIONS.map((type) => <option key={type} value={type} />)}
                </datalist>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-location">Location</Label>
              <AddressAutocomplete
                id="event-location"
                clubId={clubId}
                value={form.location}
                onChange={(value) => update("location", value)}
                required
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-slate-900">Who can see this event?</legend>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["public", "Public", "Visible to everyone"],
                  ["members_only", "Members only", "Visible to club members"],
                ] as const).map(([value, label, description]) => (
                  <label
                    key={value}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-colors",
                      form.status === value
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={value}
                      checked={form.status === value}
                      onChange={() => update("status", value as EventVisibility)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-900">{label}</span>
                    <span className="block text-xs text-slate-500">{description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventCard({
  event,
  clubName,
  past,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  event: ClubEvent;
  clubName: string;
  past: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const date = new Date(event.time);
  return (
    <article className={cn("flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start sm:p-5", past && "opacity-70")}>
      <div className="flex shrink-0 items-center gap-3 sm:w-12 sm:flex-col sm:gap-0 sm:text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
          {date.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-2xl font-extrabold leading-none text-slate-900">{date.getDate()}</span>
      </div>
      <div className="hidden self-stretch border-l border-slate-200 sm:block" />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            {event.event_type || "Event"}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            {event.status === "members_only" ? "Members only" : "Public"}
          </Badge>
        </div>
        <h2 className="text-[15px] font-bold text-slate-950">{event.title || "Untitled event"}</h2>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{formatEventTime(event.time)}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{event.location || "Location TBD"}</span>
        </div>
        {event.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>}
        <p className="mt-2 text-xs text-slate-500">Hosted by <strong className="text-slate-700">{clubName}</strong></p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
        {!past && (
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="size-3.5" /> Edit</Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDuplicate}><Copy className="size-3.5" /> Duplicate</Button>
        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete}>
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </article>
  );
}

export function EventsAdminClient({
  clubId,
  clubName,
  events,
}: {
  clubId: string;
  clubName: string;
  events: ClubEvent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<ClubEvent | null>(null);
  const [duplicate, setDuplicate] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<ClubEvent | null>(null);
  const now = Date.now();
  const upcoming = events.filter((event) => new Date(event.time).getTime() >= now);
  const past = events.filter((event) => new Date(event.time).getTime() < now).reverse();

  function openCreate() {
    setSelectedEvent(null);
    setDuplicate(false);
    setEditorOpen(true);
  }

  function openEdit(event: ClubEvent) {
    setSelectedEvent(event);
    setDuplicate(false);
    setEditorOpen(true);
  }

  function openDuplicate(event: ClubEvent) {
    setSelectedEvent(event);
    setDuplicate(true);
    setEditorOpen(true);
  }

  function confirmDelete() {
    if (!eventToDelete) return;
    startTransition(async () => {
      const result = await deleteEventAction(clubId, eventToDelete.id);
      if ("errorMessage" in result) {
        toast.error(result.errorMessage);
        return;
      }
      toast.success("Event deleted.");
      setEventToDelete(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Admin</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Events.</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage events for {clubName}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-slate-200 bg-white p-1 sm:flex">
            <Button variant="secondary" size="sm" className="h-8 shadow-none"><List className="size-4" />List</Button>
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link href={`/club/${clubId}/events`}><CalendarDays className="size-4" />Calendar</Link>
            </Button>
          </div>
          <Button onClick={openCreate}><Plus className="size-4" />Create event</Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-blue-50 text-blue-600"><CalendarDays className="size-5" /></div>
          <h2 className="mt-4 font-bold text-slate-900">No events yet</h2>
          <p className="mt-1 text-sm text-slate-500">Create the first event for your club.</p>
          <Button className="mt-5" onClick={openCreate}><Plus className="size-4" />Create event</Button>
        </div>
      ) : (
        <div className="space-y-8">
          <section aria-labelledby="upcoming-events-heading">
            <h2 id="upcoming-events-heading" className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Upcoming · {upcoming.length} {upcoming.length === 1 ? "event" : "events"}
            </h2>
            {upcoming.length ? (
              <div className="space-y-2.5">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} clubName={clubName} past={false} onEdit={() => openEdit(event)} onDuplicate={() => openDuplicate(event)} onDelete={() => setEventToDelete(event)} />
                ))}
              </div>
            ) : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No upcoming events.</p>}
          </section>

          {past.length > 0 && (
            <section aria-labelledby="past-events-heading">
              <h2 id="past-events-heading" className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Past · {past.length} {past.length === 1 ? "event" : "events"}
              </h2>
              <div className="space-y-2.5">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} clubName={clubName} past onEdit={() => openEdit(event)} onDuplicate={() => openDuplicate(event)} onDelete={() => setEventToDelete(event)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <EventEditor open={editorOpen} onOpenChange={setEditorOpen} clubId={clubId} event={selectedEvent} duplicate={duplicate} />

      <AlertDialog open={Boolean(eventToDelete)} onOpenChange={(open) => !open && !isPending && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              “{eventToDelete?.title || "Untitled event"}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Keep event</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={(event) => { event.preventDefault(); confirmDelete(); }} className="bg-red-600 hover:bg-red-700">
              {isPending ? "Deleting…" : "Delete event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
