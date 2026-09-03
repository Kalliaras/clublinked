export type DefaultClubBrandingOption = {
  id: "blue" | "violet" | "teal" | "coral";
  label: string;
  url: string;
};

const variants = [
  { id: "blue", label: "Blue" },
  { id: "violet", label: "Violet" },
  { id: "teal", label: "Teal" },
  { id: "coral", label: "Coral" },
] as const;

export const DEFAULT_CLUB_BANNERS: readonly DefaultClubBrandingOption[] = variants.map(
  (variant) => ({
    ...variant,
    url: `/default-banners/default-${variant.id}.png`,
  })
);

export const DEFAULT_CLUB_PROFILE_IMAGES: readonly DefaultClubBrandingOption[] =
  variants.map((variant) => ({
    ...variant,
    url: `/default-profile-images/default-${variant.id}.png`,
  }));

export function isDefaultClubBrandingUrl(
  value: string,
  kind: "banner" | "profile"
) {
  const options =
    kind === "banner" ? DEFAULT_CLUB_BANNERS : DEFAULT_CLUB_PROFILE_IMAGES;
  return options.some((option) => option.url === value);
}
