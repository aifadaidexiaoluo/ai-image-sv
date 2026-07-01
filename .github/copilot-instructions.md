# Circle BBS Web - AI Coding Agent Guidelines

## Architecture Overview

**Tech Stack**: SvelteKit + Svelte 5 (runes) | TailwindCSS 4 | TypeScript | Cloudflare Pages

This is a forum/BBS web app using modern Svelte 5 features (runes like `$state`, `$derived`, `$props`) with a backend API integration layer built on TanStack Query.

### Key Directories

- `src/lib/api/`: API client modules organized by service domain
- `src/lib/components/ui/`: shadcn-svelte UI components
- `src/lib/components/sections/`: Feature-specific composite components
- `src/lib/hooks/`: Custom Svelte 5 reactive utilities (`.svelte.ts` files)
- `src/routes/(bbs)/`: Main forum routes (route groups)

## API Client Pattern

**Location**: `src/lib/api/client/{service}/`

Each API service module (post, user, article, auth, etc.) follows this structure:

```
post/
  ├── api.ts       # Raw axios API calls
  ├── use.ts       # TanStack Query hooks & query keys
  └── index.ts     # Exports both
```

### Query Keys Convention

Use hierarchical query keys defined in `{service}Keys` objects:

```typescript
// Example from src/lib/api/client/post/use.ts
export const postKeys = {
	all: ['post'] as const,
	lists: () => [...postKeys.all, 'list'] as const,
	list: (params: GetPostListReq) => [...postKeys.lists(), formatQueryKey(params)] as const,
	details: () => [...postKeys.all, 'detail'] as const,
	detail: (params: GetPostDetailReq) => [...postKeys.details(), formatQueryKey(params)] as const
};
```

### Usage Pattern

```typescript
import { useGetPostList } from '$lib/api/client/post/use';

// In component
const postsQuery = useGetPostList({ page: 1, limit: 10 });
const posts = $derived(postsQuery.data?.posts || []);
```

## Svelte 5 Patterns

**Always use runes** - This project uses Svelte 5's new reactive primitives:

```typescript
// State management
let count = $state(0);
let doubled = $derived(count * 2);

// Props
let { id, name = 'default' }: Props = $props();

// Custom hooks (src/lib/hooks/)
const open = new UseBoolean(false); // See use-boolean.svelte.ts
```

**Component Structure**: Prefer snippet-based templates over slot:

```svelte
{#snippet item(data)}
	<div>{data.name}</div>
{/snippet}

{@render item(someData)}
```

## Authentication & Axios Interceptors

**File**: `src/lib/api/client.ts`

- Axios instance automatically adds Bearer token from `getAccessToken()`
- 401 responses trigger `refreshSession()` and retry failed requests
- Token refresh middleware prevents redirect loops (checks `!page.url.pathname.includes('/auth')`)

## Internationalization (i18n)

**System**: Paraglide (Inlang) with base locale `zh-cn`

- Messages: `messages/zh-cn.json`
- Usage: Import from `$lib/paraglide/messages`
- Server middleware: `hooks.server.ts` injects locale via `paraglideMiddleware`

## Component Conventions

### UI Components

Located in `src/lib/components/ui/` - follow shadcn-svelte patterns:

- Use `cn()` utility from `$lib/utils` for className merging
- Export via barrel imports (`index.ts`)
- Props use TypeScript interfaces with Svelte's `$props()` rune

### Sections Components

Feature-specific composites in `src/lib/components/sections/`:

- `auth/`: Authentication forms and context
- `bbs/`: Forum-specific features
- `group/`: Group management
- `user/`: User profile components

## Development Workflow

```bash
# Development
bun run dev                    # Start dev server (port 5102)

# Building
bun run build                  # Production build for Cloudflare Pages
bun run preview                # Local Cloudflare Pages preview via wrangler

# Code Quality
bun run format                 # Format with Prettier
bun run lint                   # Check with ESLint + Prettier
bun run check                  # TypeScript & Svelte type checking

# Types Generation
bun run gen                    # Generate Cloudflare Worker types
```

**Note**: Preview uses `wrangler pages dev .svelte-kit/cloudflare --port 4173`

## File Organization Patterns

### Route Groups

Use SvelteKit route groups: `routes/(bbs)/` for main forum routes

### Barrel Exports

Components/modules export via `index.ts`:

```typescript
// src/lib/api/client/index.ts
export * as postClient from './post/index.ts';
export { postKeys } from './post/use.ts';
```

### Type Organization

API types in `src/lib/api/types/`:

- Organized by service: `post-types.ts`, `user-types.ts`, etc.
- Re-exported via `types/index.ts`

## Environment & Deployment

**Target Platform**: Cloudflare Pages (via `@sveltejs/adapter-cloudflare`)

- Config: `wrangler.jsonc`
- Compatibility date: 2026-02-04
- Node.js ALS enabled (`compatibility_flags: ["nodejs_als"]`)
- API base URL: `VITE_API_URL` env var (defaults to `http://localhost:8080`)

## Common Utilities

### File Handling

- `GetFileUrl()` from `$lib/fun/file` for file URL construction
- Upload utility: `src/lib/api/upload.ts`

### Time Formatting

- `$lib/fun/time.ts` for date/time utilities

### Clipboard

- Custom hook: `use-clipboard.svelte.ts` in `src/lib/hooks/`

## Testing Assets

- Random avatars: `randomAvatar` from `$lib/assets/sj`
- SVG icons: `$lib/assets/svg/`
- Emoji system: `$lib/assets/emoji/`

## Special Features

### Lexical Editor

Rich text editor at `src/lib/components/lexical-editor/` using Lexical framework

### Video Player

Shaka Player integration at `src/lib/components/shaka-player/`

- See `SHAKA_PLAYER_CONVERSION_REPORT.md` for migration notes

### Image Management

- `image-lightbox/`: Image preview/lightbox
- `image-uploader/`: Upload interface
- `image-manager/`: Batch management

## Gotchas

1. **Never use old Svelte 4 reactive syntax**: No `$:` labels, use `$derived` instead
2. **Auth context**: Must call `setAuthContext()` in root layout (already done in `+layout.svelte`)
3. **Query Client**: Wrapped via `QueryClientProvider` in root layout
4. **Cloudflare compatibility**: Some Node.js APIs may not work - check Cloudflare Workers compatibility
5. **Chinese locale**: Default UI language is Chinese (zh-cn)
