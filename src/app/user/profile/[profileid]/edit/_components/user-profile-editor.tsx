"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  Github,
  Instagram,
  Linkedin,
  LinkIcon,
  Loader2,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/tailwind";
import { updateUserProfileAction } from "../actions";

type Tag = { id: string; name: string };

type EditableProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  major: string;
  academicYear: string;
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
  xUrl: string;
  portfolioUrl: string;
  resume: string | null;
  resumeUrl: string | null;
};

type EditableValues = Omit<EditableProfile, "id" | "email" | "resumeUrl">;

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ACADEMIC_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"];

function TagSelector({
  label,
  description,
  tags,
  selectedIds,
  onChange,
}: {
  label: string;
  description: string;
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = React.useState("");
  const selected = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const filtered = tags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase().trim()));

  const toggle = (id: string) => {
    onChange(selected.has(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`${label}-search`}>{label}</Label>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <Input
        id={`${label}-search`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={`Search ${label.toLowerCase()}…`}
      />
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
        {filtered.length ? (
          filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              aria-pressed={selected.has(tag.id)}
              onClick={() => toggle(tag.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                selected.has(tag.id)
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
              )}
            >
              {tag.name}
            </button>
          ))
        ) : (
          <p className="py-3 text-sm text-slate-500">No matching tags.</p>
        )}
      </div>
    </div>
  );
}

export function UserProfileEditor({
  profile,
  availableInterests,
  availableSkills,
  initialInterestIds,
  initialSkillIds,
}: {
  profile: EditableProfile;
  availableInterests: Tag[];
  availableSkills: Tag[];
  initialInterestIds: string[];
  initialSkillIds: string[];
}) {
  const router = useRouter();
  const initialValues = React.useMemo<EditableValues>(
    () => ({
      firstName: profile.firstName,
      lastName: profile.lastName,
      major: profile.major,
      academicYear: profile.academicYear,
      bio: profile.bio,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      instagramUrl: profile.instagramUrl,
      xUrl: profile.xUrl,
      portfolioUrl: profile.portfolioUrl,
      resume: profile.resume,
    }),
    [profile]
  );
  const [values, setValues] = React.useState(initialValues);
  const [interestIds, setInterestIds] = React.useState(initialInterestIds);
  const [skillIds, setSkillIds] = React.useState(initialSkillIds);
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumeError, setResumeError] = React.useState<string | null>(null);
  const [removeResume, setRemoveResume] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const setField = <K extends keyof EditableValues>(key: K, value: EditableValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const discard = () => {
    setValues(initialValues);
    setInterestIds(initialInterestIds);
    setSkillIds(initialSkillIds);
    setResumeFile(null);
    setRemoveResume(false);
    setResumeError(null);
    setSaveError(null);
  };

  const selectResume = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setResumeError("Choose a PDF file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be 10 MB or smaller.");
      return;
    }
    setResumeFile(file);
    setRemoveResume(false);
    setResumeError(null);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    setResumeError(null);

    const supabase = createClient();
    const previousResume = profile.resume;
    let newResume: string | null = removeResume ? null : values.resume;
    let uploadedPath: string | null = null;

    try {
      if (resumeFile) {
        uploadedPath = `${profile.id}/${crypto.randomUUID()}-resume.pdf`;
        const { error } = await supabase.storage.from("users_resumes").upload(uploadedPath, resumeFile, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw new Error(`Resume upload failed: ${error.message}`);
        newResume = uploadedPath;
      }

      const result = await updateUserProfileAction(profile.id, {
        ...values,
        resume: newResume,
        interestIds,
        skillIds,
      });
      if (result.errorMessage) throw new Error(result.errorMessage);

      if (previousResume && previousResume !== newResume) {
        await supabase.storage.from("users_resumes").remove([previousResume]);
      }

      toast.success("Profile updated.");
      router.push(`/user/profile/${profile.id}`);
      router.refresh();
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("users_resumes").remove([uploadedPath]);
      const message = error instanceof Error ? error.message : "Could not save your profile.";
      setSaveError(message);
      if (message.toLowerCase().includes("resume")) setResumeError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Profile settings</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Edit your <span className="text-blue-600">profile.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={discard} disabled={saving}>
            <RotateCcw className="size-4" /> Discard
          </Button>
          <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {saving ? "Saving…" : saveError ? "Retry save" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-7 lg:px-9">
        {saveError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-950">Personal information</h2>
            <p className="mt-0.5 text-xs text-slate-500">Your name and academic details</p>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="first-name">First name</Label><Input id="first-name" maxLength={80} value={values.firstName} onChange={(event) => setField("firstName", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="last-name">Last name</Label><Input id="last-name" maxLength={80} value={values.lastName} onChange={(event) => setField("lastName", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="major">Major</Label><Input id="major" maxLength={120} placeholder="Computer Science" value={values.major} onChange={(event) => setField("major", event.target.value)} /></div>
            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic year</Label>
              <select id="academic-year" value={values.academicYear} onChange={(event) => setField("academicYear", event.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="">Select year</option>
                {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={6} maxLength={4000} placeholder="Tell people about yourself…" value={values.bio} onChange={(event) => setField("bio", event.target.value)} />
              <p className="text-right text-xs text-slate-400">{values.bio.length}/4000</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-950">Interests and skills</h2>
            <p className="mt-0.5 text-xs text-slate-500">Choose what you care about and what you can contribute</p>
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <TagSelector label="Interests" description="Shown in Interests & focus" tags={availableInterests} selectedIds={interestIds} onChange={setInterestIds} />
            <TagSelector label="Skills" description="Shown in Key highlights" tags={availableSkills} selectedIds={skillIds} onChange={setSkillIds} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><LinkIcon className="size-4" /></span>
            <div><h2 className="text-sm font-bold text-slate-950">Social links</h2><p className="text-xs text-slate-500">Only completed links appear on your profile</p></div>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="linkedin"><Linkedin className="mr-1 inline size-4" />LinkedIn</Label><Input id="linkedin" type="url" placeholder="https://linkedin.com/in/username" value={values.linkedinUrl} onChange={(event) => setField("linkedinUrl", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="github"><Github className="mr-1 inline size-4" />GitHub</Label><Input id="github" type="url" placeholder="https://github.com/username" value={values.githubUrl} onChange={(event) => setField("githubUrl", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="instagram"><Instagram className="mr-1 inline size-4" />Instagram</Label><Input id="instagram" type="url" placeholder="https://instagram.com/username" value={values.instagramUrl} onChange={(event) => setField("instagramUrl", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="x-link">X</Label><Input id="x-link" type="url" placeholder="https://x.com/username" value={values.xUrl} onChange={(event) => setField("xUrl", event.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="portfolio">Portfolio</Label><Input id="portfolio" type="url" placeholder="https://yourportfolio.com" value={values.portfolioUrl} onChange={(event) => setField("portfolioUrl", event.target.value)} /></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><FileText className="size-4" /></span>
            <div><h2 className="text-sm font-bold text-slate-950">Resume</h2><p className="text-xs text-slate-500">Upload one private PDF, up to 10 MB</p></div>
          </div>
          <div className="p-5">
            <label htmlFor="resume-upload" className={cn("flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50/50", resumeError && "border-red-400")}>
              <div><UploadCloud className="mx-auto mb-2 size-8 text-slate-400" /><p className="text-sm font-semibold text-slate-700">{resumeFile ? resumeFile.name : "Choose a PDF resume"}</p><p className="mt-1 text-xs text-slate-500">PDF only · 10 MB max</p></div>
            </label>
            <input id="resume-upload" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => selectResume(event.target.files?.[0])} />
            {resumeError && <p className="mt-2 text-xs text-red-600">{resumeError}</p>}
            {(profile.resumeUrl || resumeFile) && !removeResume && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-700">{resumeFile?.name ?? "Current resume.pdf"}</p>
                <div className="flex gap-2">
                  {profile.resumeUrl && !resumeFile && <Button variant="outline" size="sm" asChild><Link href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">View</Link></Button>}
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setResumeFile(null); setRemoveResume(true); }}>Remove</Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-950">Account</h2><p className="mt-0.5 text-xs text-slate-500">Account credentials are read-only here</p></div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" value={profile.email} readOnly aria-readonly="true" className="bg-slate-50 text-slate-500" /><p className="text-xs text-slate-500">Your email cannot be changed from this page.</p></div>
            <div className="space-y-2">
              <Label htmlFor="password-display">Password</Label>
              <Input id="password-display" value="••••••••••••" readOnly aria-readonly="true" className="bg-slate-50 text-slate-500" />
            </div>
          </div>
        </section>

        <div className="flex justify-end"><Button variant="outline" asChild><Link href={`/user/profile/${profile.id}`}>Cancel</Link></Button></div>
      </div>
    </div>
  );
}
