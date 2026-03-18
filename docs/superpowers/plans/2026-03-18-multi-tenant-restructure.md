# Multi-Tenant Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Clublinked from a flat single-tenant app to a slug-based multi-tenant architecture where every university gets its own namespace.

**Architecture:** Add `slug` and `email_domain` columns to the `universities` table. Create a `[slug]` dynamic route group that resolves the university and provides it via React context. Move all existing routes (auth, clubs, profiles) under `[slug]`. Convert the landing page to a marketing page with institution onboarding.

**Tech Stack:** Next.js 15 (App Router), React 19, Supabase (PostgreSQL), TypeScript, Tailwind CSS 4, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-18-multi-tenant-architecture-spec.md`

---

## File Map

### New files to create

| File | Purpose |
|------|---------|
| `src/lib/context/university-context.tsx` | React context provider for university data |
| `src/lib/actions/auth.ts` | Auth server actions: login, signup, logout |
| `src/lib/actions/profile.ts` | Profile server actions: bio, interests, skills |
| `src/lib/actions/setup.ts` | Institution setup server action |
| `src/app/[slug]/layout.tsx` | Resolves university by slug, wraps in context |
| `src/app/[slug]/page.tsx` | University hub (join club / search) |
| `src/app/[slug]/signup/page.tsx` | University-scoped signup |
| `src/app/[slug]/signup/_components/infobox.tsx` | Signup form (adapted) |
| `src/app/[slug]/signup/_components/combobox.tsx` | Year selector (copied) |
| `src/app/[slug]/login/page.tsx` | University-scoped login |
| `src/app/[slug]/login/_components/infobox.tsx` | Login form (adapted) |
| `src/app/[slug]/clubs/page.tsx` | Club discovery (queries DB) |
| `src/app/[slug]/clubs/_components/combobox.tsx` | Category filter (copied) |
| `src/app/[slug]/club/create/page.tsx` | Club creation page |
| `src/app/[slug]/club/create/_components/infobox.tsx` | Club creation form (adapted) |
| `src/app/[slug]/club/create/_components/combobox.tsx` | Club type selector (copied) |
| `src/app/[slug]/club/[clubid]/layout.tsx` | Club dashboard layout |
| `src/app/[slug]/club/[clubid]/page.tsx` | Redirects to overview |
| `src/app/[slug]/club/[clubid]/_components/club-dashboard-client.tsx` | Dashboard shell (adapted) |
| `src/app/[slug]/club/[clubid]/overview/page.tsx` | Club overview tab |
| `src/app/[slug]/club/[clubid]/members/page.tsx` | Members placeholder |
| `src/app/[slug]/club/[clubid]/events/page.tsx` | Events placeholder |
| `src/app/[slug]/club/[clubid]/projects/page.tsx` | Projects placeholder |
| `src/app/[slug]/club/[clubid]/announcements/page.tsx` | Announcements placeholder |
| `src/app/[slug]/club/[clubid]/history/page.tsx` | History placeholder |
| `src/app/[slug]/profile/[profileid]/page.tsx` | User profile |
| `src/app/[slug]/profile/[profileid]/_components/profile-client.tsx` | Profile client component |
| `src/app/setup/page.tsx` | Institution onboarding |

### Files to modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Replace with marketing landing page |
| `src/app/layout.tsx` | Conditionally show header/footer |
| `src/components/header/header.tsx` | Make university-aware |
| `src/middleware.ts` | Add slug resolution for auth redirects |
| `src/components/ui/user-avatar-menu.tsx` | Update links to use slug |

### Files to delete (Task 10)

All files under `src/app/user/` and `src/app/club/` — replaced by `[slug]` routes.

---

## Task 1: Write Project Spec Document

**Files:**
- Create: `docs/PROJECT_SPEC.md`

This is the "source of truth" document the user requested. It's a cleaned-up version of the architecture spec written in plain language.

- [ ] **Step 1: Write the spec document**

Create `docs/PROJECT_SPEC.md` with the following sections:
1. What is Clublinked (1 paragraph)
2. How it works — URL structure, who signs up where
3. User types — institution admin, club officer, student
4. Database tables — brief description of each
5. Tech stack
6. Phase roadmap — MVP, Stickiness, Institutional
7. Competitive position

Reference the detailed spec at `docs/superpowers/specs/2026-03-18-multi-tenant-architecture-spec.md` for architecture details. Keep PROJECT_SPEC.md concise and readable — max 100 lines.

- [ ] **Step 2: Verify**

Read the file and confirm it's clear and complete.

- [ ] **Step 3: Commit**

```bash
git add docs/
git commit -m "docs: add project spec and architecture documentation"
```

---

## Task 2: Database Migration

**Files:**
- Migration via Supabase MCP

Add `slug` and `email_domain` columns to the `universities` table.

- [ ] **Step 0: Verify profile table has university_id column**

Use Supabase MCP `execute_sql`:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profile' AND column_name = 'university_id';
```

If the column does not exist, add it as part of this migration. If it does, proceed.

- [ ] **Step 1: Apply migration**

Use the Supabase MCP `apply_migration` tool with this SQL:

```sql
-- Backfill existing rows with a temporary slug so NOT NULL constraint can be added
UPDATE universities SET slug = 'university-' || LEFT(id::text, 8) WHERE slug IS NULL;

-- Add multi-tenant fields to universities
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email_domain TEXT;

-- Remove the default after adding the column
ALTER TABLE universities ALTER COLUMN slug DROP DEFAULT;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug);
```

**Note:** The `NOT NULL` constraint is critical — the entire routing system depends on every university having a slug. Existing rows get a temporary slug derived from their ID.

- [ ] **Step 2: Seed a test university**

Use the Supabase MCP `execute_sql` tool:

```sql
-- Insert or update a test university
INSERT INTO universities (name, slug, email_domain)
VALUES ('Test University', 'test-university', 'test.edu')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, email_domain = EXCLUDED.email_domain;
```

- [ ] **Step 3: Verify the migration**

Use Supabase MCP `execute_sql`:

```sql
SELECT id, name, slug, email_domain FROM universities;
```

Confirm the test university exists with slug and email_domain. Confirm NO rows have NULL slugs.

- [ ] **Step 4: Commit (if migration file generated)**

```bash
git add supabase/
git commit -m "feat: add slug and email_domain to universities table"
```

---

## Task 3: University Context Provider + [slug] Layout

**Files:**
- Create: `src/lib/context/university-context.tsx`
- Create: `src/app/[slug]/layout.tsx`

- [ ] **Step 1: Create the University context**

Create `src/lib/context/university-context.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";

export type University = {
  id: string;
  name: string;
  slug: string;
  email_domain: string | null;
};

const UniversityContext = createContext<University | null>(null);

export function UniversityProvider({
  university,
  children,
}: {
  university: University;
  children: React.ReactNode;
}) {
  return (
    <UniversityContext.Provider value={university}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const ctx = useContext(UniversityContext);
  if (!ctx) throw new Error("useUniversity must be used within [slug] layout");
  return ctx;
}
```

- [ ] **Step 2: Create the [slug] layout**

Create `src/app/[slug]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UniversityProvider } from "@/lib/context/university-context";

export default async function UniversityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: university, error } = await supabase
    .from("universities")
    .select("id, name, slug, email_domain")
    .eq("slug", slug)
    .single();

  if (error || !university) {
    notFound();
  }

  return (
    <UniversityProvider university={university}>
      {children}
    </UniversityProvider>
  );
}
```

- [ ] **Step 3: Create a placeholder [slug] hub page**

Create `src/app/[slug]/page.tsx`:

```tsx
"use client";

import { useUniversity } from "@/lib/context/university-context";

export default function UniversityHub() {
  const university = useUniversity();

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-[#0E4AE6]">
          {university.name}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          University hub — clubs and community
        </p>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run `bun run build`. The new `[slug]` routes should compile. Visit `/test-university` in dev to confirm the layout resolves the test university.

- [ ] **Step 5: Commit**

```bash
git add src/lib/context/ src/app/\[slug\]/
git commit -m "feat: add university context provider and [slug] layout"
```

---

## Task 4: Move Auth Pages Under [slug]

**Files:**
- Create: `src/lib/actions/auth.ts`
- Create: `src/app/[slug]/signup/page.tsx`
- Create: `src/app/[slug]/signup/_components/infobox.tsx`
- Create: `src/app/[slug]/signup/_components/combobox.tsx`
- Create: `src/app/[slug]/login/page.tsx`
- Create: `src/app/[slug]/login/_components/infobox.tsx`

- [ ] **Step 1: Move server actions to shared location**

Create two action files:

**`src/lib/actions/auth.ts`** — Copy `LoginAction`, `SignUpAction`, and `LogOutAction` from `src/app/user/actions/user.ts`. Modify `SignUpAction` to accept an optional `universityId` parameter and store it on the profile:

```ts
export const SignUpAction = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  year?: string,
  major?: string,
  universityId?: string,
  emailDomain?: string
): Promise<{ errorMessage?: string } | null> => {
  // ... existing logic ...
  // In the profile upsert, add:
  // university_id: universityId ?? null,
};
```

**`src/lib/actions/profile.ts`** — Copy `UpdateBioAction`, `UpdateInterestsAction`, and `UpdateSkillsAction` from `src/app/user/actions/user.ts`. No changes needed to these functions.

- [ ] **Step 2: Create signup page**

Create `src/app/[slug]/signup/page.tsx`. Adapt from `src/app/user/signup/page.tsx`:
- Use `useUniversity()` to get university context
- Pass `university.id` to `SignUpAction`
- Update redirect from `/club/` to `/${university.slug}/clubs`
- Update "already logged in" redirect to `/${university.slug}`

- [ ] **Step 3: Create signup infobox and combobox**

Copy `src/app/user/signup/infobox.tsx` to `src/app/[slug]/signup/_components/infobox.tsx`. Update import path for `SignUpAction` to `@/lib/actions/auth`.

Copy `src/app/user/signup/combobox.tsx` to `src/app/[slug]/signup/_components/combobox.tsx` (no changes needed).

- [ ] **Step 4: Create login page**

Create `src/app/[slug]/login/page.tsx`. Adapt from `src/app/user/login/page.tsx`:
- Use `useUniversity()` to get university context
- Update redirect from `/club/` to `/${university.slug}/clubs`
- Import `LoginAction` from `@/lib/actions/auth`

- [ ] **Step 5: Create login infobox**

Copy `src/app/user/login/infobox.tsx` to `src/app/[slug]/login/_components/infobox.tsx`. Update import path for actions to `@/lib/actions/auth`.

- [ ] **Step 6: Verify**

Run `bun run build`. Visit `/test-university/signup` and `/test-university/login` in dev to confirm forms render.

- [ ] **Step 7: Commit**

```bash
git add src/lib/actions/ src/app/\[slug\]/signup/ src/app/\[slug\]/login/
git commit -m "feat: add university-scoped auth pages under [slug]"
```

---

## Task 5: Move Club Pages Under [slug]

**Files:**
- Create: `src/app/[slug]/clubs/page.tsx`
- Create: `src/app/[slug]/clubs/_components/combobox.tsx`
- Create: `src/app/[slug]/club/create/page.tsx`
- Create: `src/app/[slug]/club/create/_components/infobox.tsx`
- Create: `src/app/[slug]/club/create/_components/combobox.tsx`
- Create: `src/app/[slug]/club/[clubid]/layout.tsx`
- Create: `src/app/[slug]/club/[clubid]/page.tsx`
- Create: `src/app/[slug]/club/[clubid]/_components/club-dashboard-client.tsx`
- Create: `src/app/[slug]/club/[clubid]/overview/page.tsx`
- Create: `src/app/[slug]/club/[clubid]/members/page.tsx`
- Create: `src/app/[slug]/club/[clubid]/events/page.tsx`
- Create: `src/app/[slug]/club/[clubid]/projects/page.tsx`
- Create: `src/app/[slug]/club/[clubid]/announcements/page.tsx`
- Create: `src/app/[slug]/club/[clubid]/history/page.tsx`

- [ ] **Step 1: Create club discovery page**

Create `src/app/[slug]/clubs/page.tsx`. Adapt from `src/app/club/clubsearch/page.tsx`:
- Use `useUniversity()` to get university context
- **IMPORTANT:** Replace hardcoded club data with a Supabase query: `supabase.from("clubs").select("id, name, about, club_type").eq("university_id", university.id)`
- Update all internal links to use `/${university.slug}/club/${club.id}` pattern
- Copy the combobox component to `_components/combobox.tsx`

- [ ] **Step 2: Create club creation page**

Create `src/app/[slug]/club/create/page.tsx`. Adapt from `src/app/club/clubsignup/page.tsx`:
- Use `useUniversity()` to get university context

Create `src/app/[slug]/club/create/_components/infobox.tsx`. Adapt from `src/app/club/clubsignup/infobox.tsx`:
- **CRITICAL:** The infobox does the Supabase insert directly (client component). It needs the university ID. Either:
  - (a) Accept `universityId` and `slug` as props from the page component (which calls `useUniversity()`), OR
  - (b) Call `useUniversity()` directly inside the infobox (simpler — recommended)
- When inserting into `clubs`, include `university_id: university.id`
- Update redirect from `/club/dashboard/${club.id}` to `/${slug}/club/${club.id}`

Copy combobox component to `_components/combobox.tsx`.

- [ ] **Step 3: Create club dashboard layout**

Create `src/app/[slug]/club/[clubid]/layout.tsx`. Adapt from `src/app/club/dashboard/[clubid]/layout.tsx`:
- Params now include both `slug` and `clubid`
- Pass `slug` to ClubDashboardClient for link generation

- [ ] **Step 4: Create club dashboard client**

Create `src/app/[slug]/club/[clubid]/_components/club-dashboard-client.tsx`. Adapt from `src/app/club/dashboard/[clubid]/ClubDashboardClient.tsx`:
- Accept `slug` prop
- Update `basePath` from `/club/dashboard/${clubId}` to `/${slug}/club/${clubId}`

- [ ] **Step 5: Create dashboard tab pages**

Create redirect page `src/app/[slug]/club/[clubid]/page.tsx` — redirect to `overview`.

Copy and adapt all tab pages (overview, members, events, projects, announcements, history) from `src/app/club/dashboard/[clubid]/`. The overview page needs its internal links updated. The placeholder pages can be copied as-is.

- [ ] **Step 6: Create university hub page**

Update `src/app/[slug]/page.tsx` (created in Task 3) to become the actual university hub. Adapt from `src/app/club/page.tsx`:
- Show invite code join form
- **CRITICAL:** Update the join-success redirect from `router.push(\`/club/dashboard/${club.id}\`)` to `router.push(\`/${university.slug}/club/${club.id}\`)`
- Link to `/${university.slug}/clubs` for manual search
- Link to `/${university.slug}/club/create` for creating a club
- Use `useUniversity()` for context

- [ ] **Step 7: Verify**

Run `bun run build`. Navigate to `/test-university/clubs`, `/test-university/club/create` in dev. Confirm club creation flow works end-to-end (create club -> redirect to dashboard).

- [ ] **Step 8: Commit**

```bash
git add src/app/\[slug\]/clubs/ src/app/\[slug\]/club/ src/app/\[slug\]/page.tsx
git commit -m "feat: add university-scoped club pages under [slug]"
```

---

## Task 6: Move Profile Under [slug]

**Files:**
- Create: `src/app/[slug]/profile/[profileid]/page.tsx`
- Create: `src/app/[slug]/profile/[profileid]/_components/profile-client.tsx`

- [ ] **Step 1: Create profile page**

Create `src/app/[slug]/profile/[profileid]/page.tsx`. Adapt from `src/app/user/profile/[profileid]/page.tsx`:
- Params now include `slug` and `profileid`
- Update any internal links (club dashboard links) to use slug

- [ ] **Step 2: Create profile client**

Copy `src/app/user/profile/[profileid]/ProfileClient.tsx` to `src/app/[slug]/profile/[profileid]/_components/profile-client.tsx`.
- Update import paths: `UpdateBioAction`, `UpdateInterestsAction`, `UpdateSkillsAction` now import from `@/lib/actions/profile` (NOT auth — these are profile actions)
- Update any internal links to use slug pattern (use `useUniversity()` or `usePathname()` to get the slug)

- [ ] **Step 3: Verify**

Run `bun run build`. The profile page should compile under the new route.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[slug\]/profile/
git commit -m "feat: add university-scoped profile page under [slug]"
```

---

## Task 7: Marketing Landing Page + Institution Setup

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/setup/page.tsx`

- [ ] **Step 1: Replace landing page**

Rewrite `src/app/page.tsx` as a marketing page:
- Hero: "The operating system for student organizations"
- Two CTAs:
  - "Get Started" (for institutions) -> `/setup`
  - "Find Your University" (for students) -> search input that redirects to `/[slug]`
- Brief feature highlights (3-4 bullet points)
- Keep the existing ClubLinked branding (blue #0E4AE6, Gabarito font)

The "Find Your University" feature should be a search input that queries the `universities` table by name and redirects to `/${slug}`. For MVP, this can be a simple text input that matches the slug directly.

- [ ] **Step 2: Create institution setup server action**

Create `src/lib/actions/setup.ts` with a `SetupInstitutionAction` server action that handles the multi-step creation atomically:

```ts
"use server";
export const SetupInstitutionAction = async (
  universityName: string,
  slug: string,
  emailDomain: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ errorMessage?: string; slug?: string } | null> => {
  // 1. Validate slug is not reserved
  const RESERVED_SLUGS = ["setup", "api", "admin", "_next", "favicon.ico"];
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return { errorMessage: "This URL is reserved. Please choose a different one." };
  }
  // 2. Check slug uniqueness
  // 3. Create Supabase auth account
  // 4. Insert university record
  // 5. Insert profile record with university_id
  // 6. Return { slug } on success
  // If any step after auth creation fails, log the error (auth cleanup is a future concern)
};
```

**IMPORTANT:** This must be a server action, not a client-side multi-step flow. If the university insert succeeds but the profile insert fails, you'd have an orphaned record — the server action can handle this more reliably.

- [ ] **Step 3: Create institution setup page**

Create `src/app/setup/page.tsx`:
- Client component form with fields:
  - University name (required)
  - URL slug (auto-generated from name via `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`, editable)
  - Email domain (e.g., "uchicago.edu")
  - Admin first name, last name, email, password
- On submit: call `SetupInstitutionAction` server action
- On success: redirect to `/${slug}`

**IMPORTANT:** Validate that the slug is not a reserved path. Reserved slugs: `setup`, `api`, `admin`, `_next`, `favicon.ico`. The server action should reject these.

- [ ] **Step 3: Verify**

Run `bun run build`. Visit `/` to see marketing page. Visit `/setup` to see the setup form. Test the full flow: create a university -> redirect to university hub.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/setup/
git commit -m "feat: add marketing landing page and institution setup flow"
```

---

## Task 8: Update Header to be University-Aware

**Files:**
- Modify: `src/components/header/header.tsx`
- Modify: `src/components/ui/user-avatar-menu.tsx` (if it contains hard-coded links)

- [ ] **Step 1: Update header**

The header needs to work in two contexts:
1. **Outside [slug]** (marketing pages, setup): Show "ClubLinked" branding, link sign up/login to `/setup`
2. **Inside [slug]** (university pages): Show university name, link sign up/login to `/${slug}/signup` and `/${slug}/login`

Since the header is a server component and can't use `useUniversity()` (that's client-only context), use the URL path to detect the slug:

```tsx
import { headers } from "next/headers";

export default async function Header() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  // Extract slug from pathname if it matches /[slug]/...
  // Query university if slug found
  // Adjust nav links accordingly
}
```

Alternative (simpler): Read the slug from the URL using `headers()` or pass it via middleware's `x-pathname` header. The middleware already runs on all routes.

Update nav links:
- Sign up/Login buttons -> `/${slug}/signup` and `/${slug}/login` (when inside slug)
- Sign up/Login buttons -> `/setup` (when outside slug)
- "ClubLinked" logo -> `/${slug}` (when inside slug) or `/` (when outside)
- Features/Pricing links -> keep as-is or remove

- [ ] **Step 2: Update middleware to pass pathname**

In `src/middleware.ts`, add the pathname as a header so server components can read it. **CRITICAL: ALL response paths in the middleware must include this header** — the magic link handler, the generic code handler, AND the fallback. Update every `NextResponse.next()` call:

```ts
// Helper to create response with pathname header
function createResponse(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        'x-pathname': request.nextUrl.pathname,
      }),
    },
  });
}
```

Replace all three `NextResponse.next()` calls in the middleware with this helper.

- [ ] **Step 3: Update user avatar menu**

Check `src/components/ui/user-avatar-menu.tsx`:
- **CRITICAL:** It imports `LogOutAction` from `@/app/user/actions/user` — this WILL break when old routes are deleted in Task 10. Update to import from `@/lib/actions/auth`.
- It contains a profile link (`/user/profile/${userId}`) — update to use slug. Since this is a client component, use `usePathname()` from `next/navigation` to extract the slug from the current URL:

```tsx
const pathname = usePathname();
const slug = pathname?.split("/")[1] || "";
// Then use: `/${slug}/profile/${userId}`
```

- Any other hard-coded links to `/club/...` need the same treatment.

- [ ] **Step 4: Verify**

Run `bun run build`. Visit `/` (should show marketing header), then `/test-university/clubs` (should show university-aware header with correct links).

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/middleware.ts
git commit -m "feat: make header university-aware with slug-based navigation"
```

---

## Task 9: Email Domain Validation on Signup

**Files:**
- Modify: `src/lib/actions/auth.ts`

- [ ] **Step 1: Add email domain validation to SignUpAction**

In `src/lib/actions/auth.ts`, modify `SignUpAction` to accept `emailDomain` parameter and validate:

```ts
export const SignUpAction = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  year?: string,
  major?: string,
  universityId?: string,
  emailDomain?: string
): Promise<{ errorMessage?: string } | null> => {
  // Validate email domain if provided
  if (emailDomain) {
    const userDomain = email.split("@")[1]?.toLowerCase();
    if (userDomain !== emailDomain.toLowerCase()) {
      return {
        errorMessage: `Please use your university email (@${emailDomain}) to sign up.`,
      };
    }
  }
  // ... rest of existing logic
};
```

- [ ] **Step 2: Pass email domain from signup page**

Update `src/app/[slug]/signup/page.tsx` to pass `university.email_domain` to the `SignUpAction` call.

- [ ] **Step 3: Verify**

Run `bun run build`. In dev, try signing up under `/test-university/signup` with a non-`@test.edu` email. Confirm it shows the domain validation error.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/auth.ts src/app/\[slug\]/signup/
git commit -m "feat: add email domain validation on university-scoped signup"
```

---

## Task 10: Delete Old Routes + Cleanup

**Files:**
- Delete: `src/app/user/` (entire directory)
- Delete: `src/app/club/` (entire directory)

- [ ] **Step 1: Delete old route directories**

```bash
rm -rf src/app/user/ src/app/club/
```

- [ ] **Step 2: Check for broken imports**

Run `bun run build` and fix any import errors. Common issues:
- Components importing from old action paths -> update to `@/lib/actions/auth`
- Any remaining hard-coded links to `/user/...` or `/club/...` in shared components

- [ ] **Step 3: Fix all build errors**

Address each build error one at a time. Most will be import path issues or link references.

- [ ] **Step 4: Verify clean build**

```bash
bun run build
```

Must complete with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old flat routes, all pages now under [slug]"
```

---

## Task 11: End-to-End Verification

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

```bash
bun dev
```

- [ ] **Step 2: Test marketing landing page**

Visit `/`. Confirm:
- Marketing content displays
- "Get Started" links to `/setup`
- "Find Your University" search works

- [ ] **Step 3: Test institution setup**

Visit `/setup`. Create a new university:
- Name: "Demo University"
- Slug: "demo"
- Email domain: "demo.edu"
- Admin account details

Confirm redirect to `/demo`.

- [ ] **Step 4: Test auth flow**

Visit `/demo/signup`. Sign up with a `@demo.edu` email. Confirm:
- Form renders correctly
- Email domain validation works (try wrong domain first)
- Successful signup redirects to `/demo/clubs`

Visit `/demo/login`. Log in. Confirm redirect.

- [ ] **Step 5: Test club flow**

Visit `/demo/club/create`. Create a club. Confirm:
- Club is created with `university_id` set
- Redirect to `/demo/club/[clubid]`
- Dashboard renders with tabs
- Overview tab shows club details

Visit `/demo/clubs`. Confirm the created club appears in the list.

- [ ] **Step 6: Test profile**

Visit `/demo/profile/[userid]`. Confirm profile renders with university context.

- [ ] **Step 7: Take Playwright screenshots**

Use the Playwright agent to screenshot each key page:
- `/` (marketing)
- `/setup`
- `/demo/signup`
- `/demo/login`
- `/demo` (university hub)
- `/demo/clubs`
- `/demo/club/create`
- `/demo/club/[clubid]` (dashboard overview)
- `/demo/profile/[userid]`

- [ ] **Step 8: Fix any issues found**

Address any visual or functional issues discovered during testing.

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "fix: resolve issues found during end-to-end verification"
```

---

## Post-Plan: Next Steps

After this restructure is complete, the next plan should cover **MVP features**:
1. Events (creation, RSVP, attendance)
2. Member management (list, applications, approvals)
3. Messaging
4. RLS policies for all tables
