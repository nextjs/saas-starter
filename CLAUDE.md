# Deely

Social media strategy & content management platform.

## Tech Stack
- Next.js 15 (App Router) + React 19
- Tailwind CSS v4 + shadcn/ui + Lucide icons
- Drizzle ORM + PostgreSQL
- Stripe for billing

## Project Structure
- `app/(dashboard)/` — main app pages (Brain, Flow, Calendar, Monitor, Pulse)
- `app/(login)/` — auth pages
- `components/ui/` — shadcn/ui primitives
- `components/` — app-level components
- `lib/db/` — database schema, queries, migrations
- `docs/SPEC.md` — full product specification

## Navigation
6 flat pages: Brain, Flow, Calendar, Monitor, Pulse, Settings. No sub-pages.

## Design Rules
- Icons: strokeWidth={1.75}, h-4 w-4 in sidebar
- Use `cn()` for conditional Tailwind classes
- Clean, minimal, neutral aesthetic — no gradients/glow unless specified
- Mobile: use `sticky` not `fixed` headers
- Follow shadcn/ui patterns for all UI components

## Git
- Commit format: `<type>: <description>` (feat, fix, refactor, docs, test, chore)
- No attribution line in commits

## Commands
- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm db:generate` — generate migrations
- `pnpm db:migrate` — run migrations
