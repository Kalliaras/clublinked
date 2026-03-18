# Clublinked Project Spec

Complete source-of-truth documentation for the Clublinked platform.

---

## 1. Product Overview

Clublinked is **the operating system for student organizations**. It is a multi-tenant web platform where each university gets its own namespace (e.g., `clublinked.com/uchicago`). Club officers use it to manage their organizations -- members, events, announcements. Students use it to discover and join clubs.

**Multi-tenant model:** Every university is scoped via a URL slug. The `[slug]` dynamic route resolves to a university record and wraps all child pages in a `UniversityProvider` context. All data queries (clubs, profiles, roles) are filtered by `university_id`.

**Go-to-market:** Bottom-up. Any student with a `.edu` email can create a university namespace via `/setup` and start inviting clubs -- no institutional contract needed. Density builds organically on campus, then the institution buys in for admin dashboards and analytics.

---

## 2. User Flows

### Institution Admin Setup

1. Visits `/` (marketing landing page)
2. Clicks "Get Started" -> navigates to `/setup`
3. Fills institution form: university name, URL slug (auto-generated, editable), email domain (optional), admin account (first name, last name, email, password)
4. Submits -> `SetupInstitutionAction` validates slug (not reserved, not taken), creates Supabase auth account, inserts `universities` row, inserts `profile` row with `university_id`
5. On success, redirected to `/{slug}` (university hub)

### Student/Officer Signup

1. Visits `/{slug}/signup`
2. If already logged in, auto-redirected to `/{slug}`
3. Fills signup form: first name, last name, email, password, year (optional), major (optional)
4. Submits -> `SignUpAction` validates email domain against university's `email_domain` (if set), creates Supabase auth account, inserts `profile` row with `university_id`
5. Sees toast: "Please check your email to verify your account"
6. Redirected to `/{slug}`

### Login

1. Visits `/{slug}/login`
2. If already logged in, auto-redirected to `/{slug}`
3. Enters email and password
4. Submits -> `LoginAction` calls `supabase.auth.signInWithPassword`
5. On success, redirected to `/{slug}`

### Club Creation

1. Authenticated user visits `/{slug}/club/create`
2. Fills form: club name (required), description (optional), interests (tag picker from `interest_tags`), club type (dropdown)
3. Submits -> client-side Supabase insert into `clubs` with `university_id`, generates random `access_code`, inserts `user_roles` row with `is_owner: true` and title "President", links selected interest tags via `club_interests`
4. Redirected to `/{slug}/club/{clubid}`

### Club Discovery

1. Anyone visits `/{slug}/clubs`
2. Client-side query: `clubs` table filtered by `university_id`
3. Can filter by category (combobox) and search by name
4. Clicking a club card navigates to `/{slug}/club/{clubid}`

### Join Club via Invite Code

1. Authenticated user visits `/{slug}` (university hub)
2. Enters invite code in the form
3. Client-side lookup: `clubs` table filtered by `access_code`
4. If found and user is not already a member, inserts `user_roles` row (title: "Member", `is_owner: false`) and increments `clubs.members` count
5. Redirected to `/{slug}/club/{clubid}`

### Profile

1. User visits `/{slug}/profile/{profileid}`
2. Server component fetches profile, user roles (with club names), interests (via `user_interests` + `interest_tags`), skills (via `user_skills` + `skill_tags`)
3. If viewing own profile (`isOwner`), can edit bio, interests, and skills
4. Edits call `UpdateBioAction`, `UpdateInterestsAction`, `UpdateSkillsAction`

---

## 3. URL Structure

| Route | Component Type | Description |
|-------|---------------|-------------|
| `/` | Client | Marketing landing page with hero, university search, features, stats |
| `/setup` | Client | Institution onboarding form -- creates university + admin account |
| `/{slug}` | Client | University hub -- join club via invite code, links to search/create |
| `/{slug}/signup` | Client | University-scoped signup with email domain validation |
| `/{slug}/login` | Client | University-scoped login |
| `/{slug}/clubs` | Client | Club discovery -- search and filter clubs at this university |
| `/{slug}/club/create` | Client | Club creation form |
| `/{slug}/club/{clubid}` | Server | Redirects to `/{slug}/club/{clubid}/overview` |
| `/{slug}/club/{clubid}/overview` | Client | Club dashboard -- about, interests, featured |
| `/{slug}/club/{clubid}/members` | Server | Members tab (placeholder) |
| `/{slug}/club/{clubid}/events` | Server | Events tab (placeholder) |
| `/{slug}/club/{clubid}/projects` | Server | Projects tab (placeholder) |
| `/{slug}/club/{clubid}/announcements` | Server | Announcements tab (placeholder) |
| `/{slug}/club/{clubid}/history` | Server | History tab (placeholder) |
| `/{slug}/profile/{profileid}` | Server+Client | User profile with editable bio, interests, skills |

---

## 4. Database Schema

### `universities`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default `gen_random_uuid()` | University ID |
| `name` | TEXT | NOT NULL | University display name |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-safe identifier (e.g., "uchicago") |
| `email_domain` | TEXT | nullable | Allowed signup domain (e.g., "uchicago.edu") |
| `country` | TEXT | nullable | Country |
| `url` | TEXT | nullable | University website URL |
| `created_at` | TIMESTAMPTZ | default `now()` | Row creation time |

**Note:** The redundant `idx_universities_slug` index was dropped (the UNIQUE constraint on `slug` already provides an index).

### `profile`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK (matches Supabase auth user ID) | User ID |
| `email` | TEXT | NOT NULL | User email |
| `first_name` | TEXT | NOT NULL | First name |
| `last_name` | TEXT | NOT NULL | Last name |
| `university_id` | UUID | nullable, FK to `universities.id` | University this user belongs to |
| `major` | TEXT | nullable | Academic major |
| `year` | TEXT | nullable | Class year |
| `bio` | TEXT | nullable | User bio |
| `club_id` | TEXT | nullable | Legacy column |
| `created_at` | TIMESTAMPTZ | | Row creation time |

**Note:** `profile.email` has no default value (a previous broken `'NULL'::text` default was removed).

### `clubs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default `gen_random_uuid()` | Club ID |
| `name` | TEXT | NOT NULL | Club name |
| `about` | TEXT | nullable | Description |
| `club_type` | TEXT | nullable | Category (e.g., "Academic", "Social") |
| `access_code` | TEXT | | 6-char random invite code |
| `university_id` | UUID | nullable, FK to `universities.id` | University this club belongs to |
| `members` | INTEGER | default 0 | Member count (denormalized) |
| `created_at` | TIMESTAMPTZ | default `now()` | Row creation time |

### `user_roles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Role record ID |
| `user_id` | UUID | FK to `profile.id` | User |
| `club_id` | UUID | FK to `clubs.id` | Club |
| `title` | TEXT | | Role title (e.g., "President", "Member") |
| `is_owner` | BOOLEAN | NOT NULL, default `false` | Whether user is a club owner |

Index: `idx_user_roles_club_id` on `club_id`.

### `interest_tags`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Tag ID |
| `name` | TEXT | UNIQUE | Interest name |

### `skill_tags`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Tag ID |
| `name` | TEXT | UNIQUE | Skill name |

### `user_interests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | FK to `profile.id` | User |
| `interest_id` | UUID | FK to `interest_tags.id` | Interest tag |

Index: `idx_user_interests_interest_id` on `interest_id`.

### `user_skills`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | FK to `profile.id` | User |
| `skill_id` | UUID | FK to `skill_tags.id` | Skill tag |

Index: `idx_user_skills_skill_id` on `skill_id`.

### `club_interests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `club_id` | UUID | FK to `clubs.id` | Club |
| `interest_id` | UUID | FK to `interest_tags.id` | Interest tag |

### `club_skills`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `club_id` | UUID | FK to `clubs.id` | Club (previously misspelled as `clud_id`, now corrected) |
| `skill_id` | UUID | FK to `skill_tags.id` | Skill tag |

---

## 5. Architecture

### Rendering Model

- **Server Components** handle data fetching and layouts (e.g., `[slug]/layout.tsx`, `profile/[profileid]/page.tsx`, `club/[clubid]/layout.tsx`)
- **Client Components** handle forms, interactivity, and state (e.g., signup/login forms, club creation, dashboard shell)
- **No API routes** -- all mutations go through Next.js server actions or direct client-side Supabase SDK calls

### University Context System

The `[slug]/layout.tsx` is the multi-tenancy boundary:

1. Extracts `slug` from URL params
2. Queries `universities` table by slug
3. If not found, calls `notFound()`
4. Wraps children in `UniversityProvider` (React context)
5. Any client component inside `[slug]` can call `useUniversity()` to get `{ id, name, slug, email_domain }`

### Auth Model

- **Supabase Auth** with email/password (`signUp`, `signInWithPassword`)
- **Email domain validation** on signup: if the university has `email_domain` set, the signup action rejects emails that don't match
- **Magic link support**: middleware handles `?code=...&type=email` by exchanging the code for a session
- **RLS enabled** on all tables with 29 policies (see Security section below)
- **Session management**: cookie-based via `@supabase/ssr`

### Server Action Pattern

Actions in `src/lib/actions/` follow this structure:

```ts
"use server";
export const SomeAction = async (params) => {
  try {
    const supabase = await createClient();
    // 1. Validate input
    // 2. Perform database operation
    // 3. Return null on success
  } catch (error) {
    return { errorMessage: (error as Error).message };
  }
};
```

### Client Form Pattern

```ts
const [isSubmitting, setIsSubmitting] = useState(false);
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const result = await SomeAction(params);
    if (result?.errorMessage) { toast.error(result.errorMessage); return; }
    toast.success("Done!");
    router.push("/next-page");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Middleware

`src/middleware.ts` runs on all routes (`/:path*`). It does two things:

1. **Injects `x-pathname` header** into every request so server components (like the header) can read the current pathname
2. **Handles magic links**: if URL has `?code=` param, exchanges it for a Supabase session via `exchangeCodeForSession`

### Header Behavior

The header (`src/components/header/header.tsx`) is a server component that adapts based on context:

- **Outside `[slug]`** (landing, setup): logo links to `/`, shows Features/Pricing nav, sign up/login link to `/setup`
- **Inside `[slug]`**: logo links to `/{slug}`, hides marketing nav, sign up/login link to `/{slug}/signup` and `/{slug}/login`
- **Logged in**: shows `UserAvatarMenu` dropdown with profile link and logout
- Slug detection: reads `x-pathname` header, extracts first segment, verifies it's a real university via DB query

### Supabase Clients

Three client variants in `src/lib/supabase/`:

| File | Context | Usage |
|------|---------|-------|
| `server.ts` | Server components, server actions | Cookie-based authenticated client |
| `client.ts` | Browser/client components | Browser-side client |
| `proxy.ts` | Middleware | Lightweight client for middleware context |

### Security (Row Level Security)

RLS is enabled on all 10 tables with 29 policies. The general pattern:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `universities` | Public | Authenticated users | -- | -- |
| `profile` | Public | Own row only (`id = auth.uid()`) | Own row only | -- |
| `clubs` | Public | Authenticated users | Owner only | Owner only |
| `user_roles` | Public | Self-join or club owner | Club owner only | Self-remove or club owner |
| `interest_tags` / `skill_tags` | Public | Authenticated users | -- | -- |
| `user_interests` / `user_skills` | Public | Own rows only | -- | Own rows only |
| `club_interests` / `club_skills` | Public | Club owner only | -- | Club owner only |

"Owner" means the authenticated user has a row in `user_roles` with `is_owner = true` for that club.

---

## 6. File Structure

```
src/
├── app/
│   ├── _components/
│   │   └── university-search.tsx        # University search widget for landing page
│   ├── [slug]/
│   │   ├── layout.tsx                   # Resolves university by slug, provides context
│   │   ├── page.tsx                     # University hub (join via invite code)
│   │   ├── signup/
│   │   │   ├── page.tsx                 # University-scoped signup page
│   │   │   └── _components/
│   │   │       ├── infobox.tsx          # Signup form card
│   │   │       └── combobox.tsx         # Year selector
│   │   ├── login/
│   │   │   ├── page.tsx                 # University-scoped login page
│   │   │   └── _components/
│   │   │       └── infobox.tsx          # Login form card
│   │   ├── clubs/
│   │   │   ├── page.tsx                 # Club discovery with search/filter
│   │   │   └── _components/
│   │   │       └── combobox.tsx         # Category filter
│   │   ├── club/
│   │   │   ├── create/
│   │   │   │   ├── page.tsx             # Club creation page wrapper
│   │   │   │   └── _components/
│   │   │   │       ├── infobox.tsx      # Club creation form
│   │   │   │       └── combobox.tsx     # Club type selector
│   │   │   └── [clubid]/
│   │   │       ├── layout.tsx           # Fetches club data, wraps in dashboard shell
│   │   │       ├── page.tsx             # Redirects to overview
│   │   │       ├── _components/
│   │   │       │   └── club-dashboard-client.tsx  # Dashboard layout with tabs
│   │   │       ├── overview/page.tsx    # Club about, interests, featured
│   │   │       ├── members/page.tsx     # Placeholder
│   │   │       ├── events/page.tsx      # Placeholder
│   │   │       ├── projects/page.tsx    # Placeholder
│   │   │       ├── announcements/page.tsx # Placeholder
│   │   │       └── history/page.tsx     # Placeholder
│   │   └── profile/
│   │       └── [profileid]/
│   │           ├── page.tsx             # Server-side profile data fetching
│   │           └── _components/
│   │               └── profile-client.tsx # Client-side profile UI with edit
│   ├── setup/
│   │   └── page.tsx                     # Institution onboarding form
│   ├── layout.tsx                       # Root layout (header, footer, toaster)
│   ├── page.tsx                         # Marketing landing page
│   ├── globals.css                      # Global styles + Tailwind imports
│   └── favicon.ico
├── components/
│   ├── header/
│   │   └── header.tsx                   # University-aware header (server component)
│   ├── footer/
│   │   └── footer.tsx                   # Site footer
│   ├── logo.tsx                         # ClubLinked logo component
│   └── ui/                              # shadcn/ui + Magic UI components
│       ├── user-avatar-menu.tsx         # User dropdown (profile, logout)
│       ├── animated-shiny-text.tsx      # Magic UI animation
│       ├── blur-fade.tsx                # Magic UI animation
│       ├── border-beam.tsx              # Magic UI animation
│       ├── dot-pattern.tsx              # Magic UI background pattern
│       ├── marquee.tsx                  # Magic UI scrolling marquee
│       ├── number-ticker.tsx            # Magic UI animated counter
│       ├── particles.tsx                # Magic UI particle effect
│       ├── shimmer-button.tsx           # Magic UI button with shimmer
│       ├── word-rotate.tsx              # Magic UI rotating text
│       ├── field.tsx                    # Form field layout components
│       ├── button.tsx, card.tsx, input.tsx, label.tsx, badge.tsx, ...
│       └── (40+ shadcn/ui primitives)
├── lib/
│   ├── actions/
│   │   ├── auth.ts                      # LoginAction, SignUpAction, LogOutAction
│   │   ├── profile.ts                   # UpdateBioAction, UpdateInterestsAction, UpdateSkillsAction
│   │   └── setup.ts                     # SetupInstitutionAction
│   ├── context/
│   │   └── university-context.tsx       # UniversityProvider + useUniversity hook
│   ├── hooks/
│   │   └── use-mobile.ts               # Mobile viewport detection hook
│   ├── supabase/
│   │   ├── server.ts                    # Server-side Supabase client
│   │   ├── client.ts                    # Browser-side Supabase client
│   │   └── proxy.ts                     # Middleware Supabase client
│   └── utils/
│       └── tailwind.ts                  # cn() utility for class merging
├── fonts/
│   ├── OpenSauceSansVF.ttf
│   └── OpenSauceSansVF-Italic.ttf
└── middleware.ts                         # Pathname injection + magic link handling
```

---

## 7. Tech Stack

| Category | Technology | Details |
|----------|-----------|---------|
| Framework | Next.js 15 | App Router, Server Components, Turbopack dev |
| UI Library | React 19 | |
| Language | TypeScript | Build errors currently ignored in `next.config.ts` |
| Database | Supabase (PostgreSQL) | No ORM, direct SDK queries |
| Auth | Supabase Auth | Email/password, magic links, cookie-based sessions via `@supabase/ssr` |
| Styling | Tailwind CSS 4 | Utility-first, CSS variables |
| Components | shadcn/ui (new-york style) | Radix UI primitives, lucide-react icons |
| Animations | Magic UI | Shimmer buttons, blur fade, particles, marquee, etc. |
| Forms | React Hook Form + Zod | Used in some flows; others use plain `useState` |
| Toasts | Sonner | `toast.success()`, `toast.error()` |
| Package Manager | bun | |
| Hosting | Vercel | |
| Path Alias | `@/*` -> `src/*` | |

---

## 8. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (public, embedded in client bundle) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public API key (public, embedded in client bundle) |

Both are `NEXT_PUBLIC_` prefixed because they are needed on both server and client. Row Level Security (RLS) policies are configured on all tables to protect data.

---

## 9. Commands

```bash
# Development
bun dev                                    # Start dev server with Turbopack
bun run build                              # Production build
bun lint                                   # Run ESLint

# Database (requires Docker Desktop for local Supabase)
bunx supabase db diff -f <name>            # Generate migration from remote schema changes
bunx supabase db pull                      # Pull full schema from remote
bunx supabase link --project-ref <REF>     # Link CLI to Supabase project
```

---

## 10. Phase Roadmap

### Phase 1: MVP (current)

**Built:**
- Multi-tenant architecture (slug-based university namespaces)
- Institution setup flow (`/setup`)
- University-scoped auth (signup with email domain validation, login, logout)
- University hub (join via invite code)
- Club creation with interest tags and club type
- Club discovery with search and category filter
- Club dashboard shell with tabbed navigation (overview, members, events, projects, announcements, history)
- Club overview page (about, interests, featured placeholders)
- User profile with editable bio, interests, and skills
- University-aware header and navigation
- Marketing landing page with university search

**Still needed:**
- Events (creation, RSVP, attendance tracking)
- Member management (list, applications, approval workflows)
- Messaging between officers and members
- Announcements (create, display)
- Dashboard tabs beyond overview (members, events, projects, announcements, history are all placeholders)

### Phase 2: Stickiness

- Officer transition automation (handoff tools for outgoing leaders)
- Payment tools via Stripe (dues collection, event ticketing)
- Budget dashboards
- Push notifications
- Mobile-first UX improvements

### Phase 3: Institutional

- Admin dashboards for university staff
- Engagement analytics and compliance reporting
- Data export
- SSO integration (SAML)

---

## 11. Known Issues / Technical Debt

| Issue | Severity | Details |
|-------|----------|---------|
| No TypeScript types from schema | Medium | No `supabase gen types` output. All DB types are manually defined or cast with `as`. |
| No tests | Medium | No unit tests, integration tests, or e2e tests. |
| Build warning on /500 | Low | Prerendering of `/500` error page may produce warnings. |
| `members` count is denormalized | Low | `clubs.members` is a manually-incremented integer, not derived from `user_roles` count. Can drift. |
| TypeScript errors ignored | Low | `next.config.ts` has `typescript: { ignoreBuildErrors: true }`. |
| Some client-side DB writes | Low | Club creation and join-via-code do Supabase inserts directly from client components instead of server actions. |
| Reserved slug list incomplete | Low | `setup.ts` reserves some slugs but the list may not cover all future routes. |
| Legacy `club_id` on profile | Low | `profile.club_id` column appears unused (roles are in `user_roles`). |
