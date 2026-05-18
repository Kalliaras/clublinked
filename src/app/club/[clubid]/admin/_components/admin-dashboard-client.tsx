"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  CalendarDays,
  Bell,
  Settings,
  ChevronDown,
  Link2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";

type AdminDashboardProps = {
  clubId: string;
  club: { id: string; name: string; club_image: string | null };
  adminClubs: { club_id: string; name: string; club_image: string | null }[];
  metrics: {
    totalApplications: number;
    pendingReview: number;
    interviewsScheduled: number;
    memberCount: number;
  };
  pipelineCounts: {
    pending: number;
    interview: number;
    accepted: number;
    rejected: number;
  };
  recentSubmissions: {
    id: string;
    student: {
      first_name: string | null;
      last_name: string | null;
      major: string | null;
      academic_year: string | null;
    };
    submitted_at: string;
    status: string;
  }[];
  upcomingInterviews: {
    id: string;
    interview_time: string;
    interview_round: number;
    student: { first_name: string | null; last_name: string | null };
  }[];
  userFirstName: string | null;
  userLastName: string | null;
};

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

function formatInterviewTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

export default function AdminDashboardClient({
  clubId,
  club,
  adminClubs,
  metrics,
  pipelineCounts,
  recentSubmissions,
  upcomingInterviews,
  userFirstName,
  userLastName,
}: AdminDashboardProps) {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const basePath = `/club/${clubId}`;
  const adminBase = `${basePath}/admin`;

  const isNavActive = (href: string) => {
    const normalized = pathname?.replace(/\/+$/, "") ?? "";
    return normalized === href.replace(/\/+$/, "");
  };

  const pipelineTotal =
    pipelineCounts.pending +
    pipelineCounts.interview +
    pipelineCounts.accepted +
    pipelineCounts.rejected;

  const pipelineStages = [
    { label: "Submitted", count: pipelineCounts.pending, color: "bg-blue-500" },
    { label: "Interviewing", count: pipelineCounts.interview, color: "bg-violet-500" },
    { label: "Accepted", count: pipelineCounts.accepted, color: "bg-emerald-500" },
    { label: "Rejected", count: pipelineCounts.rejected, color: "bg-red-400" },
  ];

  const metricCards = [
    {
      label: "Total Applications",
      value: metrics.totalApplications,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Review",
      value: metrics.pendingReview,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Interviews Scheduled",
      value: metrics.interviewsScheduled,
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Active Members",
      value: metrics.memberCount,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const navItems = [
    { href: adminBase, label: "Dashboard", icon: LayoutDashboard },
    { href: `${adminBase}/applications`, label: "Applications", icon: FileText },
    { href: `${basePath}/members`, label: "Members", icon: Users },
    { href: `${basePath}/events`, label: "Events", icon: CalendarDays },
    { href: `${basePath}/announcements`, label: "Announcements", icon: Bell },
    { href: `${adminBase}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col fixed top-0 left-0 h-screen z-40">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-base"
          >
            <Link2 className="h-4 w-4" />
            ClubLinked
          </Link>
        </div>

        {/* Club switcher */}
        <div className="px-3 pb-4 relative">
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 transition-colors"
            onClick={() => setSwitcherOpen((prev) => !prev)}
          >
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Managing</p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {club.name}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 shrink-0 transition-transform",
                switcherOpen && "rotate-180"
              )}
            />
          </button>

          {switcherOpen && adminClubs.length > 1 && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              {adminClubs.map((c) => (
                <Link
                  key={c.club_id}
                  href={`/club/${c.club_id}/admin`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors",
                    c.club_id === clubId
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-700"
                  )}
                  onClick={() => setSwitcherOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-blue-600" : "text-slate-400"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Profile chip */}
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 select-none">
              {getInitials(userFirstName, userLastName) || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {getFullName(userFirstName, userLastName)}
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[260px] min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                Admin
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {club.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl">
                Export
              </Button>
              <Button
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-0"
                asChild
              >
                <Link href={`${adminBase}/applications`}>
                  Manage applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {metricCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center mb-4",
                    bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">
                  {value}
                </p>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Pipeline snapshot */}
          {pipelineTotal > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                Application pipeline
              </h2>
              <div className="grid grid-cols-4 gap-6">
                {pipelineStages.map(({ label, count, color }) => {
                  const pct =
                    pipelineTotal > 0 ? (count / pipelineTotal) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="flex items-baseline justify-between mb-2">
                        <p className="text-sm font-medium text-slate-600">
                          {label}
                        </p>
                        <p className="text-lg font-extrabold text-slate-900">
                          {count}
                        </p>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two-column grid */}
          <div className="grid gap-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
            {/* Recent submissions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent applications
                </h2>
                <Link
                  href={`${adminBase}/applications`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    No applications yet
                  </p>
                  <p className="text-xs text-slate-400">
                    New submissions will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 select-none">
                        {getInitials(sub.student.first_name, sub.student.last_name) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {getFullName(sub.student.first_name, sub.student.last_name)}
                        </p>
                        {(sub.student.major || sub.student.academic_year) && (
                          <p className="text-xs text-slate-400 truncate">
                            {[sub.student.major, sub.student.academic_year].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {formatRelativeTime(sub.submitted_at)}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 capitalize",
                        sub.status === "pending" && "text-amber-600 bg-amber-50",
                        sub.status === "interview" && "text-violet-600 bg-violet-50",
                        sub.status === "accepted" && "text-emerald-600 bg-emerald-50",
                        sub.status === "rejected" && "text-red-600 bg-red-50",
                      )}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming interviews */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                Upcoming interviews
              </h2>

              {upcomingInterviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <CalendarDays className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    No interviews scheduled
                  </p>
                  <p className="text-xs text-slate-400">
                    Upcoming interviews will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-xs font-semibold text-blue-600 mb-0.5">
                        {formatInterviewTime(interview.interview_time)}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {getFullName(
                          interview.student.first_name,
                          interview.student.last_name
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        Round {interview.interview_round}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
