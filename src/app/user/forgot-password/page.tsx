import type { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | ClubLinked",
  description: "Request a secure ClubLinked password reset link.",
};

export default function ForgotPasswordPage() {
  return <main className="clublinked-page-background flex min-h-screen items-center justify-center px-5 py-12"><ForgotPasswordForm /></main>;
}
