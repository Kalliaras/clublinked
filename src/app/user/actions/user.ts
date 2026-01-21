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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          year,
          major,
        },
      },
    });

    if (error) throw error;

    // Check if signup succeeded but user has no identities (duplicate email case)
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      return { errorMessage: "This email is already in use. Please use a different email or log in." };
    }

    // If a user object is returned, create a corresponding profiles row.
    const user = data?.user;
    if (user?.id) {
      try {
        await supabase.from("profiles").insert({
          id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          major: major ?? null,
          year: year ?? null,
          created_at: new Date().toISOString(),
        });
      } catch (insertError) {
        console.error("Failed to insert profile:", insertError);
      }
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
