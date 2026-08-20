"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncementAction } from "../actions";
import type { AdminAnnouncement } from "../types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AnnouncementsAdminClient({
  clubId,
  clubName,
  announcements,
}: {
  clubId: string;
  clubName: string;
  announcements: AdminAnnouncement[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetComposer() {
    setTitle("");
    setBody("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const result = await createAnnouncementAction(clubId, { title, body });
      if ("errorMessage" in result) {
        toast.error(result.errorMessage);
        return;
      }

      toast.success("Announcement sent.");
      setOpen(false);
      resetComposer();
      router.refresh();
    } catch {
      toast.error("The announcement could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
            In-app updates
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Announcements.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Share public updates with everyone following {clubName}.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen && !submitting) resetComposer();
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
              <Send className="size-4" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto border-slate-200 p-0 sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader className="border-b border-slate-200 px-5 py-5 pr-12 sm:px-6">
                <DialogTitle className="text-xl text-slate-950">Compose announcement</DialogTitle>
                <DialogDescription>
                  This will be published immediately as a public in-app announcement.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-2">
                  <Label htmlFor="announcement-title" className="text-sm font-semibold text-slate-800">
                    Subject
                  </Label>
                  <Input
                    id="announcement-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Give your announcement a clear title…"
                    maxLength={180}
                    required
                    autoFocus
                    className="h-11 border-slate-200"
                  />
                  <p className="text-right text-xs text-slate-400">{title.length}/180</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-body" className="text-sm font-semibold text-slate-800">
                    Message
                  </Label>
                  <Textarea
                    id="announcement-body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Write your update…"
                    maxLength={10_000}
                    required
                    className="min-h-44 resize-y border-slate-200 leading-relaxed"
                  />
                  <p className="text-right text-xs text-slate-400">{body.length.toLocaleString()}/10,000</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Public audience</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Visible to everyone on the club page.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 items-center justify-center rounded bg-blue-600 text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">In-app delivery</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Published now; email and SMS are not enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="size-4" />
                  {submitting ? "Sending…" : "Send now"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="border-b-2 border-blue-600 px-3 pb-3 text-sm font-semibold text-blue-700">
          Recent announcements
        </span>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600">
          {announcements.length === 100 ? "Latest 100" : `${announcements.length} shown`}
        </Badge>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-blue-50 text-blue-600">
                <Megaphone />
              </EmptyMedia>
              <EmptyTitle>No announcements yet</EmptyTitle>
              <EmptyDescription>
                Compose the first update to share it on the club&apos;s announcement feed.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                  <Bell className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="break-words text-base font-semibold leading-snug text-slate-950">
                        {announcement.title?.trim() || "Untitled announcement"}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className="border-0 bg-slate-900 text-white hover:bg-slate-900">Public</Badge>
                        <time dateTime={announcement.created_at} className="text-xs text-slate-400">
                          Posted {formatDate(announcement.created_at)}
                        </time>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {announcement.body?.trim() || "No message was provided."}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
