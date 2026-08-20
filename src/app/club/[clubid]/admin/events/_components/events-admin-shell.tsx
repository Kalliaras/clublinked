import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils/tailwind";

type AdminClub = { club_id: string; name: string };

function initials(firstName: string | null, lastName: string | null) {
  return (
    [firstName, lastName]
      .filter(Boolean)
      .map((part) => part![0].toUpperCase())
      .join("") || "?"
  );
}

function AdminNavigation({ clubId, mobile = false }: { clubId: string; mobile?: boolean }) {
  const adminBase = `/club/${clubId}/admin`;
  const navItems = [
    { href: adminBase, label: "Dashboard", icon: LayoutDashboard },
    { href: `${adminBase}/profile`, label: "Profile", icon: UserRound },
    { href: `${adminBase}/applications`, label: "Applications", icon: FileText },
    { href: `${adminBase}/members`, label: "Members", icon: Users },
    { href: `${adminBase}/events`, label: "Events", icon: CalendarDays },
    { href: `${adminBase}/announcements`, label: "Announcements", icon: Bell },
    { href: `${adminBase}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <nav className={cn("flex gap-0.5", mobile ? "flex-col py-2" : "flex-1 flex-col overflow-y-auto px-3 py-2")}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === `${adminBase}/events`;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-blue-50 font-semibold text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon className={cn("size-4 shrink-0", active ? "text-blue-600" : "text-slate-400")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function EventsAdminShell({
  clubId,
  clubName,
  adminClubs,
  userFirstName,
  userLastName,
  children,
}: {
  clubId: string;
  clubName: string;
  adminClubs: AdminClub[];
  userFirstName: string | null;
  userLastName: string | null;
  children: ReactNode;
}) {
  const userName = [userFirstName, userLastName].filter(Boolean).join(" ") || "Admin";

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-slate-200 bg-white md:flex">
        <div className="px-5 pb-4 pt-6">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-primary">
            <Logo size={36} />
            <span>ClubLinked</span>
          </Link>
        </div>

        <div className="relative px-3 pb-4">
          <details className="group relative">
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Managing</p>
                <p className="truncate text-sm font-semibold text-slate-900">{clubName}</p>
              </div>
              <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            {adminClubs.length > 1 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {adminClubs.map((club) => (
                  <Link
                    key={club.club_id}
                    href={`/club/${club.club_id}/admin/events`}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium hover:bg-slate-50",
                      club.club_id === clubId ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    )}
                  >
                    {club.name}
                  </Link>
                ))}
              </div>
            )}
          </details>
        </div>

        <AdminNavigation clubId={clubId} />

        <div className="border-t border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {initials(userFirstName, userLastName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-primary">
          <Logo size={28} />
          <span>ClubLinked</span>
        </Link>
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" /> Menu
          </summary>
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <p className="px-3 pb-1 pt-2 text-xs font-medium text-slate-500">Managing {clubName}</p>
            <AdminNavigation clubId={clubId} mobile />
          </div>
        </details>
      </header>

      <main className="min-h-screen min-w-0 md:ml-[260px]">
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
