"use server";

import { createClient } from "@/lib/supabase/server";

export const LoginAction = async (email: string, password: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return null;
  } catch (error) {
    console.error("Error logging in user:", error);
    return { errorMessage: (error as Error).message };
  }
};

export const SignUpAction = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  year?: string,
  major?: string
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();

    // Step 1: Create auth user with email and password only
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    // Check if signup succeeded but user has no identities (duplicate email case)
    if (signUpData?.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
      return { errorMessage: "This email is already in use. Please use a different email or log in." };
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      return { errorMessage: "Failed to create user account." };
    }

    // Step 2: Insert profile data into database with the newly created user ID
    const { error: insertError } = await supabase.from("profile").upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      major: major ?? null,
      year: year ?? null,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to insert profile:", insertError);
      return { errorMessage: `Failed to store profile data: ${insertError.message}` };
    }

    return null;
  } catch (error) {
    console.error("Error signing up user:", error);
    const errorMessage = (error as Error).message;
    // Map common Supabase auth errors to user-friendly messages
    if (errorMessage.includes("already registered")) {
      return { errorMessage: "This email is already in use. Please use a different email or log in." };
    }
    return { errorMessage };
  }
};

export const LogOutAction = async () => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return null;
  } catch (error) {
    console.error("Error logging out:", error);
    return { errorMessage: (error as Error).message };
  }
};

// profile update helpers ----------------------------------------------------
export const UpdateBioAction = async (
  userId: string,
  bio: string | null
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profile")
      .update({ bio })
      .eq("id", userId);
    if (error) throw error;
    return null;
  } catch (error) {
    console.error("Error updating bio:", error);
    return { errorMessage: (error as Error).message };
  }
};

export const UpdateInterestsAction = async (
  userId: string,
  interests: string[]
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();

    // remove old interests
    const { error: delError } = await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", userId);
    if (delError) throw delError;

    // insert new interests (upsert tags first)
    for (const name of interests) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const { data, error: tagError } = await supabase
        .from("interest_tags")
        .upsert<{ name: string }>({ name: trimmed }, { onConflict: "name" })
        .select("id")
        .single();
      if (tagError) throw tagError;
      const tag = data as { id: string } | null;
      if (tag && tag.id) {
        await supabase.from("user_interests").insert({
          user_id: userId,
          interest_id: tag.id,
        });
      }

    }
    return null;
  } catch (error) {
    console.error("Error updating interests:", error);
    return { errorMessage: (error as Error).message };
  }
};

export const UpdateSkillsAction = async (
  userId: string,
  skills: string[]
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();

    // remove old skills
    const { error: delError } = await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", userId);
    if (delError) throw delError;

    for (const name of skills) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const { data, error: tagError } = await supabase
        .from("skill_tags")
        .upsert<{ name: string }>({ name: trimmed }, { onConflict: "name" })
        .select("id")
        .single();
      if (tagError) throw tagError;
      const tag = data as { id: string } | null;
      if (tag && tag.id) {
        await supabase.from("user_skills").insert({
          user_id: userId,
          skill_id: tag.id,
        });
      }
    }
    return null;
  } catch (error) {
    console.error("Error updating skills:", error);
    return { errorMessage: (error as Error).message };
  }
};
