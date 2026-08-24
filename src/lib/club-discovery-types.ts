export type DiscoveryTag = { id: string; name: string };

export type DiscoveryClub = {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  club_image: string | null;
  club_banner_image: string | null;
  member_count: number | null;
  created_at: string;
  uses_applications: boolean;
  application_deadline: string | null;
  interests: DiscoveryTag[];
  skills: DiscoveryTag[];
};
