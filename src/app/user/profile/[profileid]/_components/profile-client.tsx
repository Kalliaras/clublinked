"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Github, Globe, Instagram, Linkedin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  major: string | null;
  academic_year: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  portfolio_url: string | null;
};

type Role = { title: string; club_name: string };
type Interest = { name: string };
type Skill = { name: string };
type Chip = { label: string };
type SocialLink = { label: string; href: string | null; icon: React.JSX.Element };

function isWebUrl(value: string | null): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export default function ProfileClient({
  profile,
  roles,
  interests,
  skills,
  isOwner,
  universityName,
}: {
  profile: Profile;
  roles: Role[];
  interests: Interest[];
  skills: Skill[];
  isOwner: boolean;
  universityName: string | null;
}) {
  const [showMoreRoles, setShowMoreRoles] = React.useState(false);
  const [showMoreInterests, setShowMoreInterests] = React.useState(false);
  const [showMoreSkills, setShowMoreSkills] = React.useState(false);

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed user";
  const headline = [profile.major, profile.academic_year, universityName].filter(Boolean).join(" • ");
  const rolesData: Chip[] = roles.map((role) => ({ label: `${role.club_name} — ${role.title}` }));
  const interestsData: Chip[] = interests.map((interest) => ({ label: interest.name }));
  const skillsData: Chip[] = skills.map((skill) => ({ label: skill.name }));
  const rolesVisible = showMoreRoles ? rolesData : rolesData.slice(0, 3);
  const interestsVisible = showMoreInterests ? interestsData : interestsData.slice(0, 4);
  const skillsVisible = showMoreSkills ? skillsData : skillsData.slice(0, 4);

  const socialLinks = ([
    { label: "LinkedIn", href: profile.linkedin_url, icon: <Linkedin className="size-5" /> },
    { label: "GitHub", href: profile.github_url, icon: <Github className="size-5" /> },
    { label: "Instagram", href: profile.instagram_url, icon: <Instagram className="size-5" /> },
    { label: "X", href: profile.x_url, icon: <XLogo /> },
    { label: "Portfolio", href: profile.portfolio_url, icon: <Globe className="size-5" /> },
  ] satisfies SocialLink[]).filter(
    (item): item is SocialLink & { href: string } => isWebUrl(item.href)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Card className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative size-16 overflow-hidden rounded-full bg-slate-200">
                <Image src="/logo.png" alt={`${name}'s profile avatar`} fill sizes="64px" className="object-cover" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{name}</h1>
                {headline && <p className="text-sm text-slate-600">{headline}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
              {isOwner ? (
                <Button className="rounded-xl px-8" asChild>
                  <Link href={`/user/profile/${profile.id}/edit`}>Edit</Link>
                </Button>
              ) : (
                <Button className="rounded-xl px-8">Message</Button>
              )}

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4 text-slate-500">
                  {socialLinks.map((item) => (
                    <Link key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900" aria-label={item.label} title={item.label}>
                      {item.icon}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {rolesData.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {rolesVisible.map((role) => <Badge key={role.label} variant="secondary" className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{role.label}</Badge>)}
              {rolesData.length > 3 && <Button type="button" variant="secondary" onClick={() => setShowMoreRoles((visible) => !visible)}>{showMoreRoles ? "Show less" : `+${rolesData.length - 3} more`}</Button>}
            </div>
          )}

          <div className="my-8 h-px w-full bg-slate-200" />

          <div className="space-y-6">
            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">At a glance</h2>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{profile.bio || "No bio available."}</div>
            </Card>

            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Interests &amp; focus</h2>
              {interestsVisible.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {interestsVisible.map((interest) => <span key={interest.label} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"><span className="size-2 rounded-full bg-primary" />{interest.label}</span>)}
                  {interestsData.length > 4 && <button type="button" onClick={() => setShowMoreInterests((visible) => !visible)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">{showMoreInterests ? "Show less" : `+${interestsData.length - 4} more`}<ChevronDown className={`size-4 transition ${showMoreInterests ? "rotate-180" : ""}`} /></button>}
                </div>
              ) : <p className="mt-4 text-sm text-slate-500">No interests added yet.</p>}
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="border-slate-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900">Key highlights</h2>
                <div className="mt-5 text-sm font-medium text-slate-700">Skills</div>
                {skillsVisible.length ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {skillsVisible.map((skill) => <span key={skill.label} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{skill.label}</span>)}
                    {skillsData.length > 4 && <button type="button" onClick={() => setShowMoreSkills((visible) => !visible)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">{showMoreSkills ? "Show less" : `+${skillsData.length - 4} more`}</button>}
                  </div>
                ) : <p className="mt-3 text-sm text-slate-500">No skills added yet.</p>}
              </Card>

              <Card className="border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Campus activity</h2>
                <div className="mt-4 text-5xl font-bold text-primary">{roles.length}</div>
                <div className="mt-2 text-sm text-slate-600">Clubs joined</div>
              </Card>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
