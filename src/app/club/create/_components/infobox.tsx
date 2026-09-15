"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ImagePlus, KeyRound, Loader2, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CLUB_BANNERS, DEFAULT_CLUB_PROFILE_IMAGES, type DefaultClubBrandingOption } from "@/lib/club-branding-defaults";
import { CLUB_TYPES, type ClubType } from "@/lib/club-types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/tailwind";
import { createClubAction, setNewClubBrandingAction } from "../actions";

type TagOption = { id: string; name: string };
type ImageSelection = { file: File; previewUrl: string } | null;
type BrandingBucket = "club-profile-images" | "club-banner-images";
type UploadedImage = { bucket: BrandingBucket; path: string; signedUrl: string };

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const SIGNED_URL_LIFETIME_SECONDS = 315_576_000_000;

function safeObjectName(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
  return `${crypto.randomUUID()}.${extension}`;
}

async function uploadImage(clubId: string, bucket: BrandingBucket, file: File): Promise<UploadedImage> {
  const supabase = createClient();
  const path = `${clubId}/${safeObjectName(file)}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS);
  if (error || !data?.signedUrl) {
    await supabase.storage.from(bucket).remove([path]);
    throw new Error(error?.message ?? "Could not publish the uploaded image.");
  }
  return { bucket, path, signedUrl: data.signedUrl };
}

function BrandingPicker({ label, banner, value, selection, defaults, onDefault, onFile, error }: {
  label: string;
  banner?: boolean;
  value: string;
  selection: ImageSelection;
  defaults: readonly DefaultClubBrandingOption[];
  onDefault: (url: string) => void;
  onFile: (file?: File) => void;
  error: string | null;
}) {
  const id = banner ? "new-club-banner" : "new-club-logo";
  return (
    <div className={banner ? "sm:col-span-2" : "sm:col-span-1"}>
      <Label htmlFor={id}>{label}</Label>
      <label htmlFor={id} className={cn("group relative mt-2 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-slate-50 transition hover:border-primary", error ? "border-rose-400" : "border-slate-300")}>
        <Image
          src={selection?.previewUrl ?? value}
          alt={`${label} preview`}
          fill
          sizes={banner
            ? "(min-width: 1024px) 520px, (min-width: 640px) 66vw, calc(100vw - 40px)"
            : "(min-width: 1024px) 250px, (min-width: 640px) 33vw, calc(100vw - 40px)"}
          unoptimized={Boolean(selection)}
          className={banner ? "object-cover" : "object-contain p-5"}
        />
        <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-lg bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><ImagePlus className="size-3.5" />Upload a different image</span>
      </label>
      <input id={id} className="sr-only" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={(event) => onFile(event.target.files?.[0])} />
      <p className={cn("mt-1.5 text-xs", error ? "text-rose-600" : "text-slate-500")}>{error ?? (banner ? "1280 × 320 recommended · 10 MB max" : "Square image recommended · 5 MB max")}</p>
      <div className={cn("mt-3 grid gap-2", banner ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-2")}>
        {defaults.map((option) => <button key={option.id} type="button" aria-label={`Use ${option.label} ${label.toLowerCase()}`} aria-pressed={!selection && value === option.url} onClick={() => onDefault(option.url)} className={cn("relative overflow-hidden border-2 transition hover:border-blue-400", banner ? "aspect-[4/1] rounded-md" : "aspect-square rounded-full", !selection && value === option.url ? "border-primary" : "border-transparent")}><Image src={option.url} alt="" fill sizes="(min-width: 1024px) 128px, (min-width: 640px) 17vw, 25vw" className={banner ? "object-cover" : "object-contain"} />{!selection && value === option.url && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-white"><Check className="size-2.5" /></span>}</button>)}
      </div>
    </div>
  );
}

function TagPicker({ title, description, options, selected, onToggle }: { title: string; description: string; options: TagOption[]; selected: string[]; onToggle: (id: string) => void }) {
  return <div><Label>{title}</Label><p className="mt-1 text-xs text-slate-500">{description}</p><div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">{options.map((option) => { const active = selected.includes(option.id); return <button key={option.id} type="button" aria-pressed={active} onClick={() => onToggle(option.id)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", active ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300")}>{option.name}</button>; })}</div></div>;
}

export function Infobox({ universityName, interests, skills }: { universityName: string; interests: TagOption[]; skills: TagOption[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [history, setHistory] = React.useState("");
  const [type, setType] = React.useState<ClubType | "">("");
  const [usesApplications, setUsesApplications] = React.useState(false);
  const [applicationDeadline, setApplicationDeadline] = React.useState("");
  const [attendanceRequired, setAttendanceRequired] = React.useState(75);
  const [interestIds, setInterestIds] = React.useState<string[]>([]);
  const [skillIds, setSkillIds] = React.useState<string[]>([]);
  const [clubImage, setClubImage] = React.useState(DEFAULT_CLUB_PROFILE_IMAGES[0].url);
  const [clubBannerImage, setClubBannerImage] = React.useState(DEFAULT_CLUB_BANNERS[0].url);
  const [logo, setLogo] = React.useState<ImageSelection>(null);
  const [banner, setBanner] = React.useState<ImageSelection>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [bannerError, setBannerError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => () => { if (logo) URL.revokeObjectURL(logo.previewUrl); }, [logo]);
  React.useEffect(() => () => { if (banner) URL.revokeObjectURL(banner.previewUrl); }, [banner]);

  function chooseFile(file: File | undefined, bannerField: boolean) {
    if (!file) return;
    const maxBytes = bannerField ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const setFieldError = bannerField ? setBannerError : setLogoError;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return setFieldError("Choose a PNG, JPEG, WebP, or GIF image.");
    if (file.size > maxBytes) return setFieldError(`Image must be smaller than ${bannerField ? 10 : 5} MB.`);
    const current = bannerField ? banner : logo;
    if (current) URL.revokeObjectURL(current.previewUrl);
    (bannerField ? setBanner : setLogo)({ file, previewUrl: URL.createObjectURL(file) });
    setFieldError(null);
  }

  function chooseDefault(url: string, bannerField: boolean) {
    const current = bannerField ? banner : logo;
    if (current) URL.revokeObjectURL(current.previewUrl);
    if (bannerField) { setBanner(null); setBannerError(null); setClubBannerImage(url); }
    else { setLogo(null); setLogoError(null); setClubImage(url); }
  }

  function toggle(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : current.length < 20 ? [...current, value] : current);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;
    if (!type) {
      setError("Choose a club category.");
      return;
    }
    setCreating(true);
    setError(null);
    let createdClubId: string | null = null;
    try {
      const result = await createClubAction({ name, description, history, type, usesApplications, applicationDeadline: usesApplications && applicationDeadline ? new Date(applicationDeadline).toISOString() : null, attendanceRequired, clubImage, clubBannerImage, interestIds, skillIds });
      if ("errorMessage" in result) throw new Error(result.errorMessage);
      createdClubId = result.clubId;
      let publishedLogo = clubImage;
      let publishedBanner = clubBannerImage;
      if (logo) publishedLogo = (await uploadImage(result.clubId, "club-profile-images", logo.file)).signedUrl;
      if (banner) publishedBanner = (await uploadImage(result.clubId, "club-banner-images", banner.file)).signedUrl;
      if (logo || banner) {
        const brandingResult = await setNewClubBrandingAction(result.clubId, publishedLogo, publishedBanner);
        if ("errorMessage" in brandingResult) throw new Error(brandingResult.errorMessage);
      }
      toast.success("Club created. Your private access code is ready in Settings.");
      router.push(`/club/${result.clubId}/admin`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The club could not be created.";
      if (createdClubId) { toast.error(`${message} You can finish the branding in club settings.`); router.push(`/club/${createdClubId}/admin/settings`); }
      else { setError(message); toast.error(message); }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"><ArrowLeft className="size-4" />Back to discover</Link>
      <header className="mb-8 mt-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Create a club</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-0.035em] text-slate-950">Give your community a <span className="text-primary">home.</span></h1><p className="mt-3 max-w-2xl text-slate-600">Set up the public profile, membership process, and identity for your new organization at {universityName}.</p></header>
      <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="font-bold text-slate-950">Branding</h2><p className="mt-1 text-sm text-slate-500">Choose defaults now or upload your own club profile and banner images.</p></div><div className="grid gap-5 sm:grid-cols-3"><BrandingPicker label="Club profile image" value={clubImage} selection={logo} defaults={DEFAULT_CLUB_PROFILE_IMAGES} onDefault={(url) => chooseDefault(url, false)} onFile={(file) => chooseFile(file, false)} error={logoError} /><BrandingPicker label="Club banner" banner value={clubBannerImage} selection={banner} defaults={DEFAULT_CLUB_BANNERS} onDefault={(url) => chooseDefault(url, true)} onFile={(file) => chooseFile(file, true)} error={bannerError} /></div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-950">Club information</h2><div className="mt-5 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2"><Label htmlFor="club-name">Club name</Label><Input id="club-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="Carolina Consulting" required /></label><div className="space-y-2"><Label htmlFor="club-type">Category</Label><Select value={type} onValueChange={(value) => setType(value as ClubType)} required><SelectTrigger id="club-type" className="w-full" aria-required="true"><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{CLUB_TYPES.map((clubType) => <SelectItem key={clubType} value={clubType}>{clubType}</SelectItem>)}</SelectContent></Select></div></div><label className="block space-y-2"><Label htmlFor="club-description">Description</Label><Textarea id="club-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} rows={4} placeholder="What does your club do, and who is it for?" /><span className="block text-right text-xs text-slate-400">{description.length}/4000</span></label><label className="block space-y-2"><Label htmlFor="club-history">History and founding story</Label><Textarea id="club-history" value={history} onChange={(event) => setHistory(event.target.value)} maxLength={6000} rows={4} placeholder="How did the organization begin?" /><span className="block text-right text-xs text-slate-400">{history.length}/6000</span></label></div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-950">Discovery</h2><p className="mt-1 text-sm text-slate-500">These improve recommendations and help students find the club.</p><div className="mt-5 grid gap-6 md:grid-cols-2"><TagPicker title="Interests" description="Topics your community cares about" options={interests} selected={interestIds} onToggle={(id) => toggle(id, setInterestIds)} /><TagPicker title="Skills" description="Skills members can learn or contribute" options={skills} selected={skillIds} onToggle={(id) => toggle(id, setSkillIds)} /></div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-950">Membership</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-4"><div><Label htmlFor="applications-open">Open applications</Label><p className="mt-1 text-xs text-slate-500">When off, students can join instantly.</p></div><Switch id="applications-open" checked={usesApplications} onCheckedChange={setUsesApplications} /></div></div><label className="space-y-2"><Label htmlFor="attendance">Required attendance percentage</Label><Input id="attendance" type="number" min={0} max={100} value={attendanceRequired} onChange={(event) => setAttendanceRequired(Number(event.target.value))} /><p className="text-xs text-slate-500">Used for member engagement reporting.</p></label>{usesApplications && <label className="space-y-2 sm:col-span-2"><Label htmlFor="deadline">Application deadline</Label><Input id="deadline" type="datetime-local" value={applicationDeadline} min={new Date().toISOString().slice(0, 16)} onChange={(event) => setApplicationDeadline(event.target.value)} /><p className="text-xs text-slate-500">Optional. An editable application form is created automatically.</p></label>}</div></section>
        </div>
        <aside className="sticky top-6 rounded-2xl border border-blue-100 bg-white/90 p-6 shadow-lg shadow-blue-950/5 backdrop-blur"><span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary"><Sparkles className="size-5" /></span><h2 className="mt-4 text-lg font-bold text-slate-950">Ready to launch?</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">You’ll become the club owner and President. You can invite other admins afterward.</p><div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-3"><KeyRound className="mt-0.5 size-4 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-slate-600"><strong className="text-slate-900">Access code generated automatically.</strong><br />It stays private and is available from club Settings.</p></div><div className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-3"><Users className="mt-0.5 size-4 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-slate-600">Your club starts with one member—you—and a complete admin workspace.</p></div><Button type="submit" size="lg" disabled={creating || !name.trim() || !type} className="mt-6 w-full">{creating ? <><Loader2 className="size-4 animate-spin" />Creating club…</> : "Create club"}</Button></aside>
      </form>
    </div>
  );
}
