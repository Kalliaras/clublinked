"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Linkedin,
  Instagram,
  Github,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";

type Chip = { label: string };

type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  major: string | null;
  year: string | null;
  created_at: string;
};

export default function ProfileClient({ profile }: { profile: Profile }) {
  const [showMoreAbout, setShowMoreAbout] = React.useState(false);
  const [showMoreRoles, setShowMoreRoles] = React.useState(false);
  const [showMoreInterests, setShowMoreInterests] = React.useState(false);
  const [showMoreSkills, setShowMoreSkills] = React.useState(false);

  // Use real profile data
  const name = `${profile.first_name} ${profile.last_name}`;
  const headline = `${profile.major || 'Unknown Major'} • ${profile.year || 'Unknown Year'}`;

  // Mock data for now (can be fetched separately later)
  const roles: Chip[] = [
    { label: "Code Club — President" },
    { label: "Women in Tech — Vice President" },
    { label: "Startup Lab — Mentor" },
    { label: "Research Group — Member" },
  ];

  const interests: Chip[] = [
    { label: "Full-stack Development" },
    { label: "Machine Learning" },
    { label: "Product Design" },
    { label: "Open Source" },
    { label: "Entrepreneurship" },
  ];

  const skills: Chip[] = [
    { label: "React" },
    { label: "TypeScript" },
    { label: "Node.js" },
    { label: "PostgreSQL" },
    { label: "Python" },
    { label: "Next.js" },
  ];

  const aboutShort =
    "Full-stack developer passionate about building scalable applications and mentoring junior developers. Always learning, a...";
  const aboutFull =
    "Full-stack developer passionate about building scalable applications and mentoring junior developers. Always learning, and currently focused on building community tools for campus clubs. I love shipping clean UI, designing systems, and collaborating on impactful projects.";

  const rolesVisible = showMoreRoles ? roles : roles.slice(0, 3);
  const interestsVisible = showMoreInterests ? interests : interests.slice(0, 4);
  const skillsVisible = showMoreSkills ? skills : skills.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Outer container like the screenshot */}
        <Card className="p-8">
          {/* Top header row */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: avatar + name */}
            <div className="flex items-start gap-5">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-200">
                {/* Replace with your user avatar path or Next/Image src */}
                <Image
                  src="/logo.png"
                  alt="Profile avatar"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {name}
                </h1>
                <p className="text-sm text-slate-600">{headline}</p>
              </div>
            </div>

            {/* Right: message button + icons */}
            <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
              <Button className="rounded-xl px-8">Message</Button>

              <div className="flex items-center gap-4 text-slate-500">
                <button
                  type="button"
                  className="hover:text-slate-800"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-slate-800"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-slate-800"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-slate-800"
                  aria-label="X"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-slate-800"
                  aria-label="Website"
                >
                  <Globe className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Role chips row */}
          <div className="mt-6 flex flex-wrap gap-3">
            {rolesVisible.map((r) => (
              <Badge
                key={r.label}
                variant="secondary"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {r.label}
              </Badge>
            ))}

            {roles.length > 3 && (
              <button
                type="button"
                onClick={() => setShowMoreRoles((s) => !s)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                {showMoreRoles ? "Show less" : "+1 more"}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="my-8 h-px w-full bg-slate-200" />

          {/* Content: stacked cards like screenshot */}
          <div className="space-y-6">
            {/* At a glance */}
            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                At a glance
              </h2>

              <div className="mt-4 text-sm leading-6 text-slate-700">
                {showMoreAbout ? aboutFull : aboutShort}{" "}
                <button
                  type="button"
                  onClick={() => setShowMoreAbout((s) => !s)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Read more
                </button>
              </div>

              {/* optional second "Read more" like screenshot */}
              <button
                type="button"
                onClick={() => setShowMoreAbout(true)}
                className="mt-3 inline-flex font-medium text-blue-600 hover:underline"
              >
                Read more
              </button>
            </Card>

            {/* Interests & focus */}
            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Interests &amp; focus
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                {interestsVisible.map((i) => (
                  <span
                    key={i.label}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {i.label}
                  </span>
                ))}

                {interests.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreInterests((s) => !s)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    {showMoreInterests ? "Show less" : "+1 more"}
                    <ChevronDown
                      className={`h-4 w-4 transition ${
                        showMoreInterests ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            </Card>

            {/* Bottom row: Key highlights + Campus activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Key highlights (wider) */}
              <Card className="border-slate-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Key highlights
                </h2>

                <div className="mt-5">
                  <div className="text-sm font-medium text-slate-700">
                    Skills
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    {skillsVisible.map((s) => (
                      <span
                        key={s.label}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        {s.label}
                      </span>
                    ))}

                    {skills.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowMoreSkills((v) => !v)}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        {showMoreSkills ? "Show less" : "+1 more"}
                      </button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Campus activity (smaller) */}
              <Card className="border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Campus activity
                </h2>

                <div className="mt-4 text-5xl font-bold text-blue-600">
                  24
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Opportunities engaged
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}