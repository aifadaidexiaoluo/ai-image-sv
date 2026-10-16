# DesignAI

A SvelteKit 2 application for AI-powered image generation, editing, background removal, and storage — with credits, payments, and multi-language support out of the box.

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes) + TypeScript strict mode
- **Styling**: Tailwind CSS + shadcn-svelte
- **Auth**: Better Auth (email/password + sessions)
- **Database**: PostgreSQL via Drizzle ORM
- **Storage**: MinIO (S3-compatible)
- **Queue**: BullMQ + Redis
- **Payments**: Alipay (sandbox)
- **i18n**: Paraglide

## Features

- Text-to-image and image-editing via OpenAI (`gpt-image-1`) or Tongyi Wanxiang (通义万相)
- Background removal via a configurable API endpoint
- Per-user credit system; Alipay payment flow (sandbox)
- Admin panel, usage history, image templates
- Email verification, password reset
- `MOCK_AI=true` mode for fully local development without real API keys

## Quick Start

### Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL
- Redis
- MinIO (or any S3-compatible storage)

### Setup

```bash
git clone <this repo>
cd ai-image-sv

bun install

cp .env.example .env
# Edit .env — see Environment Variables below

bun run db:push   # apply schema to your database

bun run dev
```

Open `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values. Every secret must stay **out of version control** — `.env` is already in `.gitignore`.

### Required

| Variable             | Description                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`       | PostgreSQL connection string, e.g. `postgres://user:pass@localhost:5432/ai_image_db` |
| `BETTER_AUTH_SECRET` | ≥ 32 random characters — generate with `openssl rand -base64 32`                     |
| `ORIGIN`             | Public URL of your deployment, e.g. `https://yourdomain.com`                         |

### Storage (MinIO / S3)

| Variable           | Description                                    |
| ------------------ | ---------------------------------------------- |
| `MINIO_ENDPOINT`   | MinIO server URL, e.g. `http://127.0.0.1:9000` |
| `MINIO_BUCKET`     | Bucket name                                    |
| `MINIO_ACCESS_KEY` | Access key                                     |
| `MINIO_SECRET_KEY` | Secret key                                     |
| `MINIO_REGION`     | Region (default `us-east-1`)                   |
| `MINIO_USE_SSL`    | `true` / `false`                               |

### Queue

| Variable                | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `REDIS_URL`             | Redis connection string, e.g. `redis://127.0.0.1:6379` |
| `JOB_QUEUE_CONCURRENCY` | Worker concurrency (default `1`)                       |

### Image Providers

Set `MOCK_AI=true` to skip all external APIs and return placeholder images locally.

| Variable                   | Description                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `MOCK_AI`                  | `true` enables mock mode                                                            |
| `OPENAI_API_KEY`           | OpenAI API key                                                                      |
| `OPENAI_BASE_URL`          | API base URL (default `https://api.openai.com/v1`; override for compatible proxies) |
| `OPENAI_IMAGE_MODEL`       | Model name (default `gpt-image-1`)                                                  |
| `DASHSCOPE_API_KEY`        | Tongyi / DashScope API key                                                          |
| `DASHSCOPE_IMAGE_MODEL`    | Model name (default `wanx-v1`)                                                      |
| `DASHSCOPE_IMAGE_ENDPOINT` | DashScope endpoint URL                                                              |
| `REMOVE_BG_API_KEY`        | Background-removal service API key                                                  |
| `REMOVE_BG_ENDPOINT`       | Background-removal service endpoint URL                                             |

### Email

When `EMAIL_HTTP_ENDPOINT` is unset, verification and reset links are logged to the console (development).

| Variable              | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `EMAIL_HTTP_ENDPOINT` | HTTP gateway URL for outgoing email                   |
| `EMAIL_HTTP_TOKEN`    | Bearer token for the email gateway                    |
| `EMAIL_FROM`          | Sender address, e.g. `DesignAI <noreply@example.com>` |

### Admin & Payments

| Variable             | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `ADMIN_EMAILS`       | Comma-separated emails granted admin on first registration |
| `ALIPAY_APP_ID`      | Alipay application ID                                      |
| `ALIPAY_PRIVATE_KEY` | RSA private key (PKCS8)                                    |
| `ALIPAY_PUBLIC_KEY`  | Alipay public key                                          |
| `ALIPAY_KEY_TYPE`    | `PKCS8` or `PKCS1`                                         |
| `ALIPAY_NOTIFY_URL`  | Async callback URL                                         |
| `ALIPAY_RETURN_URL`  | Sync return URL after payment                              |
| `ALIPAY_GATEWAY`     | Alipay gateway URL (sandbox or production)                 |

## Development Commands

```bash
bun run dev          # start dev server (http://localhost:5173)
bun run build        # production build
bun run preview      # serve production build locally
bun run check        # Svelte + TypeScript type check
bun run lint         # Prettier + ESLint check
bun run format       # auto-format

bun run db:generate  # generate Drizzle migration files
bun run db:migrate   # run pending migrations
bun run db:push      # push schema directly (dev)
bun run db:studio    # open Drizzle Studio
```

## Project Structure

```
src/
├── routes/          # SvelteKit pages and API routes
│   ├── (auth)/      # login, register, forgot-password, reset-password
│   ├── app/         # authenticated app shell (generate, history, settings)
│   ├── admin/       # admin panel
│   ├── api/         # server-only API endpoints and webhooks
│   ├── pricing/     # pricing page
│   └── checkout/    # payment flow
└── lib/
    ├── server/      # server-only code (auth, db, storage, jobs, providers)
    │   ├── db/      # Drizzle schema and migrations
    │   ├── providers/  # OpenAI, Tongyi, remove-bg adapters
    │   ├── jobs/    # BullMQ workers
    │   └── email/   # email gateway client
    ├── components/  # Svelte UI components
    └── paraglide/   # generated i18n messages (do not edit)
```

## Contributing

1. Fork the repo and create a feature branch.
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `style:`.
3. Run `bun run check && bun run lint && bun run build` before opening a PR.
4. Never commit `.env` or any file containing real credentials.

## License

MIT
