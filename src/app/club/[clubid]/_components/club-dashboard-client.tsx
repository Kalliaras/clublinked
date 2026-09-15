"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, Loader2 } from "lucide-react";
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
      className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}

export default function ClubDashboardClient({
  clubId,
  clubName,
  clubImageUrl,
  clubBannerImageUrl,
  members,
  createdAt,
  universityName,
  isMember,
  isOwner: _isOwner,
  isAdmin,
  usesApplications,
  applicationsClosed,
  hasApplied,
  hasDraft,
  children,
}: {
  clubId: string;
  clubName: string | null;
  clubImageUrl?: string | null;
  clubBannerImageUrl?: string | null;
  members: number;
  createdAt: string;
  universityName: string | null;
  isMember: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  usesApplications: boolean;
  applicationsClosed: boolean;
  hasApplied: boolean;
  hasDraft: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [joining, setJoining] = React.useState(false);
  const basePath = `/club/${clubId}`;

  const foundedYear = React.useMemo(() => {
    try {
      return new Date(createdAt).getFullYear();
    } catch {
      return "Unknown";
    }
  }, [createdAt]);

  const isApplyPage = pathname?.startsWith(`${basePath}/apply`) ?? false;
  const isAdminPage = pathname?.startsWith(`${basePath}/admin`) ?? false;

  if (isApplyPage || isAdminPage) {
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

    return normalizedPath === normalizedTarget || normalizedPath.startsWith(`${normalizedTarget}/`);
  };

  return (
    <div className="clublinked-page-background club-page-layout min-h-screen">

      {/* ── Banner ── */}
      <div className="relative h-[220px] overflow-hidden bg-primary sm:h-[280px]">
        {clubBannerImageUrl && (
          <Image
            src={clubBannerImageUrl}
            alt={`${clubName ?? "Club"} banner`}
            fill
            sizes="100vw"
            className="object-cover"
            fetchPriority="high"
            loading="eager"
            quality={75}
          />
        )}
        {!clubBannerImageUrl && (
          <>
            {/* Decorated fallback used only when no stored banner is available. */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-b from-transparent to-black/40" />
          </>
        )}
      </div>

      {/* ── Hero ── */}
      <div className="relative mx-auto w-full max-w-5xl px-5 pt-8 sm:px-8 lg:px-12">

        {/* Logo + name + actions — all in one bottom-aligned row */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7">

          {/* Logo */}
          <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary shadow-lg sm:size-[120px]">
            <Image
              src={clubImageUrl ?? "/App_icon_no_name.png"}
              alt={clubName ?? "Club logo"}
              fill
              sizes="120px"
              className={clubImageUrl ? "object-cover" : "object-contain p-3"}
              loading="eager"
              quality={75}
            />
          </div>

          {/* Name — flex-1, sits next to logo */}
          <div className="min-w-0 flex-1 sm:pb-3">
            {universityName && (
              <p className="text-sm font-medium text-slate-500 mb-2">{universityName}</p>
            )}
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-[40px]">
              {clubName}
            </h1>
          </div>

          {/* Action buttons — right side, bottom-aligned */}
          <div className="flex shrink-0 items-center gap-3 sm:pb-3">
            {isAdmin ? (
              <Button size="lg" className="h-11 min-w-28 rounded-xl border-0 bg-blue-600 text-white hover:bg-blue-700" asChild>
                <Link href={`/club/${clubId}/admin`}>Edit</Link>
              </Button>
            ) : isMember ? (
              <Button size="lg" variant="secondary" className="h-11 min-w-28 rounded-xl" disabled>
                Joined
              </Button>
            ) : (
              usesApplications ? (
                hasDraft ? (
                  <Button size="lg" className="h-11 min-w-28 rounded-xl" asChild>
                    <Link href={`/club/${clubId}/apply`}>Continue application</Link>
                  </Button>
                ) : hasApplied ? (
                  <Button
                    size="lg"
                    className="h-11 min-w-28 cursor-not-allowed rounded-xl border-0 bg-blue-400 text-white opacity-75"
                    disabled
                  >
                    Submitted
                  </Button>
                ) : applicationsClosed ? (
                  <Button
                    size="lg"
                    className="h-11 min-w-28 cursor-not-allowed rounded-xl border-0 bg-slate-400 text-white"
                    disabled
                  >
                    Applications closed
                  </Button>
                ) : (
                  <Button size="lg" className="h-11 min-w-28 rounded-xl" asChild>
                    <Link href={`/club/${clubId}/apply`}>Apply</Link>
                  </Button>
                )
              ) : (
                <Button
                  size="lg"
                  className="h-11 min-w-28 rounded-xl"
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
                  {joining ? <><Loader2 className="size-4 animate-spin" />Joining…</> : "Join"}
                </Button>
              )
            )}
          </div>
        </div>

        {/* ── Meta strip ── */}
        <div className="mb-7 flex flex-wrap gap-x-8 gap-y-3 rounded-2xl bg-white/70 px-5 py-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
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
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1.5" aria-label="Club sections">
          <TabLink href={basePath} label="Overview" active={isActive(basePath)} />
          <TabLink href={`${basePath}/history`} label="History" active={isActive(`${basePath}/history`)} />
          <TabLink href={`${basePath}/projects`} label="Projects" active={isActive(`${basePath}/projects`)} />
          <TabLink href={`${basePath}/members`} label="Members" active={isActive(`${basePath}/members`)} />
          <TabLink href={`${basePath}/announcements`} label="Announcements" active={isActive(`${basePath}/announcements`)} />
          <TabLink href={`${basePath}/events`} label="Events" active={isActive(`${basePath}/events`)} />
          {isMember && <TabLink href={`${basePath}/elections`} label="Elections" active={isActive(`${basePath}/elections`)} />}
        </div>

        {/* ── Tab content ── */}
        <div className="py-10 sm:py-12">{children}</div>
      </div>

    </div>
  );
}
