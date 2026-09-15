"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = { errorMessage?: string; successMessage?: string };

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export async function updatePasswordAction(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { errorMessage: parsed.error.issues[0]?.message ?? "Enter a valid password." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { errorMessage: "Your recovery link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("[auth/reset-password]", error.message);
    return { errorMessage: error.message };
  }

  return { successMessage: "Your password has been updated successfully." };
}
