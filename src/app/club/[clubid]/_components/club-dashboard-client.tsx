"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { joinClubAction } from "../actions";

function TabLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative px-4 py-4 text-sm font-semibold transition-colors ${
        active ? "text-primary" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 h-[2px] w-full rounded bg-primary" />
      )}
    </Link>
  );
}

export default function ClubDashboardClient({
  clubId,
  clubName,
  clubImageUrl,
  members,
  createdAt,
  universityName,
  isMember,
  isOwner,
  usesApplications,
  children,
}: {
  clubId: string;
  clubName: string | null;
  clubImageUrl?: string | null;
  members: number;
  createdAt: string;
  universityName: string | null;
  isMember: boolean;
  isOwner: boolean;
  usesApplications: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [joining, setJoining] = React.useState(false);
  const basePath = `/club/${clubId}`;

  const isApplyPage = pathname?.startsWith(`${basePath}/apply`) ?? false;

  if (isApplyPage) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    const normalizedPath = pathname?.replace(/\/+$/, "") ?? "";
    const normalizedTarget = path.replace(/\/+$/, "");

    if (normalizedTarget === basePath) {
      return (
        normalizedPath === normalizedTarget ||
        normalizedPath === `${normalizedTarget}/overview`
      );
    }

    return normalizedPath === normalizedTarget;
  };

  const foundedYear = React.useMemo(() => {
    try {
      return new Date(createdAt).getFullYear();
    } catch {
      return "Unknown";
    }
  }, [createdAt]);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Banner ── */}
      <div className="h-[280px] bg-primary relative overflow-hidden">
        {/* dot pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-b from-transparent to-black/40" />
      </div>

      {/* ── Hero ── */}
      <div className="mx-auto w-full max-w-5xl px-16 pt-8 relative">

        {/* Logo + name + actions — all in one bottom-aligned row */}
        <div className="flex items-end gap-7 mb-6">

          {/* Logo */}
          <div className="relative h-[120px] w-[120px] rounded-full border-4 border-white bg-primary shadow-lg shrink-0 overflow-hidden">
            <Image
              src={clubImageUrl ?? "/App_icon_noname.png"}
              alt={clubName ?? "Club logo"}
              fill
              className={clubImageUrl ? "object-cover" : "object-contain p-3"}
              priority
              unoptimized={Boolean(clubImageUrl)}
            />
          </div>

          {/* Name — flex-1, sits next to logo */}
          <div className="flex-1 min-w-0 pb-3">
            {universityName && (
              <p className="text-sm font-medium text-slate-500 mb-2">{universityName}</p>
            )}
            <h1 className="text-[40px] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {clubName}
            </h1>
          </div>

          {/* Action buttons — right side, bottom-aligned */}
          <div className="flex items-center gap-3 pb-3 shrink-0">
            {isOwner ? (
              <Button className="rounded-xl px-7 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white border-0">
                Edit
              </Button>
            ) : isMember ? (
              <Button variant="secondary" className="rounded-xl px-7 py-3 text-base" disabled>
                Joined
              </Button>
            ) : (
              usesApplications ? (
                <Button className="rounded-xl px-7 py-3 text-base" asChild>
                  <Link href={`/club/${clubId}/apply`}>Apply</Link>
                </Button>
              ) : (
                <Button
                  className="rounded-xl px-7 py-3 text-base"
                  disabled={joining}
                  onClick={async () => {
                    setJoining(true);
                    try {
                      const result = await joinClubAction(clubId);
                      if (result?.errorMessage) toast.error(result.errorMessage);
                      else toast.success("You joined the club!");
                    } catch { toast.error("Failed to join club"); }
                    finally { setJoining(false); }
                  }}
                >
                  {joining ? "Joining..." : "Join"}
                </Button>
              )
            )}
          </div>
        </div>

        {/* ── Meta strip ── */}
        <div className="flex flex-wrap gap-8 py-5 border-t border-b border-slate-200 mb-6 text-[14px] text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            {members ?? 0} members
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            Founded {foundedYear}
          </div>
          {universityName && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {universityName}
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-slate-200">
          <TabLink href={basePath} label="Overview" active={isActive(basePath)} />
          <TabLink href={`${basePath}/history`} label="History" active={isActive(`${basePath}/history`)} />
          <TabLink href={`${basePath}/projects`} label="Projects" active={isActive(`${basePath}/projects`)} />
          <TabLink href={`${basePath}/members`} label="Members" active={isActive(`${basePath}/members`)} />
          <TabLink href={`${basePath}/announcements`} label="Announcements" active={isActive(`${basePath}/announcements`)} />
          <TabLink href={`${basePath}/events`} label="Events" active={isActive(`${basePath}/events`)} />
        </div>

        {/* ── Tab content ── */}
        <div className="py-10">{children}</div>
      </div>

    </div>
  );
}
