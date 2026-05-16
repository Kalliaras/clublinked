# Student Application Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Apply button on the club dashboard route students to a functional, dynamic application form that loads questions from the database and saves submissions.

**Architecture:** A Supabase agent creates 4 new tables (`club_applications`, `application_questions`, `application_submissions`, `application_answers`), adds `resume` to `profiles`, seeds test data, and sets RLS policies. A new full-screen page at `/club/[clubid]/apply` (server component for data-fetching + client component for the form) handles submission via a server action. The Apply button in `ClubDashboardClient` is changed from an onClick handler to a `<Link>`.

**Tech Stack:** Next.js 15 App Router, React 19, Supabase (PostgreSQL + RLS), TypeScript, Tailwind CSS, shadcn/ui, Sonner toasts, React Hook Form + Zod.

---

## File Map

| Action | File |
|---|---|
| **Create** | `src/app/club/[clubid]/apply/page.tsx` |
| **Create** | `src/app/club/[clubid]/apply/actions.ts` |
| **Create** | `src/app/club/[clubid]/apply/_components/application-form.tsx` |
| **Modify** | `src/app/club/[clubid]/_components/club-dashboard-client.tsx` |
| **Modify** | `src/lib/supabase/database.types.ts` |

> **Layout note:** `/club/[clubid]/apply` is a child route of `/club/[clubid]/layout.tsx`, which wraps every child with the full club dashboard chrome (banner, tabs, etc.). Task 3 fixes this by making `ClubDashboardClient` detect the `/apply` path and render children directly — full-screen — instead of wrapping them with the dashboard UI.

---

## Task 1: Database — create tables, seed data, add resume column

**Who:** Supabase agent  
**Files:** Supabase SQL editor (run via `supabase/migrations/INPUT_SQL_EDITOR_CODE_HERE.sql`)

- [ ] **Step 1: Write the SQL**

Write the following into `supabase/migrations/INPUT_SQL_EDITOR_CODE_HERE.sql` and run it in the Supabase SQL editor:

```sql
-- ── 1. club_applications ──────────────────────────────────────────────────
create table if not exists public.club_applications (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  title       text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── 2. application_questions ──────────────────────────────────────────────
create table if not exists public.application_questions (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.club_applications(id) on delete cascade,
  question_text  text not null,
  question_type  text not null check (question_type in ('text', 'textarea', 'multiple_choice')),
  is_required    boolean not null default true,
  "order"        integer not null default 0,
  options        jsonb
);

-- ── 3. application_submissions ────────────────────────────────────────────
create table if not exists public.application_submissions (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.club_applications(id) on delete cascade,
  student_id     uuid not null references public.profiles(id) on delete cascade,
  submitted_at   timestamptz not null default now(),
  status         text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  unique (application_id, student_id)
);

-- ── 4. application_answers ────────────────────────────────────────────────
create table if not exists public.application_answers (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.application_submissions(id) on delete cascade,
  question_id   uuid not null references public.application_questions(id) on delete cascade,
  answer_text   text
);

-- ── 5. Add resume column to profiles ─────────────────────────────────────
alter table public.profiles
  add column if not exists resume text;

-- ── 6. RLS ────────────────────────────────────────────────────────────────
alter table public.club_applications      enable row level security;
alter table public.application_questions  enable row level security;
alter table public.application_submissions enable row level security;
alter table public.application_answers    enable row level security;

-- club_applications: authenticated users can read active ones
create policy "Authenticated users can read active applications"
  on public.club_applications for select
  to authenticated
  using (is_active = true);

-- application_questions: authenticated users can read questions for active apps
create policy "Authenticated users can read questions for active applications"
  on public.application_questions for select
  to authenticated
  using (
    exists (
      select 1 from public.club_applications ca
      where ca.id = application_id and ca.is_active = true
    )
  );

-- application_submissions: students can insert and read their own
create policy "Students can insert own submissions"
  on public.application_submissions for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "Students can read own submissions"
  on public.application_submissions for select
  to authenticated
  using (student_id = auth.uid());

-- application_answers: students can insert and read answers for their own submissions
create policy "Students can insert answers for own submissions"
  on public.application_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.application_submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

create policy "Students can read answers for own submissions"
  on public.application_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.application_submissions s
      where s.id = submission_id and s.student_id = auth.uid()
    )
  );

-- ── 7. Seed test data for clubs with uses_applications = true ─────────────
-- Insert one active application per qualifying club, then 4 sample questions.
-- Uses a DO block so it's idempotent (skip if already seeded).
do $$
declare
  r record;
  app_id uuid;
begin
  for r in
    select id from public.clubs where uses_applications = true
  loop
    -- skip if already has an active application
    if exists (
      select 1 from public.club_applications
      where club_id = r.id and is_active = true
    ) then
      continue;
    end if;

    insert into public.club_applications (club_id, title, description, is_active)
    values (
      r.id,
      'General Membership Application',
      'Thank you for your interest in joining! Please fill out this form so we can learn more about you.',
      true
    )
    returning id into app_id;

    insert into public.application_questions
      (application_id, question_text, question_type, is_required, "order", options)
    values
      (app_id, 'How did you hear about us?', 'multiple_choice', true, 1,
       '["From a friend or current member", "Campus event or flyer", "ClubLinked", "Social media", "Other"]'::jsonb),
      (app_id, 'Why do you want to join this club?', 'textarea', true, 2, null),
      (app_id, 'Tell us about a project or experience you are proud of.', 'textarea', true, 3, null),
      (app_id, 'Is there anything else you would like us to know about you?', 'textarea', false, 4, null);
  end loop;
end;
$$;
```

- [ ] **Step 2: Run in Supabase SQL editor and confirm no errors**

All statements should succeed. The DO block is idempotent — safe to run again.

- [ ] **Step 3: Commit the SQL file**

```bash
git add supabase/migrations/INPUT_SQL_EDITOR_CODE_HERE.sql
git commit -m "feat: add application tables, resume column, RLS policies, and seed data"
```

---

## Task 2: Update TypeScript types

**Files:**
- Modify: `src/lib/supabase/database.types.ts`

The Supabase auto-generated types file needs entries for the 4 new tables and the `resume` field on profiles. Add these manually — they follow the exact same pattern as the existing entries.

- [ ] **Step 1: Add `resume` to the profiles Row/Insert/Update types**

In `src/lib/supabase/database.types.ts`, find the `profiles` table block (around line 260). Add `resume: string | null` to `Row`, `resume?: string | null` to `Insert`, and `resume?: string | null` to `Update`:

```typescript
// In profiles > Row:
resume: string | null

// In profiles > Insert:
resume?: string | null

// In profiles > Update:
resume?: string | null
```

- [ ] **Step 2: Add the 4 new tables to the Tables block**

Insert this block inside the `Tables: { ... }` object, after the existing `clubs` entry:

```typescript
club_applications: {
  Row: {
    id: string
    club_id: string
    title: string
    description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    club_id: string
    title: string
    description?: string | null
    is_active?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    club_id?: string
    title?: string
    description?: string | null
    is_active?: boolean
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "club_applications_club_id_fkey"
      columns: ["club_id"]
      isOneToOne: false
      referencedRelation: "clubs"
      referencedColumns: ["id"]
    },
  ]
}
application_questions: {
  Row: {
    id: string
    application_id: string
    question_text: string
    question_type: string
    is_required: boolean
    order: number
    options: Json | null
  }
  Insert: {
    id?: string
    application_id: string
    question_text: string
    question_type: string
    is_required?: boolean
    order?: number
    options?: Json | null
  }
  Update: {
    id?: string
    application_id?: string
    question_text?: string
    question_type?: string
    is_required?: boolean
    order?: number
    options?: Json | null
  }
  Relationships: [
    {
      foreignKeyName: "application_questions_application_id_fkey"
      columns: ["application_id"]
      isOneToOne: false
      referencedRelation: "club_applications"
      referencedColumns: ["id"]
    },
  ]
}
application_submissions: {
  Row: {
    id: string
    application_id: string
    student_id: string
    submitted_at: string
    status: string
  }
  Insert: {
    id?: string
    application_id: string
    student_id: string
    submitted_at?: string
    status?: string
  }
  Update: {
    id?: string
    application_id?: string
    student_id?: string
    submitted_at?: string
    status?: string
  }
  Relationships: [
    {
      foreignKeyName: "application_submissions_application_id_fkey"
      columns: ["application_id"]
      isOneToOne: false
      referencedRelation: "club_applications"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "application_submissions_student_id_fkey"
      columns: ["student_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
  ]
}
application_answers: {
  Row: {
    id: string
    submission_id: string
    question_id: string
    answer_text: string | null
  }
  Insert: {
    id?: string
    submission_id: string
    question_id: string
    answer_text?: string | null
  }
  Update: {
    id?: string
    submission_id?: string
    question_id?: string
    answer_text?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "application_answers_submission_id_fkey"
      columns: ["submission_id"]
      isOneToOne: false
      referencedRelation: "application_submissions"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "application_answers_question_id_fkey"
      columns: ["question_id"]
      isOneToOne: false
      referencedRelation: "application_questions"
      referencedColumns: ["id"]
    },
  ]
}
```

- [ ] **Step 3: Verify build compiles cleanly**

```bash
npm run build
```

Expected: no TypeScript errors related to the new types.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/database.types.ts
git commit -m "feat: add TypeScript types for application tables and resume field"
```

---

## Task 3: Update ClubDashboardClient — Apply button + layout bypass

**Files:**
- Modify: `src/app/club/[clubid]/_components/club-dashboard-client.tsx`

Two changes in this file:
1. Add a full-screen bypass: when the current path ends in `/apply`, render `{children}` directly (no banner/tabs/chrome). This allows the apply page to be full-screen even though it lives under the club dashboard route.
2. Change the Apply button from an `onClick` action to a `<Link>` routing to `/club/[clubid]/apply`.

- [ ] **Step 1: Add the apply-page bypass at the top of the render**

In `src/app/club/[clubid]/_components/club-dashboard-client.tsx`, directly after the `const basePath` declaration (around line 61), add:

```tsx
const isApplyPage = pathname?.endsWith("/apply") ?? false;

if (isApplyPage) {
  return <>{children}</>;
}
```

This must appear before the `return (` of the main JSX so that the dashboard chrome is skipped entirely when on the apply route.

- [ ] **Step 2: Replace the Apply/Join button block**

Find the button block starting at around line 141 (the `!isMember` branch) and replace the entire outer `<Button>` element with:

```tsx
usesApplications ? (
  <Link href={`/club/${clubId}/apply`}>
    <Button className="rounded-xl px-7 py-3 text-base">
      Apply
    </Button>
  </Link>
) : (
  <Button
    className="rounded-xl px-7 py-3 text-base"
    disabled={joining}
    onClick={async () => {
      setJoining(true);
      try {
        const result = await joinClubAction(clubId);
        if (result?.errorMessage) toast.error(result.errorMessage);
        else toast.success("You joined the club!");
      } catch { toast.error("Failed to join club"); }
      finally { setJoining(false); }
    }}
  >
    {joining ? "Joining..." : "Join"}
  </Button>
)
```

The full updated `!isMember` branch in context:

```tsx
) : isMember ? (
  <Button variant="secondary" className="rounded-xl px-7 py-3 text-base" disabled>
    Joined
  </Button>
) : (
  usesApplications ? (
    <Link href={`/club/${clubId}/apply`}>
      <Button className="rounded-xl px-7 py-3 text-base">
        Apply
      </Button>
    </Link>
  ) : (
    <Button
      className="rounded-xl px-7 py-3 text-base"
      disabled={joining}
      onClick={async () => {
        setJoining(true);
        try {
          const result = await joinClubAction(clubId);
          if (result?.errorMessage) toast.error(result.errorMessage);
          else toast.success("You joined the club!");
        } catch { toast.error("Failed to join club"); }
        finally { setJoining(false); }
      }}
    >
      {joining ? "Joining..." : "Join"}
    </Button>
  )
)}
```

`Link` is already imported at the top of the file. No new imports needed. The `joining` state and `joinClubAction` import can stay — they're still used by the Join path.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/club/[clubid]/_components/club-dashboard-client.tsx
git commit -m "feat: apply page bypass + route Apply button to /apply"
```

---

## Task 4: Create the submit server action

**Files:**
- Create: `src/app/club/[clubid]/apply/actions.ts`

- [ ] **Step 1: Create the file**

Create `src/app/club/[clubid]/apply/actions.ts` with this content:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SubmitAnswerInput = {
  questionId: string;
  answerText: string;
};

export async function submitApplicationAction(
  applicationId: string,
  clubId: string,
  answers: SubmitAnswerInput[]
): Promise<{ errorMessage?: string } | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { errorMessage: "You must be logged in to apply." };
    }

    // Get the student's profile id (profiles.id = auth.uid())
    const studentId = user.id;

    // Guard: already submitted?
    const { data: existing } = await supabase
      .from("application_submissions")
      .select("id")
      .eq("application_id", applicationId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing) {
      return { errorMessage: "You have already submitted an application for this club." };
    }

    // Insert submission
    const { data: submission, error: submissionError } = await supabase
      .from("application_submissions")
      .insert({
        application_id: applicationId,
        student_id: studentId,
        status: "pending",
      })
      .select("id")
      .single();

    if (submissionError || !submission) {
      throw submissionError ?? new Error("Failed to create submission");
    }

    // Insert answers (skip blanks for optional questions)
    const answerRows = answers
      .filter((a) => a.answerText.trim() !== "")
      .map((a) => ({
        submission_id: submission.id,
        question_id: a.questionId,
        answer_text: a.answerText,
      }));

    if (answerRows.length > 0) {
      const { error: answersError } = await supabase
        .from("application_answers")
        .insert(answerRows);
      if (answersError) throw answersError;
    }

    revalidatePath(`/club/${clubId}`);
    return null;
  } catch (error) {
    console.error("Error submitting application:", error);
    return { errorMessage: (error as Error).message };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/club/[clubid]/apply/actions.ts
git commit -m "feat: add submitApplicationAction server action"
```

---

## Task 5: Create the application form client component

**Files:**
- Create: `src/app/club/[clubid]/apply/_components/application-form.tsx`

This is the full-screen form. It receives pre-fetched data as props and handles user interaction and submission.

- [ ] **Step 1: Create the component file**

Create `src/app/club/[clubid]/apply/_components/application-form.tsx`:

```tsx
"use client";

import * as React from "react";
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
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
              {club.name?.slice(0, 2).toUpperCase() ?? "CL"}
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
                value={fullName}
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Major</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-900 text-[15px] bg-slate-50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={profile.major ?? ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Graduation year</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-900 text-[15px] bg-slate-50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={profile.academic_year ?? ""}
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
                  <div className="flex flex-col gap-2.5 mt-1">
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
                <Link href="/user/profile" className="text-primary font-semibold hover:underline">
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
            <Link href={`/club/${club.id}`}>
              <Button variant="outline" className="rounded-xl">Cancel</Button>
            </Link>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/club/[clubid]/apply/_components/application-form.tsx
git commit -m "feat: add ApplicationForm client component"
```

---

## Task 6: Create the apply page server component

**Files:**
- Create: `src/app/club/[clubid]/apply/page.tsx`

This server component handles all data fetching and guards (no active application → redirect, already submitted → show message), then renders the client form.

- [ ] **Step 1: Create the page**

Create `src/app/club/[clubid]/apply/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/club/[clubid]/apply/page.tsx
git commit -m "feat: add /apply server page with auth guards and data fetching"
```

---

## Task 7: End-to-end smoke test

**No new files.** Manual verification steps.

- [ ] **Step 1: Confirm a club has `uses_applications = true` in the database**

In the Supabase dashboard, check the `clubs` table. At least one club should have `uses_applications = true` and a corresponding active row in `club_applications`. If not, run the seed section of the Task 1 SQL again.

- [ ] **Step 2: Visit the club page and confirm the Apply button is a link**

Navigate to `/club/[that-club-id]` as a non-member. The button should say "Apply" and clicking it should navigate to `/club/[clubid]/apply` (not fire an action).

- [ ] **Step 3: Fill out the form and submit**

On the apply page, verify:
- "About you" section shows your name, major, and year pulled from your profile.
- All questions from the DB render correctly (text inputs, textareas, radio groups).
- Documents section shows either "Resume attached" or the "no resume" prompt.
- Clicking Submit with a required field empty shows validation errors.
- Filling everything out and submitting shows a success toast and redirects to the club page.

- [ ] **Step 4: Confirm data in Supabase**

In the Supabase dashboard, verify rows exist in `application_submissions` (status: pending) and `application_answers` for your test submission.

- [ ] **Step 5: Revisit the apply page**

Navigate back to `/club/[clubid]/apply`. Should show the "Application submitted" screen, not the form.

- [ ] **Step 6: Final commit (if any cleanup)**

```bash
git add -A
git commit -m "chore: apply page smoke test cleanup"
```
