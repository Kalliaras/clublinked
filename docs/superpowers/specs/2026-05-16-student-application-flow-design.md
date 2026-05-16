# Student Application Flow — Design Spec
**Date:** 2026-05-16  
**Status:** Approved

---

## Overview

Enable students to apply to clubs that have `uses_applications = true` by clicking the Apply button on the club dashboard. The button routes to a dedicated full-screen application form at `/club/[clubid]/apply`. Questions are loaded dynamically from the database. Submissions are stored per-student. The admin management UI is out of scope for this sprint.

---

## Database Changes

### New tables

**`club_applications`**  
Stores one application form per club. A club can have at most one active form at a time.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `club_id` | uuid FK → clubs.id | |
| `title` | text | e.g. "Analyst Program, Fall 2026" |
| `description` | text | Shown at the top of the form |
| `is_active` | boolean | Only active applications are accessible to students |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**`application_questions`**  
Stores each question in a form.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `application_id` | uuid FK → club_applications.id | |
| `question_text` | text | Prompt shown to the student |
| `question_type` | text | `text`, `textarea`, `multiple_choice` |
| `is_required` | boolean | |
| `order` | integer | Ascending display order |
| `options` | jsonb | Nullable; array of strings for multiple_choice questions |

**`application_submissions`**  
Stores one row per student per application.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `application_id` | uuid FK → club_applications.id | |
| `student_id` | uuid FK → profiles.id | |
| `submitted_at` | timestamptz | |
| `status` | text | `pending`, `accepted`, `rejected` |

**`application_answers`**  
Stores one row per question per submission.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `submission_id` | uuid FK → application_submissions.id | |
| `question_id` | uuid FK → application_questions.id | |
| `answer_text` | text | |

### Profiles table change

Add `resume` (text, nullable) to `profiles`. Stores a public URL pointing to the student's uploaded resume PDF in Supabase Storage. No storage bucket or upload UI is built in this sprint — the column is added now so the form can display and auto-attach it when present.

### Seed data

After creating the tables, insert one test `club_application` (is_active = true) for each club that currently has `uses_applications = true`, with 3–4 sample questions covering `text`, `textarea`, and `multiple_choice` types. This allows the student form to be tested end-to-end without an admin UI.

### RLS policies

- **`club_applications`**: Anyone authenticated can read rows where `is_active = true`.
- **`application_questions`**: Anyone authenticated can read questions belonging to active applications.
- **`application_submissions`**: Students can insert their own row (student_id = auth.uid()). Students can read their own rows.
- **`application_answers`**: Students can insert answers for their own submissions. Students can read their own answers.

---

## Apply Button Change

**File:** `src/app/club/[clubid]/_components/club-dashboard-client.tsx`

Currently the Apply button calls `joinClubAction`. Change it so that when `uses_applications = true`, the button renders as a `<Link href="/club/[clubid]/apply">` instead. The Join flow (for clubs without applications) is unchanged.

---

## Application Form Page

**Route:** `src/app/club/[clubid]/apply/page.tsx`  
**Layout:** Full-screen — no sidebar. Matches the mockup's top bar + scrolling body + sticky footer pattern.

### Server-side logic (in the page server component)

1. Load the active `club_application` for this club. If none exists, redirect to `/club/[clubid]`.
2. Load the authenticated user's profile (name, major, academic_year, resume).
3. Check `application_submissions` for an existing row where `student_id = auth.uid()` and `application_id` matches. If found, render a "You've already applied" state instead of the form.
4. Load all `application_questions` for this application, ordered by `order`.
5. Pass everything as props to the client form component.

### Client form component

`src/app/club/[clubid]/apply/_components/application-form.tsx`

**Layout structure (matching the mockup):**
- **Top bar** (sticky): Back button → `/club/[clubid]`, club logo + name, form title ("Draft saved" indicator is not implemented in this sprint).
- **Scrolling body**: Form sections in order:
  1. **About you** — pre-filled inputs for full name, major, graduation year. These pull from the user's profile but are editable before submission.
  2. **Application questions** — dynamically rendered from the `application_questions` array:
     - `text` → `<input>`
     - `textarea` → `<textarea>` with character counter
     - `multiple_choice` → radio-button list (styled per mockup)
  3. **Documents** — shows the user's attached resume from their profile (if `resume` URL exists) as a read-only attached file. If no resume exists, shows a note directing them to their profile to upload one. No file upload in the form itself this sprint.
- **Sticky footer**: Required fields count / completion hint on the left; "Submit Application" button on the right.

**Validation:** Required questions must be non-empty before submit. Show inline error messages under each empty required field on attempted submit. No step-gating since this is a single-page form.

**Submit action** (`src/app/club/[clubid]/apply/actions.ts`):
1. Verify auth and that the student hasn't already submitted.
2. Insert row into `application_submissions` (status: `pending`).
3. Insert one row into `application_answers` per answered question.
4. Return success or error.

**After submit:** Toast success message + `router.push("/club/[clubid]")`.

---

## File Structure

```
src/app/club/[clubid]/
├── apply/
│   ├── page.tsx                  # Server component — auth checks, data fetching
│   └── _components/
│       └── application-form.tsx  # Client component — form UI and submit logic
│       └── actions.ts            # Server action — submit submission + answers
```

---

## Out of Scope (This Sprint)

- Admin UI for creating/editing application forms or questions
- Viewing or managing submissions
- Resume upload in the application form (column added to DB, display only)
- Draft saving
- Email notifications on submission
