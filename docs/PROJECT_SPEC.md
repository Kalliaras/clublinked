# Clublinked Project Spec

## What is Clublinked

Clublinked is a multi-tenant web platform that connects university clubs with students. Club officers use it to manage their organizations — members, events, announcements. Students use it to discover and join clubs. Each university gets its own namespace (e.g., `clublinked.com/uchicago`), and institutions can later purchase admin access for oversight and analytics.

## How It Works

Every university-scoped route lives under a URL slug:

```
clublinked.com/                        Marketing site (for institutions)
clublinked.com/setup                   Create a university namespace
clublinked.com/[slug]/                 University hub
clublinked.com/[slug]/signup           Student/officer signup
clublinked.com/[slug]/login            Login
clublinked.com/[slug]/clubs            Club discovery
clublinked.com/[slug]/club/create      Create a new club
clublinked.com/[slug]/club/[clubid]/   Club dashboard (overview, members, events, etc.)
clublinked.com/[slug]/profile/[id]     User profile
```

Anyone with a `.edu` email can create a university namespace via `/setup`, then invite others. Signup at `/[slug]/signup` validates the user's email domain against the university's allowed domain.

## User Types

| Type | How they join | What they do |
|------|--------------|--------------|
| **Institution admin** | `/setup` page | Creates the university namespace, manages settings (future) |
| **Club officer** | `/[slug]/signup` with .edu email | Creates and manages clubs, tracks members |
| **Student** | `/[slug]/signup` with .edu email | Discovers clubs, submits applications, RSVPs to events |

All users share the same auth system (Supabase email/password + magic links). Roles are determined by database records, not separate auth flows.

## Database Tables

| Table | Purpose |
|-------|---------|
| `universities` | University records with `slug` and `email_domain` for multi-tenancy |
| `profile` | User profiles, linked to a university via `university_id` |
| `clubs` | Club records, scoped to a university via `university_id` |
| `user_roles` | Links users to clubs with a title and `is_owner` flag |
| `interest_tags` | Lookup table for interest categories |
| `skill_tags` | Lookup table for skill categories |
| `user_interests` | Many-to-many: users to interest tags |
| `user_skills` | Many-to-many: users to skill tags |
| `club_interests` | Many-to-many: clubs to interest tags |

No ORM — all queries use the Supabase SDK directly.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Database/Auth:** Supabase (PostgreSQL with RLS, email/password + magic links)
- **UI:** shadcn/ui (new-york style), Radix UI, Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **Package manager:** bun
- **Hosting:** Vercel

## Phase Roadmap

### Phase 1: MVP (current)
- Multi-tenant restructure (slug-based university namespaces)
- Events, RSVP, attendance tracking
- Member management and applications
- Messaging between officers and members
- Basic approval workflows

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

## Competitive Position

Incumbents (Anthology Engage, CampusGroups) sell top-down to institutions — big enterprise contracts, admin-focused UIs, weak automation, no AI. Clublinked goes **bottom-up**: any student can create a university namespace and start inviting clubs without an institutional contract. Density builds organically on campus, then the institution buys in. The slug architecture makes this possible — no enterprise sales needed to get started.
