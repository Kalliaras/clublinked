import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/get-user";
import { Button } from "@/components/ui/button";
import ApplicationForm from "./_components/application-form";
import ApplicationReviewView from "./_components/application-review";
import type { ApplicationReview } from "./_components/review-types";

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ clubid: string }>;
  searchParams: Promise<{ submission?: string }>;
}) {
  const [{ clubid }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    redirect(`/user/login`);
  }

  if (query.submission) {
    const { data, error } = await supabase.rpc("get_application_review", {
      p_submission_id: query.submission,
      p_club_id: clubid,
    });

    if (error || !data || typeof data !== "object" || Array.isArray(data)) {
      redirect(`/club/${clubid}/admin/applications`);
    }

    return (
      <ApplicationReviewView review={data as unknown as ApplicationReview} />
    );
  }

  const [clubResult, applicationResult] = await Promise.all([
    supabase
      .from("clubs")
      .select("id, name, club_image, uses_applications")
      .eq("id", clubid)
      .single(),
    supabase
      .from("club_applications")
      .select("id, title, description")
      .eq("club_id", clubid)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  const { data: club, error: clubError } = clubResult;

  if (clubError || !club || !club.uses_applications) {
    redirect(`/club/${clubid}`);
  }

  const { data: application } = applicationResult;

  if (!application) {
    redirect(`/club/${clubid}`);
  }

  const [submissionResult, questionsResult, profileResult] = await Promise.all([
    supabase
      .from("application_submissions")
      .select("id, status, submitted_at")
      .eq("application_id", application.id)
      .eq("student_id", user.id)
      .maybeSingle(),
    supabase
      .from("application_questions")
      .select("id, question_text, question_type, is_required, order, options")
      .eq("application_id", application.id)
      .order("order", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, major, academic_year, resume")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const { data: existingSubmission, error: submissionCheckError } = submissionResult;
  const { data: questions, error: questionsError } = questionsResult;
  const { data: profile } = profileResult;

  if (submissionCheckError || questionsError) redirect(`/club/${clubid}`);

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
        id: profile?.id ?? null,
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
        major: profile?.major ?? null,
        academic_year: profile?.academic_year ?? null,
        resume: profile?.resume ?? null,
      }}
    />
  );
}
