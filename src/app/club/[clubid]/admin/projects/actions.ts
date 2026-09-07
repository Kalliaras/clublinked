"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { ProjectActionResult, ProjectInput } from "./types";

const projectSchema = z.object({
  title: z.string().trim().min(1, "Add a project title.").max(160),
  description: z.string().trim().max(4000),
  visibility: z.enum(["public", "members_only"]),
});

type AuthorizedClientResult =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; errorMessage: string };

type NormalizedProjectResult =
  | {
      ok: true;
      value: {
        title: string;
        description: string | null;
        visibility: "public" | "members_only";
      };
    }
  | { ok: false; errorMessage: string };

async function getAuthorizedClient(clubId: string): Promise<AuthorizedClientResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, errorMessage: "You must be signed in." };

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    return { ok: false, errorMessage: "You do not have permission to manage these projects." };
  }

  return { ok: true, supabase };
}

function normalizeProject(input: ProjectInput): NormalizedProjectResult {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errorMessage: parsed.error.issues[0]?.message ?? "Check the project details.",
    };
  }

  return {
    ok: true,
    value: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      visibility: parsed.data.visibility,
    },
  };
}

function revalidateProjectPages(clubId: string) {
  revalidatePath(`/club/${clubId}/admin/projects`);
  revalidatePath(`/club/${clubId}/projects`);
  revalidatePath(`/club/${clubId}/overview`);
  revalidatePath(`/club/${clubId}`);
  updateTag("club-page");
}

export async function createProjectAction(
  clubId: string,
  input: ProjectInput
): Promise<ProjectActionResult> {
  const normalized = normalizeProject(input);
  if (!normalized.ok) return { errorMessage: normalized.errorMessage };

  const auth = await getAuthorizedClient(clubId);
  if (!auth.ok) return { errorMessage: auth.errorMessage };

  const { error } = await auth.supabase.from("club_projects").insert({
    club_id: clubId,
    ...normalized.value,
  });

  if (error) return { errorMessage: error.message };
  revalidateProjectPages(clubId);
  return { success: true };
}

export async function updateProjectAction(
  clubId: string,
  projectId: string,
  input: ProjectInput
): Promise<ProjectActionResult> {
  const normalized = normalizeProject(input);
  if (!normalized.ok) return { errorMessage: normalized.errorMessage };

  const auth = await getAuthorizedClient(clubId);
  if (!auth.ok) return { errorMessage: auth.errorMessage };

  const { data, error } = await auth.supabase
    .from("club_projects")
    .update(normalized.value)
    .eq("id", projectId)
    .eq("club_id", clubId)
    .select("id")
    .maybeSingle();

  if (error) return { errorMessage: error.message };
  if (!data) return { errorMessage: "This project no longer exists or could not be updated." };
  revalidateProjectPages(clubId);
  return { success: true };
}

export async function deleteProjectAction(
  clubId: string,
  projectId: string
): Promise<ProjectActionResult> {
  const auth = await getAuthorizedClient(clubId);
  if (!auth.ok) return { errorMessage: auth.errorMessage };

  const { data, error } = await auth.supabase
    .from("club_projects")
    .delete()
    .eq("id", projectId)
    .eq("club_id", clubId)
    .select("id")
    .maybeSingle();

  if (error) return { errorMessage: error.message };
  if (!data) return { errorMessage: "This project no longer exists or could not be deleted." };
  revalidateProjectPages(clubId);
  return { success: true };
}
