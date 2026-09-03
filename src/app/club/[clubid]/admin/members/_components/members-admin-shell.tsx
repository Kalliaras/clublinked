import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils/tailwind";

type AdminClub = {
  club_id: string;
  name: string;
};

export function MembersAdminShell({
  clubId,
  clubName,
  adminClubs,
  children,
}: {
  clubId: string;
  clubName: string;
  adminClubs: AdminClub[];
  children: ReactNode;
}) {
  const adminBase = `/club/${clubId}/admin`;
  const navItems = [
    { href: adminBase, label: "Dashboard", icon: LayoutDashboard },
    { href: `${adminBase}/applications`, label: "Applications", icon: FileText },
    { href: `${adminBase}/members`, label: "Members", icon: Users },
    { href: `${adminBase}/events`, label: "Events", icon: CalendarDays },
    { href: `${adminBase}/announcements`, label: "Announcements", icon: Bell },
    { href: `${adminBase}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
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
                    href={`/club/${club.club_id}/admin`}
                    className={cn(
                      "block px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50",
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

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === `${adminBase}/members`;
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

      </aside>

      <main className="ml-[260px] min-h-screen min-w-0 flex-1">
        <div className="px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
