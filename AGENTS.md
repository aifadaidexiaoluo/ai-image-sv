# Repository Guidelines

## Project Structure & Module Organization

This repository is a SvelteKit 2 application using Svelte 5, TypeScript, Tailwind CSS, and the Node adapter. Route components and server actions live in `src/routes`; follow SvelteKit conventions such as `+page.svelte`, `+page.server.ts`, and `+layout.svelte`. Shared code belongs in `src/lib`, reusable UI components in `src/lib/components/ui`, and server-only authentication and Drizzle database code in `src/lib/server`. Static files go in `static`; imported assets go in `src/lib/assets`. Translation sources are in `messages`, while `src/lib/paraglide` is generated from `project.inlang` and should not be edited manually.

## Build, Test, and Development Commands

Use Bun, matching the committed `bun.lock`:

- `bun install` installs dependencies.
- `bun run dev` starts the Vite development server; add `-- --open` to launch a browser.
- `bun run build` creates the production Node build.
- `bun run preview` serves the production build locally.
- `bun run check` performs Svelte and TypeScript diagnostics.
- `bun run lint` runs Prettier checks and ESLint; `bun run format` applies formatting.
- `bun run db:generate`, `db:migrate`, or `db:push` manage Drizzle schema changes.

Database commands require `DATABASE_URL` in the environment. Never commit credentials or local environment files.

## Coding Style & Naming Conventions

TypeScript strict mode is enabled. Let Prettier define whitespace (the existing code uses tabs), and run formatting rather than aligning code manually. Use PascalCase for reusable Svelte component filenames, camelCase for variables and functions, and descriptive lowercase route directories. Keep browser-safe utilities in `src/lib`; keep secrets and database access under `src/lib/server`. Svelte runes mode is enabled throughout application code.

## Testing Guidelines

No automated test runner or coverage threshold is currently configured. Treat `bun run check`, `bun run lint`, and `bun run build` as the required pre-PR verification suite. For new nontrivial behavior, add a suitable test framework in a focused change and colocate tests as `*.test.ts` near the code they cover.

## Commit & Pull Request Guidelines

Write concise, imperative commits with an optional Conventional Commit prefix, for example `feat: add image history` or `fix: validate login redirect`. Keep each commit focused. Pull requests should explain the user-visible outcome, note database or configuration changes, list verification commands, link related issues, and include screenshots for UI changes.
