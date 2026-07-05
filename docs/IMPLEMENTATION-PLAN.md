# Signal — Implementation Plan (Phased)

**Status:** DRAFT — awaiting GATE 1 approval before execution.
**Scope of this doc:** the full build plan, broken into phases → stages → vertical slices. Reference spec: [`Ideas_V2.md`](../Ideas_V2.md). Process rules: [`CLAUDE.md`](../CLAUDE.md).

---

## 0. Locked Decisions (from Preference Gate)

| Decision | Choice | Status |
|---|---|---|
| First sources | **Reddit + Hacker News + Lab blogs (RSS)** | ✅ locked |
| Refresh cadence | **Once daily** | ✅ locked |
| Hosting | **Local first, deploy later** | ✅ locked |
| Frontend | **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui** | ✅ locked |
| Database | **SQLite via Prisma** | ✅ locked |
| App name | **"AI Landscape Signal"** | ✅ locked |

> **DB note:** SQLite is the Phase 1 database (zero setup, local-first). The Prisma schema is DB-agnostic, so Phase 2 switches to Postgres for multi-user with no rewrite.

---

## 1. Guiding Rules (how every stage runs)

- **Planning → GATE 1 → Execution → Review → GATE 2 → Commit** for each slice.
- **Thin vertical slices** — each stage leaves the app runnable and demoable.
- **Preference Gate** at the start of each stage and at every real fork.
- **TDD**, ≥80% coverage on new behavior; `security-reviewer` whenever external APIs/scraping/secrets are touched.
- **Research & reuse** before writing connectors — adopt libraries (RSS parser, etc.).

---

## 2. PHASE 1 — Simple Working Product (Personal MVP)

**Goal:** a usable, calm, single-user app showing a once-daily, filterable feed of AI news from 3 sources, each item linking out to its origin — readable on your commute.

**Definition of done for Phase 1:**
- Runs locally; one command starts it.
- Pulls Reddit + Hacker News + ≥1 lab blog once daily into a unified feed.
- Sources are data (add/remove/edit at runtime), not hardcoded.
- Mobile-first reader UI: headline + one-line summary + attribution + source link.
- Filter by platform and category.
- Capture like / not-relevant / save feedback (stored).
- Then: **REVIEW GATE** — use it daily, judge quality, scope Phase 2.

### Stage 1.0 — Foundation & Scaffold
*Planning-heavy. Stands up the skeleton; no features yet.*

- **Tasks:** init Next.js+TS app; Tailwind + shadcn; Prisma + SQLite; base layout (light/dark); folder structure per CLAUDE.md §5; lint/test/CI config; `.env.example`.
- **Data model v1 (Prisma):** `Source`, `Item`, `Feedback` (see CLAUDE.md §6).
- **Deliverable:** app boots to an empty "feed" page; `npm run dev` works; tests run.
- **Skills/agents:** `architect`/`code-architect`, `db-schema`, `plan-prd`, `tdd-cycle`.
- **Gate:** GATE 1 on the data model + scaffold choices.

### Stage 1.1 — First Vertical Slice: one source end-to-end
*The proof the whole pipeline works, on the single easiest source.*

- **Source:** Hacker News (free Algolia API — no keys, most reliable).
- **Tasks:** `hackernews-ingest` connector → `dedupe-normalize` to common item shape → store in SQLite → minimal feed screen renders stored items (title + link + timestamp).
- **Deliverable:** run a fetch, see real HN AI items in the feed, click through to source.
- **Skills/agents:** `source-connector`, `hackernews-ingest`, `dedupe-normalize`, `research-reuse`, `tdd-cycle`, `security-reviewer` (external API).
- **Gate:** GATE 1 on connector interface (so sources 2 & 3 follow the same contract).

### Stage 1.2 — Source Registry (sources as data)
- **Tasks:** registry CRUD (add/remove/edit/pause); each source row drives which connector runs with what config; migrate HN to be a registry row (not hardcoded); minimal Sources management screen.
- **Deliverable:** add/disable a source from the UI; feed reflects it.
- **Skills:** `source-registry`, `api-endpoint`.
- **Gate:** GATE 1 on registry schema + connector-dispatch design.

### Stage 1.3 — Broaden Ingestion (reach all 3 sources)
- **Tasks:** `rss-ingest` connector (lab blogs — Anthropic/OpenAI/DeepMind RSS); `reddit-ingest` connector (r/LocalLLaMA, r/MachineLearning public JSON); category tagging per source; dedupe across sources.
- **Deliverable:** unified feed blending HN + Reddit + lab blogs.
- **Skills:** `rss-ingest`, `reddit-ingest`, `scraping-compliance` (ToS/rate-limit check), `source-connector`.
- **Gate:** GATE 1 per new connector (light — same contract as 1.1).

### Stage 1.4 — Item Enrichment (one-line "why it matters")
- **Tasks:** `summarize-item` — Claude generates a one-line summary per item; cost-aware model routing (Haiku for volume); cache to avoid re-summarizing; graceful fallback to source excerpt if the LLM call fails.
- **Deliverable:** every card shows a concise "why it matters" line.
- **Skills:** `summarize-item`, `relevance-scoring` (basic), `secrets-hygiene` (API key), `caching-ratelimit`.
- **Gate:** GATE 1 on prompt + cost approach; `security-reviewer` (API key handling).

### Stage 1.5 — Reader UX (the calm feed)
- **Tasks:** polished mobile-first item cards (headline, one-liner, attribution, source link, timestamp); dark/light theme + tokens; **finite-feed** behavior (clear end, no infinite scroll); save-for-later; PWA install + saved-items offline.
- **Deliverable:** the app feels good to read on a phone; distraction-free.
- **Skills:** `reader-feed-ui`, `mobile-first-ui`, `distraction-free-ux`, `finite-feed`, `design-tokens-theme`, `pwa-setup`, `a11y-check`; `react-reviewer`, `a11y-architect`.
- **Gate:** GATE 1 on card layout + interaction (Preference Gate on look/feel).

### Stage 1.6 — Feed Filtering (focus modes)
- **Tasks:** view-only filters by platform and by category; one-tap chips/segmented control; remembers last choice; easy reset.
- **Deliverable:** "just Reddit" / "just Research" focus views.
- **Skills:** `feed-filtering`.
- **Gate:** light GATE 1.

### Stage 1.7 — Feedback Capture
- **Tasks:** helpful / not-relevant / save / opened controls on each card; persist to `Feedback`; record signals per source for future scoring (data only — no ranking engine yet).
- **Deliverable:** feedback is captured and stored from day one.
- **Skills:** `api-endpoint`, `tdd-cycle`.
- **Gate:** light GATE 1.

### Stage 1.8 — Refresh Scheduler
- **Tasks:** once-daily poll across all registry sources; idempotent (no dupes); backoff/retry on source failure; last-run + error visibility.
- **Deliverable:** feed refreshes automatically each day.
- **Skills:** `refresh-scheduler`, `caching-ratelimit`.
- **Gate:** GATE 1 on scheduling approach (local cron vs. in-app job).

### Stage 1.9 — Phase 1 Hardening & Local Ship
- **Tasks:** E2E flows (read feed, filter, feedback, add/remove source); error states; empty/loading states; run `production-audit` (local scope); README/run instructions.
- **Deliverable:** stable personal build you run daily.
- **Skills:** `e2e-journey`, `e2e-runner`, `code-review-gate`, `production-audit`, `deploy` (local).

**→ PHASE 1 REVIEW GATE:** use it for a real period; judge feed quality & source mix; log findings to `docs/decisions/`; then scope Phase 2.

---

## 3. PHASE 2 — Expansion (only after the Phase 1 review)

Each capability is its own `orch-add-feature` slice (plan → GATE 1 → TDD → review → GATE 2 → commit). Order is provisional — re-prioritized at the review based on what Phase 1 taught us.

### Stage 2.0 — Phase 2 Planning
- Re-run the Preference Gate; write a Phase 2 PRD from Phase 1 learnings (which sources delivered signal, what the feed lacked).

### Stage 2.1 — Feedback-Driven Ranking
- Turn stored feedback into real relevance ranking; per-source weight; the feed orders by personal relevance.
- Skills: `feed-ranking`, `relevance-scoring`, `mle-workflow`; `mle-reviewer`.

### Stage 2.2 — Source Quality Review (health report)
- Compute volume, relevance rate, engagement, freshness, uniqueness, signal-to-noise; recurring ranked health report; recommend prune/reweight for your approval.
- Skills: `source-quality-review`.

### Stage 2.3 — Source Discovery & Vetting System (§4.6)
- Seed → discover candidates within a platform → sample → score → **your rating gate** → admit only top-rated. Start with the automatable 🟢 platforms (Reddit, GitHub).
- Skills: `source-discovery`, `scraping-compliance`.

### Stage 2.4 — Broaden Sources
- Add remaining 🟢/🟡 categories (arXiv, GitHub, conferences, products, LLM leaderboards). Add **X & LinkedIn as signpost-only** curated follow-lists (no scraping) per the ToS stance.
- Skills: `arxiv-ingest`, `github-ingest`, `source-connector`, `scraping-compliance`.

### Stage 2.5 — Cadence & Opt-in Digest
- Twice-daily refresh; opt-in daily digest (no nagging notifications).
- Skills: `refresh-scheduler`.

### Stage 2.6 — Multi-User Auth
- Auth + per-user registries and preferences; **migrate SQLite → Postgres** here. Independent feeds per user.
- Skills: `auth-multiuser`, `db-schema`, `security-review-gate`; `security-reviewer`, `database-reviewer`.

### Stage 2.7 — Production Hardening & Deploy
- Monitoring, reliability, error handling, security audit; deploy to a host (decide provider now).
- Skills: `production-audit`, `deploy`, `security-review-gate`.

---

## 4. Sequencing at a Glance

```
PHASE 1 (personal MVP, local, SQLite)
 1.0 Scaffold ─ 1.1 HN slice ─ 1.2 Registry ─ 1.3 +Reddit +RSS ─ 1.4 Summaries
   └ 1.5 Reader UX ─ 1.6 Filters ─ 1.7 Feedback ─ 1.8 Scheduler ─ 1.9 Harden
      → REVIEW GATE →
PHASE 2 (expansion, after review)
 2.0 Plan ─ 2.1 Ranking ─ 2.2 Health ─ 2.3 Discovery ─ 2.4 More sources
   └ 2.5 Cadence/digest ─ 2.6 Multi-user+Postgres ─ 2.7 Production
```

## 5. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Source APIs change / rate-limit | Isolated connectors; `scraping-compliance`; backoff; registry lets you disable a broken source without a deploy. |
| LLM summary cost creeps | Cost-aware model routing (Haiku for volume) + caching; summaries optional per-item. |
| X/LinkedIn temptation to scrape | Hard rule: signpost-only until a compliant paid path is explicitly authorized. |
| Feed feels noisy in Phase 1 | Feedback captured from day one so Phase 2 ranking has history; source mix adjustable via registry. |
| SQLite → Postgres migration | Prisma keeps schema portable; Phase 1 data is regenerable, so migration is low-stakes. |

## 6. Immediate Next Step

On approval (GATE 1) of this plan, begin **Stage 1.0 — Foundation & Scaffold**: draft the Phase 1 PRD + data model, run the Stage 1.0 Preference Gate, and stop again before writing code. (DB = SQLite, name = "AI Landscape Signal" — both locked.)
