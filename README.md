# AI Landscape Signal

A calm, distraction-free personal feed for tracking AI developments that matter to you. Aggregates Hacker News and Reddit posts, enriches them with one-line LLM summaries, and surfaces them as a finite, completable reading list.

**What it is:** a signpost, not a reader — headline + one-liner + source link. No full-text, no ads, no infinite scroll.

---

## Prerequisites

- **Node.js** v20+ (v24 recommended)
- **npm** v10+
- **Anthropic API key** — for one-line item summaries ([get one](https://console.anthropic.com/))

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Create and migrate the database
npm run db:migrate
```

---

## Development

```bash
npm run dev
# Open http://localhost:3000
```

---

## Ingesting content

Run these whenever you want to pull fresh stories:

```bash
npm run ingest:all       # Hacker News + Reddit (recommended)
npm run ingest:hn        # Hacker News only
npm run ingest:reddit    # Reddit only
```

Or use the **Refresh** button in the UI (runs `ingest:all` server-side).

Ingestion fetches the latest posts, deduplicates them, generates LLM summaries, and stores them. The feed auto-shows the 50 most recent items.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file path — defaults to `file:./dev.db` |
| `ANTHROPIC_API_KEY` | Yes | API key for one-line item summaries |

---

## Tests

```bash
npm run test:run      # Unit + integration tests (Vitest)
npm run test:e2e      # E2E browser tests (Playwright, starts its own server)
```

E2E tests use an isolated `prisma/test.db` and do not affect your development data.

---

## Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Prisma Studio (database browser) |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
