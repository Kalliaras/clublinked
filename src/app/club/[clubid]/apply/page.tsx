import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import ApplicationForm from "./_components/application-form";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/user/login`);
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, club_image, uses_applications")
    .eq("id", clubid)
    .single();

  if (clubError || !club || !club.uses_applications) {
    redirect(`/club/${clubid}`);
  }

  const { data: application } = await supabase
    .from("club_applications")
    .select("id, title, description")
    .eq("club_id", clubid)
    .eq("is_active", true)
    .maybeSingle();

  if (!application) {
    redirect(`/club/${clubid}`);
  }

  const { data: existingSubmission, error: submissionCheckError } = await supabase
    .from("application_submissions")
    .select("id, status, submitted_at")
    .eq("application_id", application.id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (submissionCheckError) redirect(`/club/${clubid}`);

  const { data: questions, error: questionsError } = await supabase
    .from("application_questions")
    .select("id, question_text, question_type, is_required, order, options")
    .eq("application_id", application.id)
    .order("order", { ascending: true });

  if (questionsError) redirect(`/club/${clubid}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, major, academic_year, resume")
    .eq("id", user.id)
    .maybeSingle();

  // Already submitted — show a simple status page
  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
            Application submitted
          </h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
            You already applied to <strong>{club.name}</strong>. Your application
            is currently <strong>{existingSubmission.status}</strong>.
          </p>
          <Button asChild className="rounded-xl px-8 py-3 text-sm font-semibold">
            <Link href={`/club/${clubid}`}>Back to club page</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Normalize options from jsonb (array of strings)
  const normalizedQuestions = (questions ?? []).map((q) => ({
    ...q,
    options: Array.isArray(q.options)
      ? (q.options as unknown[]).filter((o): o is string => typeof o === "string")
      : null,
  }));

  return (
    <ApplicationForm
      club={{ id: club.id, name: club.name, club_image: club.club_image }}
      application={application}
      questions={normalizedQuestions}
      profile={{
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
        major: profile?.major ?? null,
        academic_year: profile?.academic_year ?? null,
        resume: profile?.resume ?? null,
      }}
    />
  );
}
