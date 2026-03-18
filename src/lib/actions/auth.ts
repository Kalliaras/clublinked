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
  major?: string,
  universityId?: string,
  emailDomain?: string
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();

    // Validate email domain if provided
    if (emailDomain) {
      const userDomain = email.split("@")[1]?.toLowerCase();
      if (userDomain !== emailDomain.toLowerCase()) {
        return {
          errorMessage: `Please use your university email (@${emailDomain}) to sign up.`,
        };
      }
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    if (signUpData?.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
      return { errorMessage: "This email is already in use. Please use a different email or log in." };
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      return { errorMessage: "Failed to create user account." };
    }

    const { error: insertError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      major: major ?? null,
      academic_year: year ?? null,
      university_id: universityId ?? null,
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
