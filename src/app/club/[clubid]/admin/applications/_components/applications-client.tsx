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
  Search,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils/tailwind";
import ApplicantCard, { type Submission } from "./applicant-card";

type ApplicationsClientProps = {
  clubId: string;
  club: { id: string; name: string; club_image: string | null };
  adminClubs: { club_id: string; name: string; club_image: string | null }[];
  applicationTitle: string | null;
  submissions: Submission[];
  userFirstName: string | null;
  userLastName: string | null;
};

function getInitials(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join("");
}

function getFullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
}

const COLUMNS = [
  { status: "pending", label: "Submitted" },
  { status: "interview", label: "Interview" },
  { status: "accepted", label: "Accepted" },
  { status: "rejected", label: "Rejected" },
] as const;

type ColumnStatus = (typeof COLUMNS)[number]["status"];

function getColumnHeaderClass(status: ColumnStatus): string {
  if (status === "accepted") return "text-emerald-700";
  if (status === "rejected") return "text-red-600";
  return "text-slate-700";
}

export default function ApplicationsClient({
  clubId,
  club,
  adminClubs,
  applicationTitle,
  submissions,
  userFirstName,
  userLastName,
}: ApplicationsClientProps) {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const basePath = `/club/${clubId}`;
  const adminBase = `${basePath}/admin`;

  const isNavActive = (href: string) => {
    const normalized = pathname?.replace(/\/+$/, "") ?? "";
    return normalized === href.replace(/\/+$/, "");
  };

  const navItems = [
    { href: adminBase, label: "Dashboard", icon: LayoutDashboard },
    { href: `${adminBase}/applications`, label: "Applications", icon: FileText },
    { href: `${basePath}/members`, label: "Members", icon: Users },
    { href: `${basePath}/events`, label: "Events", icon: CalendarDays },
    { href: `${basePath}/announcements`, label: "Announcements", icon: Bell },
    { href: `${adminBase}/settings`, label: "Settings", icon: Settings },
  ];

  const filteredSubmissions = search.trim()
    ? submissions.filter((s) => {
        const fullName = [s.student.first_name, s.student.last_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fullName.includes(search.toLowerCase().trim());
      })
    : submissions;

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      {/* Overlay — closes any open card menu when clicking outside */}
      {openMenuId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}

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
            type="button"
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
        <div className="px-8 py-8">
          {/* Page header */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Applications
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {applicationTitle ?? "Application Pipeline"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {submissions.length} candidate
              {submissions.length !== 1 ? "s" : ""} across 4 stages
            </p>
          </div>

          {/* Search toolbar */}
          <div className="mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Kanban board */}
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(({ status, label }) => {
              const colSubmissions = filteredSubmissions.filter(
                (s) => s.status === status
              );
              const headerClass = getColumnHeaderClass(status);

              return (
                <div
                  key={status}
                  className="bg-slate-50 rounded-2xl p-3 flex flex-col gap-2 min-h-[400px]"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className={cn("text-sm font-semibold", headerClass)}>
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5 leading-none">
                      {colSubmissions.length}
                    </span>
                  </div>

                  {/* Cards or empty state */}
                  {colSubmissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                      <Inbox className="h-6 w-6 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400 font-medium">
                        No applicants
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {colSubmissions.map((sub) => (
                        <ApplicantCard
                          key={sub.id}
                          submission={sub}
                          clubId={clubId}
                          isMenuOpen={openMenuId === sub.id}
                          onToggleMenu={() =>
                            setOpenMenuId(
                              openMenuId === sub.id ? null : sub.id
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
