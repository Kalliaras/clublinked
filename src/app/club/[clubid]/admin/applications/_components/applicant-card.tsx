"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";
import { toast } from "sonner";
import { updateSubmissionStatusAction } from "../../actions";

export type Submission = {
  id: string;
  status: string;
  submitted_at: string;
  student: {
    first_name: string | null;
    last_name: string | null;
    major: string | null;
    academic_year: string | null;
  };
};

type ApplicantCardProps = {
  submission: Submission;
  clubId: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
};

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];

function getAvatarColor(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join("");
}

function getFullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type MenuOption = {
  label: string;
  newStatus: "pending" | "interview" | "accepted" | "rejected";
  color: string;
};

function getMenuOptions(status: string): MenuOption[] {
  switch (status) {
    case "pending":
      return [
        { label: "Move to Interview", newStatus: "interview", color: "text-violet-600" },
        { label: "Accept", newStatus: "accepted", color: "text-emerald-600" },
        { label: "Reject", newStatus: "rejected", color: "text-red-500" },
      ];
    case "interview":
      return [
        { label: "Accept", newStatus: "accepted", color: "text-emerald-600" },
        { label: "Reject", newStatus: "rejected", color: "text-red-500" },
        { label: "Move back to Submitted", newStatus: "pending", color: "text-slate-600" },
      ];
    case "accepted":
      return [
        { label: "Move to Interview", newStatus: "interview", color: "text-violet-600" },
        { label: "Reject", newStatus: "rejected", color: "text-red-500" },
      ];
    case "rejected":
      return [
        { label: "Move to Submitted", newStatus: "pending", color: "text-slate-600" },
        { label: "Move to Interview", newStatus: "interview", color: "text-violet-600" },
      ];
    default:
      return [];
  }
}

export default function ApplicantCard({
  submission,
  clubId,
  isMenuOpen,
  onToggleMenu,
}: ApplicantCardProps) {
  const fullName = getFullName(submission.student.first_name, submission.student.last_name);
  const initials = getInitials(submission.student.first_name, submission.student.last_name);
  const avatarColor = getAvatarColor(fullName);
  const meta = [submission.student.major, submission.student.academic_year]
    .filter(Boolean)
    .join(" · ");
  const menuOptions = getMenuOptions(submission.status);

  const borderClass =
    submission.status === "accepted"
      ? "border-emerald-200"
      : submission.status === "rejected"
      ? "border-red-200"
      : "border-slate-200";

  const handleStatusChange = async (
    newStatus: "pending" | "interview" | "accepted" | "rejected"
  ) => {
    const res = await updateSubmissionStatusAction(submission.id, newStatus, clubId);
    if (res?.errorMessage) {
      toast.error(res.errorMessage);
    } else {
      onToggleMenu();
      toast.success("Status updated");
    }
  };

  return (
    <div className={cn("bg-white border rounded-xl px-3 py-3 relative", borderClass)}>
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 select-none",
            avatarColor.bg,
            avatarColor.text
          )}
        >
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
            {fullName}
          </p>
          {meta && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{meta}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatRelativeTime(submission.submitted_at)}
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-7 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[190px]">
              {menuOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.newStatus}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors",
                    opt.color
                  )}
                  onClick={() => handleStatusChange(opt.newStatus)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
