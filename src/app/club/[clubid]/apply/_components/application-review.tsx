import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  ChevronLeft,
  FileText,
  Mail,
} from "lucide-react";
import ReviewActions from "./review-actions";
import type { ApplicationReview } from "./review-types";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  interview: "bg-violet-50 text-violet-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ApplicationReviewView({
  review,
}: {
  review: ApplicationReview;
}) {
  const fullName = [review.student.first_name, review.student.last_name]
    .filter(Boolean)
    .join(" ") || "Applicant";
  const isAccepted = review.submission.status === "accepted";

  return (
    <div className={`min-h-screen bg-[#F7F8FA] ${isAccepted ? "pb-10" : "pb-28"}`}>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={`/club/${review.club.id}/admin/applications`}
            aria-label="Back to applications"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-white">
              {review.club.club_image ? (
                <Image
                  src={review.club.club_image}
                  alt={`${review.club.name ?? "Club"} logo`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                review.club.name?.trim().slice(0, 2).toUpperCase() || "CL"
              )}
            </div>
            <div className="min-w-0 text-sm">
              <div className="truncate font-semibold text-slate-900">
                {review.club.name}
              </div>
              <div className="truncate text-slate-500">Application review</div>
            </div>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[review.submission.status]}`}
        >
          {review.submission.status}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Applicant review
            </p>
            <p className="text-xs text-slate-500">
              Submitted {formatDate(review.submission.submitted_at)}
            </p>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            {fullName}
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">
            {review.application.title}
          </p>
          {review.application.description && (
            <p className="mt-5 border-t border-slate-100 pt-5 text-[15px] leading-relaxed text-slate-600">
              {review.application.description}
            </p>
          )}
        </section>

        {review.submission.status === "interview" && (
          <section className="flex items-start gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-violet-950">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
            <div>
              <h2 className="font-bold">Interview stage</h2>
              <p className="mt-1 text-sm text-violet-700">
                {review.interview?.interview_time
                  ? `Scheduled for ${formatDate(review.interview.interview_time)}`
                  : "No interview time has been scheduled yet."}
              </p>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-bold text-slate-950">About the applicant</h2>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Major</dt>
              <dd className="mt-1.5 text-[15px] font-medium text-slate-800">
                {review.student.major || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Graduation year</dt>
              <dd className="mt-1.5 text-[15px] font-medium text-slate-800">
                {review.student.academic_year || "Not provided"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
              <dd className="mt-1.5">
                {review.student.email ? (
                  <a
                    href={`mailto:${review.student.email}`}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {review.student.email}
                  </a>
                ) : (
                  <span className="text-[15px] text-slate-500">Not provided</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="mb-7 text-lg font-bold text-slate-950">Application answers</h2>
          {review.questions.length ? (
            <div className="divide-y divide-slate-100">
              {review.questions.map((question, index) => (
                <article key={question.id} className="py-6 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Question {index + 1}
                  </p>
                  <h3 className="mt-2 text-[15px] font-semibold leading-relaxed text-slate-900">
                    {question.question_text}
                  </h3>
                  <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700">
                    {question.answer_text?.trim() || "No answer provided"}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">This application has no questions.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="mb-5 text-lg font-bold text-slate-950">Documents</h2>
          {review.student.resume ? (
            <a
              href={review.student.resume}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-primary/5 p-4 transition-colors hover:border-primary/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">View resume</span>
                <span className="mt-0.5 block text-xs text-slate-500">Opens in a new tab</span>
              </span>
            </a>
          ) : (
            <p className="text-sm text-slate-500">No resume was attached.</p>
          )}
        </section>
      </main>

      {!isAccepted && (
        <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="hidden text-sm text-slate-500 sm:block">
              Choose the next stage for {fullName}.
            </p>
            <ReviewActions
              submissionId={review.submission.id}
              clubId={review.club.id}
              applicantName={fullName}
            />
          </div>
        </footer>
      )}
    </div>
  );
}
