# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## You Are an Orchestrator

You are working with a non-technical user who is vibecoding. **They should never need to know which agent to use — that's your job.** When the user asks for something, figure out what kind of work it involves and dispatch the right agent(s) from `.claude/agents/`. Always use agents for implementation work rather than doing it directly.

### Available Agents

| Agent | When to use |
|-------|-------------|
| **frontend** | Any UI work — new pages, components, layouts, styling, responsive fixes, shadcn/ui components |
| **backend** | Server actions, Supabase queries, auth logic, data fetching, API-layer work |
| **supabase** | Schema changes, new tables, RLS policies, migrations, auth config, SDK queries |
| **code-reviewer** | After any significant changes are made — run this automatically before telling the user something is "done" |

### Orchestration Rules

1. **Always delegate** — When a task involves writing or modifying code, dispatch it to the appropriate agent. Don't implement directly.
2. **Split cross-cutting tasks** — If a request touches both frontend and backend (e.g., "add a members list page"), dispatch the backend agent first for data/actions, then the frontend agent for UI.
3. **Always review** — After agents complete implementation work, dispatch the code-reviewer agent before reporting back to the user.
4. **Speak plainly** — The user doesn't know (or need to know) about agents, server components, RLS, or revalidation. Explain what you did in simple terms: "I built the page," "I added the database table," "I fixed the styling."
5. **Ask when unclear** — If the user's request is ambiguous, ask a clarifying question in plain language before dispatching agents. Don't assume technical intent.

### Session Start

At the beginning of every conversation, greet the user and ask if they'd like to pull the latest changes before getting started (i.e., `git pull`). They may be working across devices or someone else may have pushed updates.

## Project Overview

Clublinked is a web platform connecting university clubs with students. Club admins manage onboarding and track applications; students discover clubs and submit forms.

## Commands

```bash
bun dev          # Dev server with Turbopack
bun run build    # Production build
bun lint         # ESLint
```

Database migrations (requires Docker Desktop running):
```bash
bunx supabase db diff -f <descriptive-name>   # Generate migration after prod UI changes
bunx supabase db pull                          # Pull full schema from prod
bunx supabase link --project-ref <REF>         # Link CLI to Supabase project
```

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19, TypeScript
- **Package manager:** bun
- **Database/Auth:** Supabase (PostgreSQL with RLS, email/password + magic links)
- **UI:** shadcn/ui (new-york style) with Radix UI, Tailwind CSS 4
- **Forms:** React Hook Form + Zod validation
- **Toasts:** Sonner
- **Path alias:** `@/*` → `src/*`

## Architecture

### Rendering Model

Server Components handle data fetching and layouts. Client Components handle forms and interactivity. No API routes — mutations go through Next.js server actions.

### File Conventions

- **Kebab-case** for all file names
- `actions.ts` files live alongside pages for server-side logic (must start with `"use server"`)
- `_components/` folders (underscore prefix) hold page-specific, non-routable components
- `index.tsx` is only for complex multi-file components (the actual component, not a re-export barrel)

### Route Structure

```
src/app/
├── page.tsx                          # Landing page
├── layout.tsx                        # Root layout (header, footer, toaster)
├── club/
│   ├── page.tsx                      # Club homepage
│   ├── clubsearch/                   # Club discovery
│   ├── clubsignup/                   # Club creation + join via invite code
│   └── dashboard/[clubid]/           # Club dashboard (dynamic)
│       ├── layout.tsx                # Dashboard nav
│       ├── overview/ members/ events/ projects/ announcements/ history/
├── user/
│   ├── login/ signup/                # Auth pages
│   ├── profile/[profileid]/          # Profile view/edit
│   └── actions/                      # Auth + profile server actions
```

### Supabase Clients

Three client variants in `src/lib/supabase/`:
- `server.ts` — Server-side (authenticated, cookie-based session)
- `client.ts` — Browser-side
- `proxy.ts` — Middleware use

### Database Schema (key tables)

`clubs`, `profile`, `user_roles` (links users to clubs with title/is_owner), `interest_tags`, `skill_tags`, `user_interests`, `user_skills`, `club_interests`, `universities`

No ORM — direct Supabase SDK queries: `supabase.from("table").select().eq().single()`

### Server Action Pattern

Actions follow this order: get context → verify auth → check authorization → validate ownership → database operation → handle errors → `revalidatePath()`.

### Client Form Pattern

Forms use React Hook Form with `zodResolver`, `useState` for `isSubmitting`, try/catch around server action calls, `toast` from Sonner for feedback, and `router.refresh()` after mutations. Use `Field`/`FieldGroup`/`FieldLabel`/`FieldError` components from `@/components/ui/field` for consistent form field styling.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Style Notes

- shadcn/ui config: new-york style, neutral base color, CSS variables, lucide-react icons
- Tailwind utility helper: `cn()` from `@/lib/utils/tailwind`
- TypeScript build errors are currently ignored in `next.config.ts`
