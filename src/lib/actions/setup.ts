"use server";

import { createClient } from "@/lib/supabase/server";

const RESERVED_SLUGS = [
  "setup",
  "api",
  "admin",
  "_next",
  "favicon",
  "public",
  "login",
  "signup",
];

export const SetupInstitutionAction = async (
  universityName: string,
  slug: string,
  emailDomain: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ errorMessage?: string; slug?: string } | null> => {
  try {
    const supabase = await createClient();

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return {
        errorMessage:
          "URL slug can only contain lowercase letters, numbers, and hyphens.",
      };
    }

    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      return {
        errorMessage: "This URL is reserved. Please choose a different one.",
      };
    }

    const { data: existing } = await supabase
      .from("universities")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return {
        errorMessage:
          "This URL is already taken. Please choose a different one.",
      };
    }

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({ email, password });
    if (signUpError) throw signUpError;

    const userId = signUpData?.user?.id;
    if (!userId) return { errorMessage: "Failed to create account." };

    const { data: university, error: uniError } = await supabase
      .from("universities")
      .insert({
        name: universityName,
        slug,
        email_domain: emailDomain || null,
      })
      .select("id")
      .single();

    if (uniError) {
      console.error("Failed to create university:", uniError);
      return {
        errorMessage: "Failed to create university. Please try again.",
      };
    }

    const { error: profileError } = await supabase.from("profile").upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      university_id: university.id,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Failed to create profile:", profileError);
      return { errorMessage: "Account created but profile setup failed." };
    }

    return { slug };
  } catch (error) {
    console.error("Error in institution setup:", error);
    return { errorMessage: (error as Error).message };
  }
};
