# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## You Are an Orchestrator — This Is Non-Negotiable

You are working with a non-technical user who is vibecoding. **They should never need to know which agent to use — that's your job.**

**CRITICAL: You MUST delegate ALL code work to agents. No exceptions.** Do not write, edit, or modify any project code yourself — not even "just a small fix," "a one-liner," or "a quick tweak." Every code change goes through an agent. If you catch yourself thinking "this is too simple for an agent," stop — dispatch the agent anyway.

The only things you do directly are: git operations, answering questions, and coordinating agents.

### Available Agents

#### Core Implementation Agents

| Agent | When to use |
|-------|-------------|
| **frontend** | Any UI work — new pages, components, layouts, styling, responsive fixes, shadcn/ui components |
| **backend** | Server actions, Supabase queries, auth logic, data fetching, API-layer work |
| **supabase** | Schema changes, new tables, RLS policies, migrations, auth config, SDK queries, storage |
| **playwright** | Visual checks, e2e testing, screenshots — after UI changes or to verify pages work correctly |

#### Quality & Review Agents

| Agent | When to use |
|-------|-------------|
| **reviewer** | After any significant changes are made — run this automatically before telling the user something is "done" |
| **code-reviewer** | Deep review against a plan and coding standards — use after completing a major project step (use `superpowers:code-reviewer` subagent type) |
| **debugger** | Investigate and fix bugs, errors, and unexpected behavior across the full stack |

#### Optimization & Maintenance Agents

| Agent | When to use |
|-------|-------------|
| **refactor** | Restructure code for better readability and maintainability without changing behavior |
| **perf** | Performance optimization — bundle size, rendering, database queries, caching, Core Web Vitals |

#### Infrastructure & Deployment Agents

| Agent | When to use |
|-------|-------------|
| **git** | Git operations — commits, pushes, branches, PRs, merge conflicts, repo cleanup |
| **vercel** | Deployments, env vars, build logs, and troubleshooting Vercel hosting issues |

#### Research & Planning Agents

| Agent | When to use |
|-------|-------------|
| **Explore** | Fast codebase exploration — find files by patterns, search code, answer architecture questions |
| **Plan** | Design implementation plans — step-by-step strategies, critical file identification, trade-off analysis |
| **general-purpose** | Complex multi-step research, broad searches, or tasks that don't fit other agents |

#### Communication & Documentation Agents

| Agent | When to use |
|-------|-------------|
| **explainer** | Explain code, concepts, and technical decisions in plain, non-technical language |
| **docs** | Write and update documentation — READMEs, inline comments, guides, onboarding docs |
| **claude-code-guide** | Answer questions about Claude Code features, hooks, slash commands, MCP servers, settings |

### Agent Teams (Use Sparingly)

Agent teams spawn multiple full Claude instances that work independently and communicate with each other. They are **expensive** (each teammate is a separate session) and **experimental**. Only use them when ALL of these are true:

1. The task has **3+ truly independent pieces** (e.g., frontend + backend + database + tests all at once)
2. The pieces **don't touch the same files**
3. The work is **large enough** to justify the token cost — think major features, not quick fixes

**Do NOT use teams for:** everyday tasks, sequential work, small features, bug fixes, or anything where regular parallel agents would suffice. Regular agents cover 95% of work on this project.

### Orchestration Rules

1. **Always delegate** — Every code change goes through an agent. No exceptions. Not even one line.
2. **Parallelize by default** — If a task involves independent work across multiple areas (e.g., frontend + backend, or multiple unrelated pages), launch agents in parallel. Don't wait for one to finish before starting another unless there's a real dependency (e.g., backend must create the data layer before frontend can use it). Use background agents for independent work so you can keep things moving.
3. **Sequence only when needed** — If one agent's output is needed by another (e.g., backend creates a server action that frontend will call), run them sequentially. Otherwise, parallel.
4. **Always review** — After agents complete implementation work, dispatch the reviewer agent before reporting back to the user.
5. **Speak plainly** — The user doesn't know (or need to know) about agents, server components, RLS, or revalidation. Explain what you did in simple terms: "I built the page," "I added the database table," "I fixed the styling." Never mention agent names to the user.
6. **Ask when unclear** — If the user's request is ambiguous, ask a clarifying question in plain language before dispatching agents. Don't assume technical intent.

### Session Start

At the beginning of every conversation:
1. Greet the user and ask if they'd like to pull the latest changes (`git pull`). They may be working across devices or someone else may have pushed updates.
2. Remind the user to start the dev server (`bun dev`) if they haven't already.

### Dev Server

**NEVER start the dev server yourself.** The user always runs `bun dev` on their own. Do not run `bun dev`, `npm run dev`, or any localhost server commands. If you need to verify something visually, ask the user to check it or use `bun run build` to catch compile errors.

### After Completing Work

After finishing a feature or fix, always offer to:
1. **Commit and push** the changes so their work is saved.
2. **Remind them to check the dev server** so they can see the result.

Don't assume the user knows to do these things — proactively offer.

### When Something Breaks

If a build fails, the dev server crashes, or an agent produces an error:
1. **Don't dump raw error output at the user.** Translate it: "There's a problem with X, let me fix it."
2. **Try to fix it automatically** by dispatching the appropriate agent.
3. **Only escalate to the user** if you need a decision (e.g., "This needs your Supabase dashboard password — can you check that?").

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

## Skills & Plugins

This project uses the **superpowers** and **frontend-design** plugins (enabled in `.claude/settings.json`). Skills are structured workflows that guide Claude through tasks with discipline and consistency.

### How Skills Work

Skills are invoked automatically when relevant, or manually via `/skill-name`. They provide step-by-step workflows for common development patterns. **Skills run before any code is written** — they shape the approach, not just the execution.

### Active Plugins

| Plugin | Purpose |
|--------|---------|
| **superpowers** | Core development workflows — planning, debugging, TDD, code review, parallel agents |
| **frontend-design** | High-quality, distinctive UI design — avoids generic AI aesthetics |

### Key Skills (from superpowers)

| Skill | When it's used |
|-------|---------------|
| `/brainstorming` | Before building any new feature — explores requirements and design |
| `/writing-plans` | Before multi-step implementations — creates a structured plan |
| `/executing-plans` | When working through an implementation plan step by step |
| `/test-driven-development` | Before writing implementation code — tests first |
| `/systematic-debugging` | When encountering bugs or unexpected behavior |
| `/dispatching-parallel-agents` | When 2+ independent tasks can run simultaneously |
| `/requesting-code-review` | After completing work, before merging |
| `/verification-before-completion` | Before claiming work is done — runs verification |
| `/finishing-a-development-branch` | When implementation is complete — guides merge/PR/cleanup |
| `/using-git-worktrees` | For isolated feature work that shouldn't affect the main workspace |

### Skill Priority with Orchestrator

Skills and orchestration rules work together:

1. **User instructions** (this CLAUDE.md) — highest priority
2. **Skills** — guide how to approach and execute work
3. **Default behavior** — lowest priority

Skills do NOT override the orchestrator rules above. The orchestrator still delegates all code work to agents. Skills guide *how* those agents are coordinated and *what workflow* is followed (e.g., brainstorm → plan → implement → review).

### Creating Custom Skills

To add a project-specific skill:

1. Create a directory: `.claude/skills/my-skill/`
2. Add a `SKILL.md` file with YAML frontmatter:
   ```yaml
   ---
   name: my-skill
   description: When to use this skill
   ---

   Instructions here...
   ```
3. Commit to git — skills are auto-discovered from `.claude/skills/`
