# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives in `app/`; `app/(login)` handles marketing and auth flows, `app/(dashboard)` powers signed-in UI, and `app/api` exposes server routes. Reusable UI sits in `components/ui`, while `lib/` holds auth, database, and payment logic guided by `drizzle.config.ts`. Cross-cutting middleware lives in `middleware.ts`, and Postgres defaults ship in `docker-compose.yml`.

## Build, Test, and Development Commands
Run `pnpm install` once. Use `pnpm dev` for Turbopack development, `pnpm build` for production bundles, and `pnpm start` for the preview server. Database helpers: `pnpm db:setup` seeds `.env`, `pnpm db:migrate` applies schema changes, `pnpm db:seed` loads fixtures, and `pnpm db:studio` opens Drizzle Studio. Bring up Postgres with `docker compose up postgres`, and forward Stripe events via `stripe listen --forward-to localhost:3000/api/stripe/webhook` during billing tests.

## Coding Style & Naming Conventions
Stick to TypeScript. Components and files exporting JSX use PascalCase, while functions, hooks, and directories stay camelCase or kebab-case. Prefer the `@/` alias over deep relatives, keep Tailwind class lists readable, and format with 2-space indents. Run `pnpm exec next lint` (or `pnpm exec next lint --fix`) before submitting.

## Testing Guidelines
Automated tests are not yet wired in, so every PR must document manual verification steps—screens touched, API calls exercised, migrations run. If you introduce tests, colocate them beside the feature (`component.test.tsx`) or under `tests/`, and align on Vitest + React Testing Library after confirming with maintainers. Focus any new coverage on data access (`lib/db`) and payment flows, and call out gaps in the PR body.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat:`, `fix:`, `refactor:`) as in `fix: mutate instead of router.refresh (#164)`; skip placeholder messages. Pull requests need a short summary, screenshots or terminal output when UX or CLI flows change, links to issues, and notes on Stripe or database setup. Update docs (e.g., `README.md`, content in `app/(dashboard)`) whenever behaviour changes.

## Security & Configuration Tips
Create secrets through `pnpm db:setup` or `openssl rand -base64 32` and keep `.env.local` out of git. Provide Stripe keys and Postgres URLs through environment variables in Vercel or Docker overrides. When editing auth or middleware, ensure new routes still call `getUser()`/`getTeamForUser()` and avoid leaking sensitive SWR fallback data.
