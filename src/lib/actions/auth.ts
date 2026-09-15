"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getAuthConfirmUrl } from "@/lib/auth/site-url";

const emailSchema = z.string().trim().email("Enter a valid email address.").max(320);

const signUpSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  major: z.string().trim().max(120).optional(),
  academicYear: z.string().trim().max(40).optional(),
  universityId: z.string().uuid().optional(),
});

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
  major?: string,
  academicYear?: string,
  universityId?: string
): Promise<{ errorMessage?: string; requiresEmailConfirmation?: boolean; email?: string } | null> => {
  try {
    const parsed = signUpSchema.safeParse({ firstName, lastName, email, password, major, academicYear, universityId });
    if (!parsed.success) {
      return { errorMessage: parsed.error.issues[0]?.message ?? "Check your account details." };
    }

    const supabase = await createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: getAuthConfirmUrl(),
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          major: parsed.data.major ?? "",
          academic_year: parsed.data.academicYear ?? "",
          university_id: parsed.data.universityId ?? null,
        },
      },
    });

    if (signUpError) throw signUpError;

    if (signUpData?.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
      return { errorMessage: "This email is already in use. Please use a different email or log in." };
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      return { errorMessage: "Failed to create user account." };
    }

    // When email confirmation is enabled Supabase does not create a session
    // yet. Profile fields remain in signed auth metadata and are persisted by
    // /auth/confirm after the address is verified.
    if (!signUpData.session) {
      return {
        requiresEmailConfirmation: true,
        email: parsed.data.email,
      };
    }

    const { error: insertError } = await supabase.from("profiles").upsert({
      id: userId,
      email: parsed.data.email,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      major: parsed.data.major || null,
      academic_year: parsed.data.academicYear || null,
      university_id: parsed.data.universityId || null,
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

export async function resendVerificationAction(email: string): Promise<{ errorMessage?: string }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { errorMessage: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: getAuthConfirmUrl() },
  });
  if (error) {
    console.error("[auth/resend-verification]", error.message);
    return { errorMessage: "A new verification email could not be sent yet. Please wait and try again." };
  }
  return {};
}

export async function requestPasswordResetAction(email: string): Promise<{ errorMessage?: string }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { errorMessage: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: getAuthConfirmUrl(),
  });
  if (error) console.error("[auth/request-password-reset]", error.message);

  // Keep the response generic so this endpoint cannot reveal registered users.
  return {};
}

export async function requestOwnPasswordResetAction(): Promise<{ errorMessage?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { errorMessage: "Sign in again before changing your password." };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: getAuthConfirmUrl(),
  });
  if (error) {
    console.error("[auth/request-own-password-reset]", error.message);
    return { errorMessage: "The reset email could not be sent yet. Please wait and try again." };
  }
  return {};
}

export async function requestEmailChangeAction(newEmail: string): Promise<{ errorMessage?: string }> {
  const parsed = emailSchema.safeParse(newEmail);
  if (!parsed.success) return { errorMessage: "Enter a valid email address." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { errorMessage: "Sign in again before changing your email." };
  if (user.email?.toLowerCase() === parsed.data.toLowerCase()) {
    return { errorMessage: "Enter a different email address." };
  }

  const { error } = await supabase.auth.updateUser(
    { email: parsed.data },
    { emailRedirectTo: getAuthConfirmUrl() },
  );
  if (error) {
    console.error("[auth/request-email-change]", error.message);
    return { errorMessage: error.message };
  }
  return {};
}

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
