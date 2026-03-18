# Clublinked Multi-Tenant Architecture Spec

## Product Vision

Clublinked is **the operating system for student organizations**. Not another engagement platform — a workflow tool that club officers use weekly to run their orgs.

The platform is **multi-tenant by university**. Each university gets its own namespace. Students and officers sign up within their university's context. Institutions can later purchase admin access.

## Architecture: Slug-Based Multi-Tenancy

Every university-scoped route lives under a **URL slug**:

```
clublinked.com/                        -> Marketing site (for institutions)
clublinked.com/setup                   -> Institution onboarding (create university)
clublinked.com/[slug]/                 -> University hub
clublinked.com/[slug]/signup           -> Student/officer signup
clublinked.com/[slug]/login            -> Login
clublinked.com/[slug]/clubs            -> Club discovery for this university
clublinked.com/[slug]/club/create      -> Create a new club
clublinked.com/[slug]/club/[clubid]/   -> Club dashboard
clublinked.com/[slug]/profile/[id]     -> User profile
```

The `slug` is a short, URL-safe identifier for each university (e.g., `uchicago`, `umich`, `nyu`). It maps to the `universities` table via a `slug` column.

## User Types

| Type | How they sign up | What they do |
|------|-----------------|--------------|
| **Institution admin** | `/setup` page | Creates the university, manages settings (future) |
| **Club officer** | `/[slug]/signup` with .edu email | Creates and manages clubs |
| **Student** | `/[slug]/signup` with .edu email | Discovers and joins clubs |

All three use the same auth system (Supabase email/password). The difference is their role in the database.

## Auth Model

**MVP (now):**
- Email/password via Supabase Auth
- Email domain validation: signing up under `/uchicago` requires a `@uchicago.edu` email
- Magic link support (already in middleware)

**Phase 2 (later):**
- Google OAuth via Supabase (one config toggle)

**Phase 3 (much later):**
- Institutional SSO (SAML) for universities that require it

## Database Changes

### Modified: `universities` table

Add two columns:
- `slug` (TEXT, UNIQUE, NOT NULL) — URL identifier, e.g., "uchicago"
- `email_domain` (TEXT) — Allowed email domain, e.g., "uchicago.edu"

### Existing tables (unchanged)

- `profile` — already has `university_id` FK
- `clubs` — already has `university_id` FK
- `user_roles` — links users to clubs with title/is_owner
- `interest_tags`, `skill_tags` — tag lookup tables
- `user_interests`, `user_skills`, `club_interests` — many-to-many joins

### Key: University scoping

All data queries within `[slug]` routes filter by the university's ID. Clubs are scoped to the university. Profiles are linked via `university_id`. The `[slug]/layout.tsx` resolves the university and provides it via React context.

## Route Structure (New)

```
src/app/
├── page.tsx                              # Marketing landing page
├── layout.tsx                            # Root layout (header, footer, toaster)
├── setup/
│   └── page.tsx                          # Institution onboarding form
├── [slug]/
│   ├── layout.tsx                        # Resolves university, provides context
│   ├── page.tsx                          # University hub (join/search clubs)
│   ├── signup/
│   │   ├── page.tsx                      # Signup (scoped to university)
│   │   └── _components/infobox.tsx
│   ├── login/
│   │   ├── page.tsx                      # Login (scoped to university)
│   │   └── _components/infobox.tsx
│   ├── clubs/
│   │   └── page.tsx                      # Club discovery (queries DB)
│   ├── club/
│   │   ├── create/
│   │   │   └── page.tsx                  # Club creation
│   │   └── [clubid]/
│   │       ├── layout.tsx                # Club dashboard layout
│   │       ├── page.tsx                  # Redirects to overview
│   │       ├── _components/
│   │       │   └── club-dashboard-client.tsx
│   │       ├── overview/page.tsx
│   │       ├── members/page.tsx
│   │       ├── events/page.tsx
│   │       ├── projects/page.tsx
│   │       ├── announcements/page.tsx
│   │       └── history/page.tsx
│   └── profile/
│       └── [profileid]/
│           ├── page.tsx
│           └── _components/profile-client.tsx
├── actions/
│   └── auth.ts                           # Shared auth server actions
```

## Shared State: University Context

```tsx
// src/lib/context/university-context.tsx
"use client";
import { createContext, useContext } from "react";

type University = {
  id: string;
  name: string;
  slug: string;
  email_domain: string | null;
};

const UniversityContext = createContext<University | null>(null);

export function UniversityProvider({ university, children }) {
  return (
    <UniversityContext.Provider value={university}>
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const ctx = useContext(UniversityContext);
  if (!ctx) throw new Error("useUniversity must be used within UniversityProvider");
  return ctx;
}
```

The `[slug]/layout.tsx` fetches the university from Supabase by slug and wraps children in `UniversityProvider`.

## Phase Roadmap

### Phase 1: MVP (current focus)
- Multi-tenant restructure (this spec)
- Events, RSVP, attendance
- Member management (list, applications)
- Messaging
- Basic approvals

### Phase 2: Stickiness Layer
- Officer transition automation
- Payment tools (Stripe-based dues, ticketing)
- Budget dashboards
- Push notifications
- Mobile-first UX

### Phase 3: Institutional Layer
- Admin dashboards (for university staff)
- Engagement analytics
- Compliance reporting
- Data export
- SSO integration

## Competitive Position

All incumbents (Anthology Engage, CampusGroups) are:
- Institution-first (big enterprise sales)
- Admin-focused (not student-friendly)
- Weak on automation
- No AI

Clublinked goes **bottom-up**: clubs adopt it organically, density builds on campus, then the institution buys in. The `[slug]` architecture supports this — any student can create a university namespace and start inviting clubs, without needing an institutional contract.
