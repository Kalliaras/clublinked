export type DefaultClubBrandingOption = {
  id: "blue" | "violet" | "teal" | "coral";
  label: string;
  url: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";

function publicStorageUrl(bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

const variants = [
  { id: "blue", label: "Blue" },
  { id: "violet", label: "Violet" },
  { id: "teal", label: "Teal" },
  { id: "coral", label: "Coral" },
] as const;

export const DEFAULT_CLUB_BANNERS: readonly DefaultClubBrandingOption[] = variants.map(
  (variant) => ({
    ...variant,
    url: publicStorageUrl("club-default-images", `banners/default-${variant.id}.png`),
  })
);

export const DEFAULT_CLUB_PROFILE_IMAGES: readonly DefaultClubBrandingOption[] =
  variants.map((variant) => ({
    ...variant,
    url: publicStorageUrl(
      "club-default-profile-images",
      `profiles/default-${variant.id}.png`
    ),
  }));

export function isDefaultClubBrandingUrl(
  value: string,
  kind: "banner" | "profile"
) {
  const options =
    kind === "banner" ? DEFAULT_CLUB_BANNERS : DEFAULT_CLUB_PROFILE_IMAGES;
  return options.some((option) => option.url === value);
}
