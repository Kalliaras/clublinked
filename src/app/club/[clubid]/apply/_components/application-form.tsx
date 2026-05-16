"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitApplicationAction,
  type SubmitAnswerInput,
} from "../actions";

type Question = {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  order: number;
  options: string[] | null;
};

type Profile = {
  id : string | null;
  first_name: string | null;
  last_name: string | null;
  major: string | null;
  academic_year: string | null;
  resume: string | null;
};

type Club = {
  id: string;
  name: string | null;
  club_image: string | null;
};

type Application = {
  id: string;
  title: string;
  description: string | null;
};

export default function ApplicationForm({
  club,
  application,
  questions,
  profile,
}: {
  club: Club;
  application: Application;
  questions: Question[];
  profile: Profile;
}) {
  const router = useRouter();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
      if (q.is_required && !answers[q.id]?.trim()) {
        newErrors[q.id] = "This field is required.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please answer all required questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const answerPayload: SubmitAnswerInput[] = questions.map((q) => ({
        questionId: q.id,
        answerText: answers[q.id] ?? "",
      }));

      const result = await submitApplicationAction(
        application.id,
        club.id,
        answerPayload
      );

      if (result?.errorMessage) {
        toast.error(result.errorMessage);
      } else {
        toast.success("Application submitted! We'll be in touch.");
        router.push(`/club/${club.id}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const requiredCount = questions.filter((q) => q.is_required).length;
  const answeredRequired = questions.filter(
    (q) => q.is_required && answers[q.id]?.trim()
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/club/${club.id}`}
            className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden relative">
              {club.club_image ? (
                <Image
                  src={club.club_image}
                  alt={club.name ?? "Club logo"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                club.name?.trim().slice(0, 2).toUpperCase() || "CL"
              )}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-900">{club.name}</div>
              <div className="text-slate-500">{application.title}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 mx-auto w-full max-w-2xl px-8 py-12 pb-32 flex flex-col gap-5">

        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Application</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
            {application.title}
          </h1>
          {application.description && (
            <p className="text-slate-500 text-[15px] leading-relaxed">{application.description}</p>
          )}
        </div>

        {/* About you — pre-filled from profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">About you</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Full name
              </label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-900 text-[15px] bg-slate-50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                value={fullName || "—"}
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Major</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-900 text-[15px] bg-slate-50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={profile.major || "—"}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Graduation year</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-900 text-[15px] bg-slate-50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={profile.academic_year || "—"}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic questions */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col gap-8">
            <h2 className="text-lg font-bold text-slate-900">Application questions</h2>
            {questions.map((q) => (
              <div key={q.id}>
                <label className="block text-[15px] font-semibold text-slate-900 mb-1.5">
                  {q.question_text}
                  {q.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {q.question_type === "text" && (
                  <input
                    className={`w-full h-12 px-4 rounded-xl border text-slate-900 text-[15px] outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                      errors[q.id]
                        ? "border-red-400 focus:border-red-400"
                        : "border-slate-200 focus:border-primary"
                    }`}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Your answer"
                  />
                )}

                {q.question_type === "textarea" && (
                  <>
                    <textarea
                      className={`w-full min-h-[120px] px-4 py-3 rounded-xl border text-slate-900 text-[15px] leading-relaxed outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-y ${
                        errors[q.id]
                          ? "border-red-400 focus:border-red-400"
                          : "border-slate-200 focus:border-primary"
                      }`}
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Your answer"
                    />
                    <p className="text-right text-xs text-slate-400 mt-1">
                      <strong className="text-slate-600">{(answers[q.id] ?? "").length}</strong> characters
                    </p>
                  </>
                )}

                {q.question_type === "multiple_choice" && q.options && (
                  <div className={`flex flex-col gap-2.5 mt-1 rounded-xl ${errors[q.id] ? "ring-2 ring-red-400 ring-offset-1" : ""}`}>
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                          answers[q.id] === opt
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                            answers[q.id] === opt
                              ? "border-primary"
                              : "border-slate-300"
                          }`}
                        >
                          {answers[q.id] === opt && (
                            <span className="h-2 w-2 rounded-full bg-primary block" />
                          )}
                        </span>
                        {opt}
                        <input
                          type="radio"
                          className="sr-only"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswer(q.id, opt)}
                        />
                      </label>
                    ))}
                  </div>
                )}

                {errors[q.id] && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">{errors[q.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Documents — resume display only */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Documents</h2>
          {profile.resume ? (
            <div className="flex items-center gap-4 bg-primary/5 border border-slate-200 rounded-xl p-4">
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Resume attached</p>
                <p className="text-xs text-slate-500 mt-0.5">From your ClubLinked profile</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">No resume on file</p>
              <p className="text-xs text-slate-400">
                Add a resume to your{" "}
                <Link href={`/user/profile/${profile.id}`} className="text-primary font-semibold hover:underline">
                  profile
                </Link>{" "}
                to attach it here.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── Sticky footer ── */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4 z-50">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            <strong className="text-slate-800">{answeredRequired}</strong> of{" "}
            <strong className="text-slate-800">{requiredCount}</strong> required questions answered
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={`/club/${club.id}`}>Cancel</Link>
            </Button>
            <Button
              className="rounded-xl px-8"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit application"}
            </Button>
          </div>
        </div>
      </footer>

    </div>
  );
}
