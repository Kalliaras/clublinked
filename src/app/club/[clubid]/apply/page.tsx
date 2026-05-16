import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplicationForm from "./_components/application-form";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/user/login`);
  }

  // Load club
  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, club_image, uses_applications")
    .eq("id", clubid)
    .single();

  if (clubError || !club || !club.uses_applications) {
    redirect(`/club/${clubid}`);
  }

  // Load active application for this club
  const { data: application } = await supabase
    .from("club_applications")
    .select("id, title, description")
    .eq("club_id", clubid)
    .eq("is_active", true)
    .maybeSingle();

  if (!application) {
    redirect(`/club/${clubid}`);
  }

  // Check if already submitted
  const { data: existingSubmission } = await supabase
    .from("application_submissions")
    .select("id, status, submitted_at")
    .eq("application_id", application.id)
    .eq("student_id", user.id)
    .maybeSingle();

  // Load questions ordered by order column
  const { data: questions } = await supabase
    .from("application_questions")
    .select("id, question_text, question_type, is_required, order, options")
    .eq("application_id", application.id)
    .order("order", { ascending: true });

  // Load user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, major, academic_year, resume")
    .eq("id", user.id)
    .single();

  // Already submitted — show a simple status page
  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <svg
              className="h-8 w-8 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
            Application submitted
          </h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
            You already applied to <strong>{club.name}</strong>. Your application
            is currently <strong>{existingSubmission.status}</strong>.
          </p>
          <a
            href={`/club/${clubid}`}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-8 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Back to club page
          </a>
        </div>
      </div>
    );
  }

  // Normalize options from jsonb (array of strings)
  const normalizedQuestions = (questions ?? []).map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? (q.options as string[]) : null,
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
