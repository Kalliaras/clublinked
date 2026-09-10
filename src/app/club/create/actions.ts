"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { isDefaultClubBrandingUrl } from "@/lib/club-branding-defaults";
import { CLUB_TYPES, type ClubType } from "@/lib/club-types";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().trim().min(2, "Club name must be at least 2 characters.").max(120),
  description: z.string().trim().max(4000),
  history: z.string().trim().max(6000),
  type: z.string().refine(
    (value): value is ClubType => CLUB_TYPES.includes(value as ClubType),
    "Choose a valid club category.",
  ),
  usesApplications: z.boolean(),
  applicationDeadline: z.string().nullable(),
  attendanceRequired: z.number().int().min(0).max(100),
  clubImage: z.string(),
  clubBannerImage: z.string(),
  interestIds: z.array(z.string().uuid()).max(20),
  skillIds: z.array(z.string().uuid()).max(20),
});

export type CreateClubInput = z.infer<typeof createSchema>;

const uploadedOrDefaultImageSchema = z.string().refine(
  (value) => z.string().url().safeParse(value).success || value.startsWith("/default-"),
  "Invalid club image.",
);

export async function createClubAction(input: CreateClubInput): Promise<{ clubId: string } | { errorMessage: string }> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { errorMessage: parsed.error.issues[0]?.message ?? "Check the club details." };
  if (!isDefaultClubBrandingUrl(parsed.data.clubImage, "profile") || !isDefaultClubBrandingUrl(parsed.data.clubBannerImage, "banner")) {
    return { errorMessage: "Choose one of the ClubLinked image defaults before creating the club." };
  }
  const deadline = parsed.data.usesApplications && parsed.data.applicationDeadline
    ? new Date(parsed.data.applicationDeadline)
    : null;
  if (deadline && (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now())) {
    return { errorMessage: "Choose a future application deadline." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_club_with_owner", {
    p_name: parsed.data.name,
    p_description: parsed.data.description,
    p_history: parsed.data.history,
    p_type: parsed.data.type,
    p_uses_applications: parsed.data.usesApplications,
    p_application_deadline: deadline?.toISOString() ?? null,
    p_attendance_required: parsed.data.attendanceRequired,
    p_club_image: parsed.data.clubImage,
    p_club_banner_image: parsed.data.clubBannerImage,
    p_interest_ids: parsed.data.interestIds,
    p_skill_ids: parsed.data.skillIds,
  });
  if (error?.message.includes("UNIVERSITY_REQUIRED")) return { errorMessage: "Add a university to your profile before creating a club." };
  if (error?.message.includes("INVALID_DEADLINE")) return { errorMessage: "Choose a future application deadline." };
  if (error || !data) {
    console.error("[club/create]", error?.message);
    return { errorMessage: "The club could not be created. Please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/home");
  updateTag("club-discovery");
  updateTag("club-page");
  return { clubId: data };
}

export async function setNewClubBrandingAction(clubId: string, clubImage: string, clubBannerImage: string): Promise<{ success: true } | { errorMessage: string }> {
  const parsed = z.object({
    clubId: z.string().uuid(),
    clubImage: uploadedOrDefaultImageSchema,
    clubBannerImage: uploadedOrDefaultImageSchema,
  }).safeParse({ clubId, clubImage, clubBannerImage });
  if (!parsed.success) return { errorMessage: "The uploaded image URLs are invalid." };
  if (
    (parsed.data.clubImage.startsWith("/") && !isDefaultClubBrandingUrl(parsed.data.clubImage, "profile"))
    || (parsed.data.clubBannerImage.startsWith("/") && !isDefaultClubBrandingUrl(parsed.data.clubBannerImage, "banner"))
  ) {
    return { errorMessage: "The selected default image is invalid." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_new_club_branding", {
    p_club_id: parsed.data.clubId,
    p_club_image: parsed.data.clubImage,
    p_club_banner_image: parsed.data.clubBannerImage,
  });
  if (error) return { errorMessage: "The club was created, but its uploaded images could not be published." };
  revalidatePath(`/club/${clubId}`, "layout");
  updateTag("club-discovery");
  updateTag("club-page");
  return { success: true };
}
