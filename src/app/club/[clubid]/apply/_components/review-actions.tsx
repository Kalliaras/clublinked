"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateSubmissionStatusAction } from "../../admin/actions";

type ReviewStatus = "pending" | "interview" | "accepted" | "rejected";

export default function ReviewActions({
  submissionId,
  clubId,
  applicantName,
}: {
  submissionId: string;
  clubId: string;
  applicantName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewTime, setInterviewTime] = useState("");

  const updateStatus = (status: ReviewStatus, scheduledFor?: string | null) => {
    startTransition(async () => {
      const result = await updateSubmissionStatusAction(
        submissionId,
        status,
        clubId,
        scheduledFor
      );

      if (result?.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }

      setInterviewOpen(false);
      toast.success(
        status === "accepted"
          ? `${applicantName} is now a club member.`
          : status === "rejected"
            ? "Application rejected."
            : scheduledFor
              ? "Interview scheduled."
              : "Application moved to interview."
      );
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-red-200 px-5 text-red-600 hover:bg-red-50 hover:text-red-700"
          disabled={isPending}
          onClick={() => updateStatus("rejected")}
        >
          <X />
          Reject
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-violet-200 px-5 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
          disabled={isPending}
          onClick={() => setInterviewOpen(true)}
        >
          <CalendarClock />
          Interview
        </Button>
        <Button
          type="button"
          className="h-11 rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700"
          disabled={isPending}
          onClick={() => updateStatus("accepted")}
        >
          <Check />
          Accept
        </Button>
      </div>

      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move to interview</DialogTitle>
            <DialogDescription>
              Scheduling is optional. You can assign a date now or leave it blank
              and schedule the interview later.
            </DialogDescription>
          </DialogHeader>

          <label className="grid gap-2 py-2 text-sm font-semibold text-slate-800">
            Interview date and time
            <input
              type="datetime-local"
              value={interviewTime}
              onChange={(event) => setInterviewTime(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <span className="text-xs font-normal text-slate-500">
              Optional — the application will receive interview status either way.
            </span>
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => setInterviewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => updateStatus("interview", interviewTime || null)}
            >
              {isPending
                ? "Saving..."
                : interviewTime
                  ? "Schedule interview"
                  : "Move without scheduling"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
