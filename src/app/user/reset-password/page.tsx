import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password | ClubLinked",
  description: "Choose a new password for your ClubLinked account.",
};

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect("/user/login?authError=recovery_session_required");

  return (
    <main className="clublinked-page-background flex min-h-screen items-center justify-center px-5 py-12">
      <ResetPasswordForm />
    </main>
  );
}
