import type { Metadata } from "next";
import { VerificationCard } from "./_components/verification-card";

export const metadata: Metadata = {
  title: "Verify your email | ClubLinked",
  description: "Verify your email address to finish creating your ClubLinked account.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <main className="clublinked-page-background flex min-h-screen items-center justify-center px-5 py-12">
      <VerificationCard email={email.slice(0, 320)} />
    </main>
  );
}
