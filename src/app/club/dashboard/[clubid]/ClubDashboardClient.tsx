"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, CalendarDays } from "lucide-react";

function StatPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
      <span className="text-slate-500">{icon}</span>
      {children}
    </div>
  );
}

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
      className={`relative px-1 pb-3 text-sm font-medium transition ${
        active ? "text-primary" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[1px] left-0 h-[2px] w-full rounded bg-primary" />
      )}
    </Link>
  );
}

export default function ClubDashboardClient({
  clubId,
  clubName,
  members,
  createdAt,
  universityName,
  children,
}: {
  clubId: string;
  clubName: string;
  members: number;
  createdAt: string;
  universityName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const basePath = `/club/dashboard/${clubId}`;

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
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Card className="p-8">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Club logo"
                  fill
                  className="object-contain p-3"
                  priority
                />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {clubName}
                </h1>
                <p className="text-sm text-slate-600">
                  {universityName ? `${universityName} • ` : ""}
                  Founded {foundedYear}
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <StatPill icon={<Users className="h-4 w-4" />}>{members ?? 0} Members</StatPill>
                  <StatPill icon={<CalendarDays className="h-4 w-4" />}>Founded {foundedYear}</StatPill>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button className="rounded-xl px-10">Join</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-slate-200">
            <div className="flex flex-wrap gap-8">
              <TabLink href={basePath} label="Overview" active={isActive(basePath)} />
              <TabLink href={`${basePath}/history`} label="History" active={isActive(`${basePath}/history`)} />
              <TabLink href={`${basePath}/projects`} label="Projects" active={isActive(`${basePath}/projects`)} />
              <TabLink href={`${basePath}/members`} label="Members" active={isActive(`${basePath}/members`)} />
              <TabLink href={`${basePath}/announcements`} label="Announcements" active={isActive(`${basePath}/announcements`)} />
              <TabLink href={`${basePath}/events`} label="Events" active={isActive(`${basePath}/events`)} />
            </div>
          </div>

          <div className="mt-8">{children}</div>
        </Card>
      </main>
    </div>
  );
}
