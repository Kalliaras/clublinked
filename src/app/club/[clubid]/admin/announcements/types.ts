export type AdminAnnouncement = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
};

export type AnnouncementInput = {
  title: string;
  body: string;
};

export type AnnouncementActionResult =
  | { success: true }
  | { errorMessage: string };
