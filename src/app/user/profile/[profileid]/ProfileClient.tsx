"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UpdateBioAction, UpdateInterestsAction, UpdateSkillsAction } from "@/app/user/actions/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  club_id: string;
  university_id: string;
  major: string | null;
  year: string | null;
  bio: string | null;
  created_at: string;
};

type Role = {
  id: string;
  title: string;
  club_name: string;
};

type Interest = {
  name: string;
};

type Skill = {
  name: string;
};

export default function ProfileClient({ profile, roles, interests, skills, isOwner }: { profile: Profile; roles: Role[]; interests: Interest[]; skills: Skill[]; isOwner: boolean }) {
  const [showMoreRoles, setShowMoreRoles] = React.useState(false);
  const [showMoreInterests, setShowMoreInterests] = React.useState(false);
  const [showMoreSkills, setShowMoreSkills] = React.useState(false);
  const [universityName, setUniversityName] = React.useState<string | null>(null);

  const router = useRouter();

  // editing state
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [bioInput, setBioInput] = React.useState(profile.bio || "");

  // dialog for tags (interests/skills)
  const [tagDialogOpen, setTagDialogOpen] = React.useState(false);
  const [tagDialogType, setTagDialogType] = React.useState<"interests" | "skills" | null>(null);
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [tagSearch, setTagSearch] = React.useState("");
  React.useEffect(() => {
    const fetchUniversity = async () => {
      if (profile.university_id) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('universities')
          .select('name')
          .eq('id', profile.university_id)
          .single();
        if (!error && data) {
          setUniversityName(data.name);
        }
      }
    };
    fetchUniversity();
  }, [profile.university_id]);

  // Use real profile data
  const name = `${profile.first_name} ${profile.last_name}`;
  const headline = `${profile.major || 'Unknown Major'} • ${profile.year || 'Unknown Year'} • ${universityName || 'Unknown University'}`;

  // Real data from props
  const rolesData: Chip[] = roles.map(role => ({
    label: `${role.club_name} — ${role.title}`
  }));

  const interestsData: Chip[] = interests.map(interest => ({
    label: interest.name
  }));

  const skillsData: Chip[] = skills.map(skill => ({
    label: skill.name
  }));

  const about = profile.bio || "No bio available.";

  // handlers for saves
  const handleBioSave = async () => {
    await UpdateBioAction(profile.id, bioInput || "");
    setIsEditingBio(false);
    router.refresh();
  };


  const rolesVisible = showMoreRoles ? rolesData : rolesData.slice(0, 3);
  const interestsVisible = showMoreInterests ? interestsData : interestsData.slice(0, 4);
  const skillsVisible = showMoreSkills ? skillsData : skillsData.slice(0, 4);

  // when dialog opens, load tags and initial selection
  React.useEffect(() => {
    if (tagDialogOpen && tagDialogType) {
      const load = async () => {
        const supabase = createClient();
        const table = tagDialogType === "interests" ? "interest_tags" : "skill_tags";
        const { data } = await supabase
          .from(table)
          .select("name");
        setAvailableTags((data || []).map((d) => d?.name || ""));
        setSelectedTags(
          tagDialogType === "interests"
            ? interests.map(i => i.name)
            : skills.map(s => s.name)
        );
        setTagSearch("");
      };
      load();
    }
  }, [tagDialogOpen, tagDialogType, interests, skills]);

  const handleTagSave = async () => {
    if (tagDialogType === "interests") {
      await UpdateInterestsAction(profile.id, selectedTags);
    } else if (tagDialogType === "skills") {
      await UpdateSkillsAction(profile.id, selectedTags);
    }
    setTagDialogOpen(false);
    router.refresh();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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

            {rolesData.length > 3 && (
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
                  <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  At a glance
                </h2>
                {isOwner && (
                  <Button size="sm" variant="outline" onClick={() => setIsEditingBio(true)}>
                    Edit
                  </Button>
                )}
              </div>

              {isEditingBio ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    className="w-full rounded border p-2"
                    rows={4}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleBioSave}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioInput(profile.bio || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm leading-6 text-slate-700">
                  {about}
                </div>
              )}
            </Card>

            {/* Interests & focus */}
            <Card className="border-slate-200 p-6">
<div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Interests &amp; focus
                </h2>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTagDialogType("interests");
                      setTagDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {interestsVisible.map((i) => (
                  <span
                    key={i.label}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {i.label}
                  </span>
                ))}

                {interestsData.length > 4 && (
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
              </div>            </Card>

            {/* Bottom row: Key highlights + Campus activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Key highlights (wider) */}
              <Card className="border-slate-200 p-6 lg:col-span-2">
<div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Key highlights
                    </h2>
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTagDialogType("skills");
                          setTagDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

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

                    {skillsData.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowMoreSkills((v) => !v)}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        {showMoreSkills ? "Show less" : "+1 more"}
                      </button>
                    )}
                  </div>                </div>
              </Card>

              {/* Campus activity (smaller) */}
              <Card className="border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Campus activity
                </h2>

                <div className="mt-4 text-5xl font-bold text-primary">
                  24
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Opportunities engaged
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* tag selection dialog */}
        <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Edit {tagDialogType === "interests" ? "Interests" : "Skills"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <input
                className="w-full rounded border p-2"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                {availableTags
                  .filter((t) =>
                    t.toLowerCase().includes(tagSearch.toLowerCase())
                  )
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`px-2 py-1 rounded-full text-sm border ${
                        selectedTags.includes(t)
                          ? "bg-primary text-white"
                          : "bg-slate-100"
                      }`}
                      onClick={() => toggleTag(t)}
                    >
                      {t}
                    </button>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleTagSave}>Save</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}