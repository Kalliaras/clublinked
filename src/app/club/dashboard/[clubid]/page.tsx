"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  CalendarDays,
  Building2,
  ChevronDown,
  Rocket,
  FolderKanban,
  Lightbulb,
} from "lucide-react";

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

function Tab({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`relative px-1 pb-3 text-sm font-medium transition ${
        active ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[1px] left-0 h-[2px] w-full rounded bg-blue-600" />
      )}
    </button>
  );
}

export default function ClubDetailPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Card className="p-8">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-5">
              {/* Club avatar */}
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-blue-600 shadow-sm">
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
                  Code Club
                </h1>
                <p className="text-sm text-slate-600">
                  Stanford University • Start hacking and build together.
                </p>

                {/* Stat pills */}
                <div className="mt-3 flex flex-wrap gap-3">
                  <StatPill icon={<Heart className="h-4 w-4" />}>Tech</StatPill>
                  <StatPill icon={<Users className="h-4 w-4" />}>
                    184 Members
                  </StatPill>
                  <StatPill icon={<CalendarDays className="h-4 w-4" />}>
                    Founded 2015
                  </StatPill>
                  <StatPill icon={<Building2 className="h-4 w-4" />}>
                    Campus
                  </StatPill>
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
              <Tab label="Overview" active />
              <Tab label="History" />
              <Tab label="Projects" />
              <Tab label="Members" />
              <Tab label="Announcements" />
              <Tab label="Events" />
            </div>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-6">
            {/* About */}
            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">About</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                Code Club is Stanford University&apos;s largest programming
                community, open to developers of all skill levels. We provide
                workshops, hackathons, and mentorship opportunities to help our
                members grow and succeed.
              </p>
            </Card>

            {/* Key highlights */}
            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Key highlights
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                <Badge
                  variant="secondary"
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  <FolderKanban className="mr-2 h-4 w-4 text-slate-500" />
                  Weekly Coding Workshops
                </Badge>

                <Badge
                  variant="secondary"
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  <Rocket className="mr-2 h-4 w-4 text-slate-500" />
                  Hackathons &amp; Competitions
                </Badge>

                <Badge
                  variant="secondary"
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  <FolderKanban className="mr-2 h-4 w-4 text-slate-500" />
                  Project Collaboration
                </Badge>

                <Badge
                  variant="secondary"
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  <Lightbulb className="mr-2 h-4 w-4 text-slate-500" />
                  Mentorship
                </Badge>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  +1 more <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </Card>

            {/* Featured two cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Featured event */}
              <Card className="border-slate-200 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Featured
                </div>

                <Card className="mt-4 border-slate-200 p-6">
                  <span className="inline-flex rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Thursday, May 23
                  </span>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    Hackathon Prep Night
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Prepare for our next hackathon with tips and resources for
                    building winning projects. Pizza provided!
                  </p>

                  <div className="mt-5 text-sm text-slate-700">
                    <div>6:00 PM — 9:00 PM</div>
                    <div className="mt-2">Stanford CS Building</div>
                  </div>
                </Card>
              </Card>

              {/* Featured project */}
              <Card className="border-slate-200 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Featured
                </div>

                <Card className="mt-4 border-slate-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Open Source Dashboard
                    </h3>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Recruiting
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    We&apos;re building an open source dashboard for managing
                    club activities and projects, and we&apos;re looking for
                    contributors to join our team.
                  </p>

                  <div className="mt-4 text-sm text-slate-600">
                    React • Node.js • TypeScript • PostgreSQL
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    {/* tiny avatar stack placeholders */}
                    <div className="flex -space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-slate-200"
                    >
                      +1 more
                    </button>
                  </div>
                </Card>
              </Card>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}