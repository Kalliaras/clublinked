"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type UserProfileInput = {
  firstName: string;
  lastName: string;
  major: string;
  academicYear: string;
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
  xUrl: string;
  portfolioUrl: string;
  resume: string | null;
  interestIds: string[];
  skillIds: string[];
};

const ACADEMIC_YEARS = new Set([
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
  "Other",
]);

function normalizeUrl(
  value: string,
  label: string,
  allowedHosts?: readonly string[]
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${label} must use http or https.`);
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (allowedHosts && !allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
    throw new Error(`${label} must link to ${allowedHosts.join(" or ")}.`);
  }

  const normalized = url.toString();
  if (normalized.length > 500) throw new Error(`${label} is too long.`);
  return normalized;
}

export async function updateUserProfileAction(
  profileId: string,
  input: UserProfileInput
): Promise<{ errorMessage?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== profileId) {
      return { errorMessage: "You can only edit your own profile." };
    }

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const major = input.major.trim();
    const academicYear = input.academicYear.trim();
    const bio = input.bio.trim();

    if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80) {
      return { errorMessage: "First and last name are required and must be 80 characters or fewer." };
    }
    if (major.length > 120) return { errorMessage: "Major must be 120 characters or fewer." };
    if (academicYear && !ACADEMIC_YEARS.has(academicYear)) {
      return { errorMessage: "Choose a valid academic year." };
    }
    if (bio.length > 4000) return { errorMessage: "Bio must be 4,000 characters or fewer." };
    if (input.interestIds.length > 30 || input.skillIds.length > 30) {
      return { errorMessage: "Choose no more than 30 interests and 30 skills." };
    }

    const resume = input.resume?.trim() || null;
    if (resume && (!resume.startsWith(`${user.id}/`) || !resume.toLowerCase().endsWith(".pdf"))) {
      return { errorMessage: "Resume must be a PDF from your resume storage folder." };
    }

    const { error } = await supabase.rpc("update_own_user_profile", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_major: major,
      p_academic_year: academicYear,
      p_bio: bio,
      p_linkedin_url: normalizeUrl(input.linkedinUrl, "LinkedIn", ["linkedin.com"]),
      p_github_url: normalizeUrl(input.githubUrl, "GitHub", ["github.com"]),
      p_instagram_url: normalizeUrl(input.instagramUrl, "Instagram", ["instagram.com"]),
      p_x_url: normalizeUrl(input.xUrl, "X", ["x.com", "twitter.com"]),
      p_portfolio_url: normalizeUrl(input.portfolioUrl, "Portfolio"),
      p_resume: resume,
      p_interest_ids: [...new Set(input.interestIds)],
      p_skill_ids: [...new Set(input.skillIds)],
    });

    if (error) return { errorMessage: error.message };

    revalidatePath(`/user/profile/${profileId}`);
    revalidatePath(`/user/profile/${profileId}/edit`);
    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    return {
      errorMessage: error instanceof Error ? error.message : "Could not save your profile.",
    };
  }
}
