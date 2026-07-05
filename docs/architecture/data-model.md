# Data Model v1 — Phase 1

**Status:** DRAFT — awaiting GATE 1.
**DB:** SQLite via Prisma (local-first). Schema is DB-agnostic → Phase 2 switches to Postgres with no rewrite.
**Scope (locked, 0002):** `Source`, `Item`, `Feedback` only. `User` / `CandidateSource` deferred to Phase 2.

---

## 1. SQLite / Prisma constraints that shape this schema

- **No native enums.** SQLite has no enum type; Prisma enums are unsupported on SQLite. → We use `String` fields validated in application code against exported constant unions (single source of truth in `src/lib/constants.ts`). This also keeps values portable to Postgres later.
- **`keywordFilters`** stored as a JSON **string** (`String`), parsed/validated at the boundary — avoids DB-specific JSON typing in Phase 1.
- **`userId`** exists on `Feedback` now (defaulting to a constant `"local"`) so the schema is Phase-2-ready without a `User` table yet — feedback data accrues per-user from day one.
- **Timestamps** default to `now()`; ingestion sets `publishedAt` / `fetchedAt` explicitly.

## 2. Validated string domains (app-level constants)

- **Source.type:** `rss | reddit_json | github_api | hn | arxiv | manual`
- **Source.platform:** `hackernews | reddit | rss | github | arxiv | x | linkedin | manual`
- **Source.category:** `research | products | models | companies | people | community | conferences`
- **Source.status:** `active | paused`
- **Source.refreshFrequency:** `daily` (Phase 1); `twice_daily` reserved for Phase 2.
- **Feedback.reaction:** `helpful | not_relevant | saved | opened`

> These live in code as `as const` unions and are validated (e.g. via a schema validator) before any DB write.

## 3. Proposed Prisma schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Source {
  id               String   @id @default(cuid())
  name             String
  category         String   // see constants: Source.category
  platform         String   // see constants: Source.platform
  type             String   // see constants: Source.type
  url              String   // feed URL / API endpoint / handle
  weight           Float    @default(1)      // manual ranking hint (Phase 2 uses it)
  refreshFrequency String   @default("daily")
  keywordFilters   String?  // JSON-encoded string[]; null = no filter
  status           String   @default("active")
  qualityScore     Float?   // populated by Phase 2 health report; nullable now
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  items            Item[]

  @@unique([type, url])   // no duplicate source rows
  @@index([status])
}

model Item {
  id           String   @id @default(cuid())
  sourceId     String
  title        String
  canonicalUrl String                       // where the signpost points
  summary      String?                      // one-line "why it matters" (Stage 1.4)
  author       String?
  platform     String                       // denormalized for fast filtering
  publishedAt  DateTime
  fetchedAt    DateTime @default(now())
  dedupeHash   String   @unique             // content/URL hash — dedupe across sources

  source       Source   @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  feedback     Feedback[]

  @@index([sourceId])
  @@index([publishedAt])
  @@index([platform])
}

model Feedback {
  id        String   @id @default(cuid())
  itemId    String
  userId    String   @default("local")      // Phase-2-ready; single user for now
  reaction  String                          // see constants: Feedback.reaction
  createdAt DateTime @default(now())

  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId])
  @@index([reaction])
}
```

## 4. Common normalized item shape (ingestion contract)

Every connector maps its raw payload to this before storage (per CLAUDE.md §4):

```ts
type NormalizedItem = {
  title: string
  url: string          // -> Item.canonicalUrl
  summary?: string     // pre-LLM excerpt if the source provides one
  source: string       // Source.id it came from
  author?: string
  platform: string     // Source.platform
  publishedAt: Date
}
```

`dedupeHash` is derived (e.g. hash of canonical URL, falling back to `title + platform`) so the same story from two sources collapses to one item.

## 5. Deferred to Phase 2 (documented, not built)

- **`User`** — real auth identity; `Feedback.userId` becomes a FK.
- **`CandidateSource`** — discovered-but-unvetted sources awaiting the rating gate (§4.6).
- **Ranking fields / feedback aggregates** — added when the ranking engine lands (Stage 2.1).
- **Postgres migration** — provider swap only; schema shape is already portable.
