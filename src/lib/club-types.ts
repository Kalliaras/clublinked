export const CLUB_TYPES = [
  "Academic",
  "Arts & Culture",
  "Business",
  "Social Impact",
  "Sports",
  "Technology",
] as const;

export type ClubType = (typeof CLUB_TYPES)[number];
