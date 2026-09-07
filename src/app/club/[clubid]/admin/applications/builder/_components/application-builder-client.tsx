"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  CircleDot,
  FileText,
  GripVertical,
  ListPlus,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/tailwind";
import { saveApplicationBuilderAction } from "../actions";
import type {
  ApplicationBuilderData,
  ApplicationQuestionDraft,
  QuestionType,
} from "../types";

function normalizeQuestions(data: ApplicationBuilderData): ApplicationQuestionDraft[] {
  return (data.application?.questions ?? []).map((question) => ({
    clientId: question.id,
    id: question.id,
    questionText: question.question_text,
    questionType: (["text", "textarea", "multiple_choice"].includes(question.question_type)
      ? question.question_type
      : "text") as QuestionType,
    isRequired: question.is_required,
    options: Array.isArray(question.options)
      ? question.options.filter((option): option is string => typeof option === "string")
      : [],
  }));
}

function newQuestion(): ApplicationQuestionDraft {
  return {
    clientId: crypto.randomUUID(),
    id: null,
    questionText: "",
    questionType: "text",
    isRequired: true,
    options: [],
  };
}

function QuestionPreview({ question }: { question: ApplicationQuestionDraft }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-900">
        {question.questionText.trim() || "Untitled question"}
        {question.isRequired && <span className="ml-1 text-red-500">*</span>}
      </label>
      {question.questionType === "text" && (
        <input
          disabled
          placeholder="Short answer"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400"
        />
      )}
      {question.questionType === "textarea" && (
        <textarea
          disabled
          placeholder="Long answer"
          className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm placeholder:text-slate-400"
        />
      )}
      {question.questionType === "multiple_choice" && (
        <div className="space-y-2">
          {(question.options.length ? question.options : ["Option 1", "Option 2"]).map((option, index) => (
            <div key={`${option}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <span className="size-4 rounded-full border-2 border-slate-300" />
              {option || `Option ${index + 1}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApplicationBuilderClient({
  clubId,
  data,
}: {
  clubId: string;
  data: ApplicationBuilderData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [applicationId, setApplicationId] = React.useState(data.application?.id ?? null);
  const [title, setTitle] = React.useState(data.application?.title ?? "");
  const [description, setDescription] = React.useState(data.application?.description ?? "");
  const [isActive, setIsActive] = React.useState(data.application?.is_active ?? false);
  const [questions, setQuestions] = React.useState(() => normalizeQuestions(data));

  React.useEffect(() => {
    if (!data.application) return;
    setApplicationId(data.application.id);
    setTitle(data.application.title);
    setDescription(data.application.description ?? "");
    setIsActive(data.application.is_active);
    setQuestions(normalizeQuestions(data));
  }, [data]);

  function updateQuestion(
    clientId: string,
    update: (question: ApplicationQuestionDraft) => ApplicationQuestionDraft
  ) {
    setQuestions((current) =>
      current.map((question) => (question.clientId === clientId ? update(question) : question))
    );
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= questions.length) return;
    setQuestions((current) => {
      const reordered = [...current];
      const [question] = reordered.splice(index, 1);
      reordered.splice(destination, 0, question);
      return reordered;
    });
  }

  function save() {
    startTransition(async () => {
      const result = await saveApplicationBuilderAction(clubId, {
        applicationId,
        title,
        description,
        isActive,
        questions,
      });

      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }

      setApplicationId(result.applicationId ?? applicationId);
      toast.success(applicationId ? "Application updated." : "Application created.");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex min-h-[72px] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button variant="outline" size="icon" className="shrink-0 rounded-xl" asChild>
          <Link href={`/club/${clubId}/admin/applications`} aria-label="Back to applications">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-bold text-slate-950">
              {title.trim() || "New application"}
            </h1>
            <span className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold",
              isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}>
              {isActive ? "Published" : "Draft"}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">{data.club.name || "Club"} · {questions.length} questions</p>
        </div>
        <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
          <Check className="size-3.5" />
          Save when ready
        </span>
        <Button className="rounded-xl px-5" disabled={isPending} onClick={save}>
          {isPending ? "Saving…" : applicationId ? "Save changes" : "Create application"}
        </Button>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <main className="border-r border-slate-200 bg-white px-4 py-7 sm:px-7">
          <div className="mx-auto max-w-2xl space-y-7">
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Form settings</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Application setup</h2>
              <p className="mt-1 text-sm text-slate-500">Name the form and choose whether students can apply.</p>

              <div className="mt-5 grid gap-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <div className="grid gap-2">
                  <Label htmlFor="application-title">Form name</Label>
                  <Input
                    id="application-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Analyst Program 2027"
                    maxLength={160}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="application-description">Description</Label>
                  <Textarea
                    id="application-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Tell applicants what this opportunity is about."
                    maxLength={4000}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <Label htmlFor="application-active">Accepting applications</Label>
                    <p className="mt-1 text-xs text-slate-500">Published applications appear on the club page.</p>
                  </div>
                  <Switch id="application-active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </section>

            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Form structure</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Questions</h2>
              <p className="mt-1 text-sm text-slate-500">Set the order, answer type, and required fields.</p>

              <div className="mt-5 space-y-3">
                {questions.map((question, index) => (
                  <article key={question.clientId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <GripVertical className="size-4 shrink-0 text-slate-300" />
                      <span className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, -1)}
                        aria-label="Move question up"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === questions.length - 1}
                        onClick={() => moveQuestion(index, 1)}
                        aria-label="Move question down"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setQuestions((current) => current.filter((item) => item.clientId !== question.clientId))}
                        aria-label="Delete question"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="grid gap-4 pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`question-${question.clientId}`}>Question</Label>
                        <Input
                          id={`question-${question.clientId}`}
                          value={question.questionText}
                          onChange={(event) => updateQuestion(question.clientId, (current) => ({ ...current, questionText: event.target.value }))}
                          placeholder="What would you like to ask?"
                          maxLength={500}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="grid gap-2">
                          <Label htmlFor={`type-${question.clientId}`}>Answer type</Label>
                          <select
                            id={`type-${question.clientId}`}
                            value={question.questionType}
                            onChange={(event) => {
                              const questionType = event.target.value as QuestionType;
                              updateQuestion(question.clientId, (current) => ({
                                ...current,
                                questionType,
                                options: questionType === "multiple_choice" && current.options.length < 2
                                  ? ["Option 1", "Option 2"]
                                  : current.options,
                              }));
                            }}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          >
                            <option value="text">Short answer</option>
                            <option value="textarea">Long answer</option>
                            <option value="multiple_choice">Multiple choice</option>
                          </select>
                        </div>
                        <label className="flex h-10 items-center gap-2 text-sm font-medium text-slate-700">
                          <Switch
                            checked={question.isRequired}
                            onCheckedChange={(isRequired) => updateQuestion(question.clientId, (current) => ({ ...current, isRequired }))}
                          />
                          Required
                        </label>
                      </div>

                      {question.questionType === "multiple_choice" && (
                        <div className="grid gap-2 rounded-xl bg-slate-50 p-3">
                          <Label>Answer options</Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(event) => updateQuestion(question.clientId, (current) => ({
                                  ...current,
                                  options: current.options.map((item, indexToUpdate) => indexToUpdate === optionIndex ? event.target.value : item),
                                }))}
                                placeholder={`Option ${optionIndex + 1}`}
                                maxLength={200}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={question.options.length <= 2}
                                onClick={() => updateQuestion(question.clientId, (current) => ({
                                  ...current,
                                  options: current.options.filter((_, indexToRemove) => indexToRemove !== optionIndex),
                                }))}
                                aria-label={`Remove option ${optionIndex + 1}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            className="justify-start"
                            disabled={question.options.length >= 20}
                            onClick={() => updateQuestion(question.clientId, (current) => ({
                              ...current,
                              options: [...current.options, `Option ${current.options.length + 1}`],
                            }))}
                          >
                            <Plus className="size-4" /> Add option
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full rounded-xl border-dashed py-6 text-primary"
                disabled={questions.length >= 50}
                onClick={() => setQuestions((current) => [...current, newQuestion()])}
              >
                <ListPlus className="size-4" /> Add a question
              </Button>
            </section>
          </div>
        </main>

        <aside className="hidden bg-slate-50 p-7 lg:block xl:p-10">
          <div className="sticky top-28">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              <CircleDot className="size-4" /> Live preview · What students see
            </div>
            <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-primary px-7 py-8 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">{data.club.name || "Club application"}</p>
                <h2 className="mt-2 text-2xl font-extrabold">{title.trim() || "Application title"}</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  {description.trim() || "Add a description to introduce this opportunity."}
                </p>
              </div>
              <div className="space-y-7 p-7">
                {questions.length ? (
                  questions.map((question) => <QuestionPreview key={question.clientId} question={question} />)
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto size-7 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-600">No questions yet</p>
                    <p className="mt-1 text-xs text-slate-400">Add a question to see it here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
