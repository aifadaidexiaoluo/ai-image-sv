# Repository Guidelines

## Project Structure & Module Organization

This is a SvelteKit 2 application using Svelte 5 runes, TypeScript, Tailwind CSS, and the Node adapter. Routes and server actions live in `src/routes`; follow conventions such as `+page.svelte`, `+page.server.ts`, and `+layout.svelte`. Shared code belongs in `src/lib`, hooks in `src/lib/hooks`, and shadcn-svelte primitives in `src/lib/components/ui/<component>`. Keep Better Auth and Drizzle code under `src/lib/server`. Static files go in `static`, imported assets in `src/lib/assets`, and translation sources in `messages`. `src/lib/paraglide` is generated from `project.inlang`; do not edit it manually.

## Build, Test, and Development Commands

Use Bun, matching the committed `bun.lock`:

- `bun install` installs dependencies.
- `bun run dev` starts the Vite development server; add `-- --open` to launch a browser.
- `bun run build` creates the production Node build.
- `bun run preview` serves the production build locally.
- `bun run check` performs Svelte and TypeScript diagnostics.
- `bun run lint` runs Prettier checks and ESLint; `bun run format` applies formatting.
- `bun run db:generate`, `db:migrate`, or `db:push` manage Drizzle schema changes.
- `bun run db:studio` opens Drizzle Studio; `bun run auth:schema` regenerates the auth schema.

Copy `.env.example` to a local environment file and set `DATABASE_URL`, `ORIGIN`, and a high-entropy `BETTER_AUTH_SECRET`. Never commit credentials.

## Coding Style & Naming Conventions

TypeScript strict mode is enabled. Let Prettier define whitespace (existing code uses tabs) and Tailwind class ordering. Use camelCase for variables/functions and kebab-case for UI component files, matching `button/button.svelte` and `alert-dialog/alert-dialog-content.svelte`. Re-export each primitive through its folder's `index.ts`; use `$lib` aliases instead of long relative imports. Keep browser-safe utilities in `src/lib` and secrets or database access in `src/lib/server`.

When building UI, prefer existing primitives from `src/lib/components/ui` before adding bespoke components. Use the existing `Carousel` component for carousel interactions when it fits the feature.

## Testing Guidelines

No automated test runner or coverage threshold is currently configured. Treat `bun run check`, `bun run lint`, and `bun run build` as the required pre-PR verification suite. For new nontrivial behavior, add a suitable test framework in a focused change and colocate tests as `*.test.ts` near the code they cover.

## Commit & Pull Request Guidelines

History follows Conventional Commits: `feat:`, `fix:`, `style:`, and `chore:`. Write concise, imperative subjects such as `feat: add image history`, and keep commits focused. Pull requests should explain the user-visible outcome, note database or environment changes, list verification commands, link related issues, and include before/after screenshots for UI changes.
