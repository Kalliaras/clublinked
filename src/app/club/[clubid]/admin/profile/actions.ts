"use server";

import { revalidatePath, updateTag } from "next/cache";

import { isDefaultClubBrandingUrl } from "@/lib/club-branding-defaults";
import { createClient } from "@/lib/supabase/server";

export type ClubProfileInput = {
  name: string;
  description: string;
  type: string;
  usesApplications: boolean;
  applicationDeadline: string | null;
  clubImage: string | null;
  clubBannerImage: string | null;
};

function isAllowedStorageUrl(
  value: string | null,
  clubId: string,
  kind: "profile" | "banner"
) {
  if (!value) return true;
  if (isDefaultClubBrandingUrl(value, kind)) return true;

  try {
    const bucket = kind === "profile" ? "club-profile-images" : "club-banner-images";
    const storageOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
    const url = new URL(value);
    return (
      url.origin === storageOrigin &&
      decodeURIComponent(url.pathname).startsWith(
        `/storage/v1/object/sign/${bucket}/${clubId}/`
      )
    );
  } catch {
    return false;
  }
}

export async function updateClubProfileAction(clubId: string, input: ClubProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { errorMessage: "You need to sign in again." };

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    return { errorMessage: "Only club admins can update this profile." };
  }

  const { data: currentClub } = await supabase
    .from("clubs")
    .select("club_image, club_banner_image")
    .eq("id", clubId)
    .maybeSingle();
  if (!currentClub) return { errorMessage: "Club not found." };

  const name = input.name.trim();
  const description = input.description.trim();
  const type = input.type.trim();
  const applicationDeadline =
    input.usesApplications && input.applicationDeadline
      ? new Date(`${input.applicationDeadline}:00Z`)
      : null;

  if (name.length < 2 || name.length > 120) {
    return { errorMessage: "Club name must be between 2 and 120 characters." };
  }
  if (description.length > 4000) {
    return { errorMessage: "Description must be 4,000 characters or fewer." };
  }
  if (type.length > 80) {
    return { errorMessage: "Category must be 80 characters or fewer." };
  }
  if (applicationDeadline && Number.isNaN(applicationDeadline.getTime())) {
    return { errorMessage: "Choose a valid application deadline." };
  }
  if (
    (input.clubImage !== currentClub.club_image &&
      !isAllowedStorageUrl(input.clubImage, clubId, "profile")) ||
    (input.clubBannerImage !== currentClub.club_banner_image &&
      !isAllowedStorageUrl(input.clubBannerImage, clubId, "banner"))
  ) {
    return {
      errorMessage:
        "Choose a ClubLinked default or upload an image to this club's storage folder.",
    };
  }

  const { error: profileError } = await supabase.rpc("update_club_profile", {
    p_club_id: clubId,
    p_name: name,
    p_description: description || null,
    p_type: type || null,
    p_uses_applications: input.usesApplications,
    p_application_deadline: applicationDeadline?.toISOString() ?? null,
    p_club_image: input.clubImage,
    p_club_banner_image: input.clubBannerImage,
  });
  if (profileError) return { errorMessage: profileError.message };

  revalidatePath(`/club/${clubId}`, "layout");
  revalidatePath(`/club/${clubId}/admin/profile`);
  updateTag("club-discovery");
  updateTag("club-page");
  return { success: true };
}
