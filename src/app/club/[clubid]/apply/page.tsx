import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import ApplicationForm from "./_components/application-form";
import ApplicationReviewView from "./_components/application-review";
import type { ApplicationReview } from "./_components/review-types";

type Workspace = {
  club: { id: string; name: string | null; club_image: string | null };
  application: { id: string; title: string; description: string | null; is_active: boolean };
  profile: { id: string; first_name: string | null; last_name: string | null; major: string | null; academic_year: string | null; resume: string | null };
  submission: { id: string; status: string; application_complete: boolean } | null;
  questions: Array<{ id: string; question_text: string; question_type: string; is_required: boolean; order: number; options: unknown; answer_text: string | null }>;
};

export default async function ApplyPage({ params, searchParams }: {
  params: Promise<{ clubid: string }>;
  searchParams: Promise<{ submission?: string; tab?: string }>;
}) {
  const [{ clubid }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const userPromise = getUser();

  if (query.submission) {
    const [user, reviewResult] = await Promise.all([
      userPromise,
      supabase.rpc("get_application_review", { p_submission_id: query.submission, p_club_id: clubid }),
    ]);
    if (!user) redirect("/user/login");
    if (reviewResult.error || !reviewResult.data || typeof reviewResult.data !== "object" || Array.isArray(reviewResult.data)) {
      redirect("/club/" + clubid + "/admin/applications");
    }
    return <ApplicationReviewView review={reviewResult.data as unknown as ApplicationReview} activeTab={query.tab === "feedback" ? "feedback" : "application"} />;
  }

  const [user, workspaceResult] = await Promise.all([
    userPromise,
    supabase.rpc("get_student_application_workspace", { p_club_id: clubid }),
  ]);
  if (!user) redirect("/user/login");
  if (workspaceResult.error || !workspaceResult.data || typeof workspaceResult.data !== "object" || Array.isArray(workspaceResult.data)) {
    redirect("/club/" + clubid);
  }

  const workspace = workspaceResult.data as unknown as Workspace;
  if (workspace.submission?.application_complete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 className="h-8 w-8 text-emerald-500" /></div>
          <h1 className="mb-3 text-2xl font-extrabold text-slate-950">Application submitted</h1>
          <p className="mb-8 text-[15px] leading-relaxed text-slate-500">Your application to <strong>{workspace.club.name}</strong> is now in your application tracker.</p>
          <Button asChild className="rounded-xl px-8"><Link href={"/user/profile/" + user.id + "/applications"}>View applications</Link></Button>
        </div>
      </div>
    );
  }
  if (!workspace.application.is_active) redirect("/club/" + clubid);

  const questions = workspace.questions.map((question) => ({
    ...question,
    options: Array.isArray(question.options) ? question.options.filter((option): option is string => typeof option === "string") : null,
  }));
  const initialAnswers = Object.fromEntries(workspace.questions.filter((question) => question.answer_text !== null).map((question) => [question.id, question.answer_text as string]));
  return <ApplicationForm club={workspace.club} application={workspace.application} questions={questions} profile={workspace.profile} initialAnswers={initialAnswers} />;
}
