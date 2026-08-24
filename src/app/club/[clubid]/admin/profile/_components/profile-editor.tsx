"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ImageIcon, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_CLUB_BANNERS,
  DEFAULT_CLUB_PROFILE_IMAGES,
  type DefaultClubBrandingOption,
} from "@/lib/club-branding-defaults";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/tailwind";
import { updateClubProfileAction } from "../actions";

const SIGNED_URL_LIFETIME_SECONDS = 315_576_000_000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProfileValues = {
  name: string;
  description: string;
  type: string;
  usesApplications: boolean;
  applicationDeadline: string | null;
  clubImage: string | null;
  clubBannerImage: string | null;
};

type ImageSelection = { file: File; previewUrl: string } | null;
type BrandingBucket = "club-profile-images" | "club-banner-images";
type UploadedImage = { bucket: BrandingBucket; path: string; signedUrl: string };

function safeObjectName(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "image";
  return `${crypto.randomUUID()}-${base}.${extension}`;
}

function pickImage(
  file: File | undefined,
  maxBytes: number,
  current: ImageSelection,
  setSelection: (selection: ImageSelection) => void,
  setError: (error: string | null) => void
) {
  if (!file) return;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    setError("Choose a PNG, JPEG, WebP, or GIF image.");
    return;
  }
  if (file.size > maxBytes) {
    setError(`Image must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
    return;
  }
  if (current) URL.revokeObjectURL(current.previewUrl);
  setSelection({ file, previewUrl: URL.createObjectURL(file) });
  setError(null);
}

async function uploadPrivateImage(
  clubId: string,
  bucket: BrandingBucket,
  file: File
): Promise<UploadedImage> {
  const supabase = createClient();
  const path = `${clubId}/${safeObjectName(file)}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS);
  if (signedUrlError || !data?.signedUrl) {
    await supabase.storage.from(bucket).remove([path]);
    throw new Error(signedUrlError?.message ?? "Could not create the secure image URL.");
  }
  return { bucket, path, signedUrl: data.signedUrl };
}

async function removeUploadedImages(images: UploadedImage[]) {
  if (!images.length) return;
  const supabase = createClient();
  await Promise.allSettled(
    images.map((image) => supabase.storage.from(image.bucket).remove([image.path]))
  );
}

function UploadField({
  label,
  currentUrl,
  selection,
  onSelect,
  error,
  banner = false,
  defaults,
  onDefaultSelect,
}: {
  label: string;
  currentUrl: string | null;
  selection: ImageSelection;
  onSelect: (file?: File) => void;
  error: string | null;
  banner?: boolean;
  defaults: readonly DefaultClubBrandingOption[];
  onDefaultSelect: (url: string) => void;
}) {
  const src = selection?.previewUrl ?? currentUrl;
  const inputId = banner ? "club-banner-upload" : "club-logo-upload";
  return (
    <div className={banner ? "sm:col-span-2" : "sm:col-span-1"}>
      <Label htmlFor={inputId} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </Label>
      <label
        htmlFor={inputId}
        className={cn(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-500 hover:bg-blue-50/50",
          banner ? "h-36" : "h-36",
          error && "border-red-400"
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={`${label} preview`}
            fill
            className={banner ? "object-cover" : "object-contain p-4"}
            unoptimized
          />
        ) : (
          <div className="text-center">
            <UploadCloud className="mx-auto mb-2 size-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">Upload {banner ? "banner" : "logo"}</p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPEG, WebP or GIF</p>
          </div>
        )}
        {src && (
          <span className="absolute inset-x-3 bottom-3 rounded-lg bg-slate-950/75 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            Click to replace
          </span>
        )}
      </label>
      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={(event) => onSelect(event.target.files?.[0])}
      />
      <p className={cn("mt-1.5 text-xs", error ? "text-red-600" : "text-slate-500")}>
        {error ?? (banner ? "1280 × 320 recommended · 10 MB max" : "Square image recommended · 5 MB max")}
      </p>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choose a default
        </p>
        <div className={cn("grid gap-2", banner ? "grid-cols-2" : "grid-cols-4 sm:grid-cols-2")}>
          {defaults.map((option) => {
            const selected = !selection && currentUrl === option.url;
            return (
              <button
                key={option.id}
                type="button"
                aria-label={`Use ${option.label} default ${banner ? "banner" : "logo"}`}
                aria-pressed={selected}
                onClick={() => onDefaultSelect(option.url)}
                className={cn(
                  "relative overflow-hidden border-2 bg-slate-100 transition hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  banner ? "aspect-[4/1] rounded-lg" : "aspect-square rounded-full",
                  selected ? "border-blue-600" : "border-transparent"
                )}
              >
                <Image
                  src={option.url}
                  alt={`${option.label} default`}
                  fill
                  className={banner ? "object-cover" : "object-contain"}
                  unoptimized
                />
                {selected && (
                  <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProfileEditor({
  clubId,
  initialValues,
}: {
  clubId: string;
  initialValues: ProfileValues;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState(initialValues);
  const [logo, setLogo] = React.useState<ImageSelection>(null);
  const [banner, setBanner] = React.useState<ImageSelection>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [bannerError, setBannerError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const previewUrl = logo?.previewUrl;
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [logo]);

  React.useEffect(() => {
    const previewUrl = banner?.previewUrl;
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [banner]);

  const setField = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  function discard() {
    if (logo) URL.revokeObjectURL(logo.previewUrl);
    if (banner) URL.revokeObjectURL(banner.previewUrl);
    setValues(initialValues);
    setLogo(null);
    setBanner(null);
    setLogoError(null);
    setBannerError(null);
    setSaveError(null);
  }

  function selectDefaultLogo(url: string) {
    if (logo) URL.revokeObjectURL(logo.previewUrl);
    setLogo(null);
    setLogoError(null);
    setField("clubImage", url);
  }

  function selectDefaultBanner(url: string) {
    if (banner) URL.revokeObjectURL(banner.previewUrl);
    setBanner(null);
    setBannerError(null);
    setField("clubBannerImage", url);
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    setLogoError(null);
    setBannerError(null);

    const uploadedImages: UploadedImage[] = [];
    let publishStarted = false;
    try {
      let clubImage = values.clubImage;
      let clubBannerImage = values.clubBannerImage;

      if (logo) {
        try {
          const uploaded = await uploadPrivateImage(clubId, "club-profile-images", logo.file);
          uploadedImages.push(uploaded);
          clubImage = uploaded.signedUrl;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Logo upload failed.";
          setLogoError(message);
          throw new Error(`Logo upload failed: ${message}`);
        }
      }
      if (banner) {
        try {
          const uploaded = await uploadPrivateImage(clubId, "club-banner-images", banner.file);
          uploadedImages.push(uploaded);
          clubBannerImage = uploaded.signedUrl;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Banner upload failed.";
          setBannerError(message);
          throw new Error(`Banner upload failed: ${message}`);
        }
      }

      publishStarted = true;
      const result = await updateClubProfileAction(clubId, {
        ...values,
        clubImage,
        clubBannerImage,
      });
      if (result.errorMessage) throw new Error(result.errorMessage);

      setValues((current) => ({ ...current, clubImage, clubBannerImage }));
      setLogo(null);
      setBanner(null);
      toast.success("Club profile published.");
      router.refresh();
    } catch (error) {
      // Before publishing, these objects cannot be referenced by the database
      // and are safe to roll back. Once the RPC starts, its outcome can be
      // ambiguous (for example, a lost response after commit), so leave new
      // objects in place for a later garbage-collection pass.
      if (!publishStarted) await removeUploadedImages(uploadedImages);
      const message = error instanceof Error ? error.message : "Could not save the club profile.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Club profile</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Edit your club <span className="text-blue-600">profile.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={discard} disabled={saving}>
            <RotateCcw className="size-4" /> Discard
          </Button>
          <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {saving ? "Publishing…" : saveError ? "Retry save" : "Save & publish"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-7 lg:px-9">
        <div className="space-y-5">
          {saveError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError} Your selected images are still ready; fix the issue and retry.
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><ImageIcon className="size-4" /></span>
              <div><h2 className="text-sm font-bold text-slate-950">Branding</h2><p className="text-xs text-slate-500">Logo and banner image</p></div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <UploadField
                label="Club logo"
                currentUrl={values.clubImage}
                selection={logo}
                error={logoError}
                defaults={DEFAULT_CLUB_PROFILE_IMAGES}
                onDefaultSelect={selectDefaultLogo}
                onSelect={(file) => pickImage(file, 5 * 1024 * 1024, logo, setLogo, setLogoError)}
              />
              <UploadField
                label="Banner image"
                currentUrl={values.clubBannerImage}
                selection={banner}
                error={bannerError}
                banner
                defaults={DEFAULT_CLUB_BANNERS}
                onDefaultSelect={selectDefaultBanner}
                onSelect={(file) => pickImage(file, 10 * 1024 * 1024, banner, setBanner, setBannerError)}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-950">Basic information</h2>
              <p className="mt-0.5 text-xs text-slate-500">How your club appears throughout ClubLinked</p>
            </div>
            <div className="space-y-5 p-5">
              <div className="space-y-2 pb-4">
                <Label htmlFor="club-name">Club name</Label>
                <Input id="club-name" maxLength={120} value={values.name} onChange={(event) => setField("name", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-description">Description</Label>
                <Textarea id="club-description" rows={5} maxLength={4000} placeholder="Tell students what your club does…" value={values.description} onChange={(event) => setField("description", event.target.value)} />
                <p className="text-right text-xs text-slate-400">{values.description.length}/4000</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="club-type">Category</Label>
                  <Input id="club-type" maxLength={80} list="club-category-suggestions" placeholder="Technology, Sports, Arts…" value={values.type} onChange={(event) => setField("type", event.target.value)} />
                  <datalist id="club-category-suggestions">
                    <option value="Technology" /><option value="Business" /><option value="Arts & Culture" /><option value="Social Impact" /><option value="Sports" /><option value="Academic" />
                  </datalist>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div><Label htmlFor="applications-toggle">Use applications</Label><p className="mt-1 text-xs text-slate-500">Students apply instead of joining instantly.</p></div>
                    <Switch id="applications-toggle" checked={values.usesApplications} onCheckedChange={(checked) => setField("usesApplications", checked)} />
                  </div>
                </div>
              </div>
              {values.usesApplications && (
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="application-deadline">Application deadline</Label>
                  <Input
                    id="application-deadline"
                    type="datetime-local"
                    value={values.applicationDeadline ?? ""}
                    onChange={(event) =>
                      setField("applicationDeadline", event.target.value || null)
                    }
                  />
                  <p className="text-xs text-slate-500">
                    Stored in UTC. Clubs closing within seven days are marked Closing soon.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </>
  );
}
