export type ProjectVisibility = "public" | "members_only";

export type ClubProject = {
  id: string;
  club_id: string;
  title: string | null;
  description: string | null;
  visibility: ProjectVisibility;
  created_at: string;
};

export type ProjectInput = {
  title: string;
  description: string;
  visibility: ProjectVisibility;
};

export type ProjectActionResult = { success: true } | { errorMessage: string };
