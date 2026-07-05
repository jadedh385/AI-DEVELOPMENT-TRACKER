# CLAUDE.md

Guidance for Claude Code when working in this repository. **These instructions are binding.** Read this file at the start of every session before doing anything else.

The full product vision lives in [`Ideas_V2.md`](./Ideas_V2.md). This file is the *operating manual* for how to build it. When the two disagree, `Ideas_V2.md` defines **what** we build; this file defines **how** we build it.

---

## 1. Project Overview

**Working codename: "Signal"** *(provisional — final name is an open decision, see §13)*

Signal is a **personal AI-intelligence platform**: a calm, distraction-free web app that aggregates the AI developments that matter to one user (later, many users), filters them for personal relevance, and points to the original source. It is a **signpost, not a reader** — it tells you *what happened* and *where to go*, then gets out of the way.

- **Primary user:** a semi-technical founder (former software engineer) tracking AI to apply it to a non-tech business.
- **Core promise:** never feel left behind, without doom-scrolling LinkedIn / X / Reddit.
- **Primary surfaces:** mobile-first web (usable on a commute) + desktop, installable as a PWA.

---

## 2. Non-Negotiable Product Principles

These are load-bearing. Do not violate them without an explicit, logged decision from the user.

1. **Signpost, not reader (§5.4).** Every item = headline + one-line "why it matters" + attribution + canonical link. **Do NOT build in-app full-text readers, content embedding, or article caching.** Linking out is the intended behavior. This keeps the build small and sidesteps paywall/embed/copyright problems.
2. **Sources are first-class data, never hardcoded (§4).** All sources live in a **source registry** (a database table), editable at runtime. No source URL, handle, or feed is ever hardcoded in application logic.
3. **Distraction-free by design (§6.4).** No ads. No infinite-scroll traps. No engagement-bait. No nagging notifications (opt-in digest only). **The feed is finite** — it has a clear end so the user can finish and put it down.
4. **The user is always in the loop (§4.6).** The system *recommends*; the user *approves*. No new source enters the registry, and no automated pruning happens, without user sign-off.
5. **Respect platform ToS and `robots.txt` (§4.6).** Where automated scraping is not permitted (LinkedIn especially), degrade gracefully into an assisted-manual curation tool. Never build a scraper that violates a platform's terms or risks account bans. X and LinkedIn are **signpost-only** until proven otherwise.
6. **Relevance is personal and feedback-driven (§5.2).** Ranking follows the user's explicit feedback, never time-on-app or engagement metrics.

---

## 3. How We Work — Staged, Gated, Preference-Driven

This is the most important section. The build follows **three interlocking rules**: build in **stages**, separate **planning from execution**, and **ask the user's preferences at every stage**.

### 3.1 Planning Before Execution (always)

**Never write implementation code before an approved plan exists.** Every stage has two distinct modes:

- **PLANNING mode** — research, design, and produce a written plan (docs under `docs/`). No production code.
- **EXECUTION mode** — implement the *approved* plan via thin vertical slices, TDD, and review.

The transition from PLANNING → EXECUTION is a **hard gate** requiring user approval (see §3.3).

### 3.2 The Preference Gate Protocol *(ask at every stage)*

> **Rule: at the start of every stage, and at every meaningful fork, STOP and ask the user for their preferences before proceeding.** Use the `AskUserQuestion` tool. Do not assume defaults on decisions that shape the product.

At minimum, ask for preferences at these moments:

| When | Ask about |
|---|---|
| **Start of each stage** | Scope for this stage, priorities, what to include/defer |
| **Before choosing tech** | Framework, library, hosting, database choices (offer a recommendation + alternatives) |
| **Before each source integration** | Which sources to add this slice, and their priority/weight |
| **On any UX decision** | Layout, interaction, wording, information density |
| **On any tradeoff** | Simplicity vs. capability, cost vs. quality, speed vs. completeness |
| **Before Gate 1 (plan approval)** | Confirm the task list is right |
| **Before Gate 2 (commit)** | Confirm the changes and messages |

**How to ask well:**
- Batch related questions into a single `AskUserQuestion` call (up to 4 at once) so the user isn't drip-fed.
- Always lead with a **recommended option** (labelled "Recommended") and explain the tradeoff.
- Never ask about things already decided in `Ideas_V2.md` or this file — verify first, ask only what's genuinely open.
- Record the answers in the relevant `docs/` planning file so decisions persist.

### 3.3 The Per-Task Gated Pipeline

Every unit of work flows through this pipeline (from `Ideas_V2.md` §9, ECC `orch-pipeline`):

```
Intake → Research → Plan → [GATE 1: user approves plan] → Implement (TDD) → Review → [GATE 2: user approves commit] → Commit
```

- **GATE 1** — after planning: present the task list + preference questions; do **not** write code until approved.
- **GATE 2** — before commit: present the diff summary + proposed conventional-commit message; do **not** commit until approved.
- Between gates, work flows without stopping.

### 3.4 Right-Size the Ceremony

Match process to blast radius. Don't over-plan a typo fix; don't under-plan a new source connector.

| Change size | Process |
|---|---|
| Trivial (few lines) | Implement → Review → Commit |
| Small (1 file) | Light plan → Implement → Review → Commit |
| Standard (2–5 files) | Research → Plan → Implement → Review → Commit |
| Large (new connector, API, cross-cutting) | Full pipeline incl. architecture + scaffold |

> Anything touching auth, user data, external APIs, secrets, or scraping is **at least "standard"** and pulls in `security-reviewer` before Gate 2.

### 3.5 Thin Vertical Slices

Build **one complete end-to-end path at a time** (source → store → rank → feed → screen), not all-backend-then-all-frontend. Every slice must leave the app in a runnable, demoable state. Reference: ECC `orch-build-mvp`.

### 3.6 Research & Reuse First

Before writing new code (per ECC `development-workflow`):
1. `gh search repos` / `gh search code` for existing implementations.
2. Context7 / official vendor docs to confirm APIs.
3. npm / PyPI for battle-tested libraries.
4. Broader web search only if the above are insufficient.

> Source connectors (RSS, Reddit JSON, GitHub API, HN Algolia) are solved problems. **Adopt libraries; do not hand-roll.**

---

## 4. Tech Stack & Architecture

> The stack below is the **recommended default** from `Ideas_V2.md` §6.5. **Confirm it with the user via a Preference Gate before scaffolding** — do not treat it as locked.

- **Language:** TypeScript end-to-end (one language, lowest overhead for a solo build).
- **Framework:** Next.js (App Router) — SSR for speed, API routes for the backend, PWA support.
- **UI:** Tailwind CSS + shadcn/ui components; Framer Motion for restrained micro-interactions.
- **Database:** PostgreSQL via Prisma (typed schema + migrations).
- **Caching / rate-limiting:** Redis (optional in Phase 1; add when polling volume justifies it).
- **Scheduler:** cron-based refresh (platform cron or a job runner) for the daily/twice-daily poll.
- **LLM (summaries + relevance):** Claude — default to the latest capable model; use a cheaper tier (e.g. Haiku) for high-volume summarization, a stronger tier for ranking quality. See `claude-api` skill for current model IDs.
- **Hosting:** managed platform for Next.js + managed Postgres (confirm with user).

**Architecture shape (layered, per-source connectors):**

```
Ingestion layer   → connectors/*  (one module per source type: rss, reddit, github, hn, arxiv…)
      ↓
Normalization     → dedupe + map every item to a common shape {title, url, summary, source, author, publishedAt}
      ↓
Storage           → Postgres: sources registry, items, feedback, users (Phase 2)
      ↓
Enrichment        → LLM one-line "why it matters" summary + relevance score
      ↓
Feed/API          → ranked, filterable feed served to the client
      ↓
Client (Next.js)  → mobile-first reader UI, filters, feedback controls
```

Each connector is small, isolated, and independently testable. Adding a source = adding a connector + a registry row, nothing else.

---

## 5. Directory Structure

```
/CLAUDE.md              ← this file
/Ideas_V2.md            ← product spec (source of truth for WHAT)
/docs/                  ← all planning artifacts (the handoff; see §3.1)
  /prd/                 ← PRDs per phase/stage
  /architecture/        ← system design, data model, ADRs
  /task-lists/          ← approved task lists per slice
  /decisions/           ← logged preference-gate answers & tradeoffs
/.claude/
  /skills/              ← project skills (see §7)
  /agents/              ← project sub-agents (optional; see §8)
/src/
  /app/                 ← Next.js routes (feed, sources, settings)
  /connectors/          ← one module per source type
  /lib/                 ← normalization, ranking, summarization, db
  /components/          ← UI components
  /server/              ← API handlers, scheduler jobs
/prisma/                ← schema + migrations
/tests/                 ← unit / integration / e2e (mirrors src/)
```

Keep files small and cohesive (200–400 lines typical, 800 max). Many small files over few large ones.

---

## 6. Core Data Model (starting point — refine in planning)

- **Source** — `id, name, category, platform, type (rss|reddit_json|github_api|hn|arxiv|manual), url/handle, weight, refreshFrequency, keywordFilters, status (active|paused), qualityScore, createdAt`.
- **Item** — `id, sourceId, title, canonicalUrl, summary, author, platform, publishedAt, fetchedAt, dedupeHash`.
- **Feedback** — `id, itemId, userId, reaction (helpful|not_relevant|saved|opened), createdAt`.
- **CandidateSource** *(Phase 2, §4.6)* — discovered-but-unvetted sources awaiting the user's rating gate.
- **User** *(Phase 2)* — auth + per-user preferences and registry.

> Design the schema so `qualityScore` and feedback signals accrue **from day one**, even before the ranking engine exists. Phase 2 personalization needs Phase 1's data history.

---

## 7. Skills Catalog

Project-specific skills live in `.claude/skills/<name>/SKILL.md`. Invoke the matching skill whenever its trigger applies. Skills marked **(ECC)** map to an existing everything-claude-code skill — prefer reusing it; the rest are **project-defined** for Signal and should be scaffolded as needed.

> When a skill you need does not yet exist as a file, use the ECC `skill-create` skill to scaffold it from the description below, or define it inline and save it under `.claude/skills/`.

### 7.1 Process & Workflow Skills

| Skill | When to use | What it does |
|---|---|---|
| `stage-plan` | Starting any new stage | Produces a stage plan doc under `docs/`, runs the Preference Gate, and stops at GATE 1 for approval before execution. |
| `preference-gate` | At every meaningful fork | Batches open decisions into an `AskUserQuestion` call, records answers to `docs/decisions/`, and proceeds only on the user's choice. |
| `slice-build` | Executing an approved plan | Drives one thin vertical slice end-to-end (research → TDD → review → GATE 2 → commit). Wraps ECC `orch-build-mvp` / `orch-add-feature`. |
| `plan-prd` **(ECC)** | Producing a PRD/roadmap | Generates PRD, architecture, and task-list docs. |
| `research-reuse` | Before any new code | Runs the §3.6 GitHub → docs → registry → web search order and reports reusable options. |

### 7.2 Source & Ingestion Skills

| Skill | When to use | What it does |
|---|---|---|
| `source-connector` | Adding/modifying a source type | Scaffolds a new connector module (fetch → normalize → dedupe) with tests, conforming to the common item shape. |
| `source-registry` | Registry CRUD / schema work | Implements add/remove/edit/pause of sources as data (§4.2); never hardcodes a source. |
| `rss-ingest` | Any RSS/Atom source (blogs, newsletters, arXiv RSS) | Robust feed parsing with a vetted library; handles malformed feeds gracefully. |
| `reddit-ingest` | Reddit sources | Uses public JSON/API within rate limits; extracts top posts + metadata. |
| `github-ingest` | GitHub sources | Official GitHub API for releases/activity; trending via a compliant approach. |
| `hackernews-ingest` | Hacker News | Algolia HN API, AI-filtered front page + Show HN. |
| `arxiv-ingest` | Research papers | arXiv API/RSS per category (cs.AI, cs.LG, cs.CL, cs.CV, stat.ML). |
| `dedupe-normalize` | All ingestion | Maps heterogeneous items to `{title,url,summary,source,author,publishedAt}` and de-duplicates by content hash / canonical URL. |
| `scraping-compliance` | Any scrape/fetch of a third party | Enforces ToS + `robots.txt` checks, rate limits, and the assisted-manual fallback for 🔴 platforms. **Gate before any X/LinkedIn work.** |
| `source-quality-review` | Recurring source health (§4.3) | Computes volume, relevance rate, engagement, freshness, uniqueness, signal-to-noise; emits a ranked health report; recommends prune/reweight for user approval. |
| `source-discovery` | Finding new sources within a platform (§4.6) | Runs seed → discover → sample → score → **human rating gate** → admit. Only user-approved candidates enter the registry. |

### 7.3 Feed, Relevance & Personalization Skills

| Skill | When to use | What it does |
|---|---|---|
| `summarize-item` | Enriching ingested items | Generates the one-line "why it matters" via Claude; cost-aware model routing (see `claude-api`). |
| `relevance-scoring` **(ECC: cost-aware-llm-pipeline)** | Scoring items for the user | LLM + heuristic relevance score, batched and cached to control cost. |
| `feed-ranking` **(ECC: recsys-pipeline-architect)** | Ordering the feed (Phase 2) | Feedback-driven ranking that adapts to the user's helpful/not-relevant signals. |
| `feed-filtering` | Reader filters (§5.5) | View-only filtering by platform / category / source; persistent, one-tap, resettable. |
| `finite-feed` | Feed assembly | Enforces the finite-feed principle (§6.4): a bounded, completable feed with a clear end. |

### 7.4 Frontend / UX Skills

| Skill | When to use | What it does |
|---|---|---|
| `mobile-first-ui` **(ECC: frontend-patterns)** | Any UI work | Mobile-first responsive layouts, touch targets ≥44px, no horizontal scroll. |
| `distraction-free-ux` | Any UI/UX decision | Guards against ads, infinite scroll, engagement-bait; enforces §6.4. |
| `reader-feed-ui` | Feed & item cards | Glanceable card design: headline + one-liner + attribution + link, high-contrast, commute-readable. |
| `design-tokens-theme` **(ECC: design-system)** | Theming | Shared light/dark tokens, spacing, and type scale. |
| `pwa-setup` | Installability/offline saves | Configures the PWA (installable, saved items available offline). |
| `a11y-check` **(ECC: accessibility)** | Before shipping UI | WCAG 2.2 AA: contrast, keyboard nav, screen-reader labels. |
| `motion-restraint` **(ECC: motion-ui)** | Adding animation | Purposeful micro-interactions only; no autoplay/distraction. |

### 7.5 Backend / Infra Skills

| Skill | When to use | What it does |
|---|---|---|
| `api-endpoint` **(ECC: api-design / backend-patterns)** | New API route | Consistent response envelope, validation at boundaries, error handling. |
| `db-schema` **(ECC: prisma-patterns / postgres-patterns)** | Schema/migration work | Prisma schema + safe migrations for the model in §6. |
| `refresh-scheduler` | Refresh cadence (§5.3) | Cron job for once/twice-daily polling; idempotent, backoff on failure. |
| `caching-ratelimit` **(ECC: redis-patterns)** | Polling at scale | Cache feeds; rate-limit source polls to stay within provider limits. |
| `secrets-hygiene` | Any API key/credential | Env-var/secret-manager only; never hardcode; validate presence at startup. |
| `auth-multiuser` **(ECC: backend-patterns)** | Phase 2 auth | Auth flows, sessions, per-user registries and preferences. |

### 7.6 Quality, Security & Delivery Skills

| Skill | When to use | What it does |
|---|---|---|
| `tdd-cycle` **(ECC: tdd-workflow)** | All feature work | Red → green → refactor; ≥80% coverage on new behavior. |
| `e2e-journey` **(ECC: e2e-testing / browser-qa)** | Critical flows | E2E coverage of read-feed, filter, give-feedback, add-source. |
| `code-review-gate` **(ECC: code-review)** | Before every commit | Quality/security review; resolve CRITICAL/HIGH before Gate 2. |
| `security-review-gate` **(ECC: security-review)** | Auth, scraping, external APIs, secrets | OWASP + secret scanning; mandatory when a security trigger is touched. |
| `deploy` **(ECC: deployment-patterns)** | Shipping | Build, deploy, smoke-test the running app. |
| `production-audit` **(ECC: production-audit / quality-gate)** | Before production | Readiness checks: monitoring, reliability, error handling. |

---

## 8. Sub-Agents

Delegate to these when the work fits (all available in this environment as `ecc:` agents):

| Agent | Use for |
|---|---|
| `planner` | Turning a stage into a concrete implementation plan |
| `architect` / `code-architect` | System design, data model, connector architecture |
| `code-explorer` | Understanding existing code before a change |
| `tdd-guide` | Enforcing test-first implementation |
| `code-reviewer` | Review after writing code |
| `typescript-reviewer` / `react-reviewer` | Language/framework-specific review |
| `security-reviewer` | **Mandatory** for auth, scraping, external APIs, secrets |
| `database-reviewer` | Schema + query review |
| `a11y-architect` | Accessibility audits |
| `react-build-resolver` / `build-error-resolver` | Unblocking failed builds |
| `e2e-runner` | Running critical-flow E2E journeys |

> When spawning a sub-agent, pass the relevant skill's conventions into its prompt. **Only spawn sub-agents when the user asks or the task clearly warrants it** — prefer handling work inline otherwise.

---

## 9. Coding Conventions

Follows the user's global rules (`~/.claude/rules/ecc/common/*`). Highlights:

- **Immutability:** never mutate; return new objects.
- **KISS / DRY / YAGNI:** simplest thing that works; no speculative generality.
- **Naming:** `camelCase` vars/functions, `PascalCase` types/components, `UPPER_SNAKE_CASE` constants, `use`-prefixed hooks, `is/has/should/can` booleans.
- **Files:** small and focused; organize by feature/domain, not by type.
- **Errors:** handle explicitly at every boundary; validate all external data (API responses, feeds, user input); never swallow errors silently.
- **No magic numbers**, no deep nesting (prefer early returns), functions <50 lines.
- **Commits:** conventional (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`), one logical change each.
- **Git:** never commit or push unless the user asks; branch off the default branch first.

---

## 10. Testing & Quality Gates

- **TDD is mandatory** for features and fixes (red → green → refactor).
- **Coverage ≥ 80%** on new/changed behavior.
- **Connectors** need unit tests for parsing + a malformed-input case.
- **Critical E2E flows:** read feed, apply filter, submit feedback, add/remove source.
- Resolve all CRITICAL/HIGH review findings before Gate 2.

---

## 11. Security & Compliance

- **Secrets:** env vars / secret manager only; validate at startup; never in source or logs.
- **Input validation:** treat every feed, API response, and scraped payload as untrusted; sanitize before storing/rendering.
- **Scraping:** honor ToS + `robots.txt`; rate-limit; back off. **X and LinkedIn stay signpost-only** unless the user explicitly authorizes a compliant paid API path.
- **Security review** is mandatory (via `security-reviewer`) for anything touching auth, user data, external APIs, file paths, crypto, or scraping.

---

## 12. Build Roadmap (from `Ideas_V2.md` §7)

Two phases. **Phase 2 is only scoped after Phase 1 is reviewed in real use.** Each phase is delivered as a sequence of stages; each stage begins with a Preference Gate and a plan.

### Phase 1 — Simple Working Product (Personal MVP)
Suggested stage order (confirm scope per stage with the user):
1. **Plan & scaffold** — PRD, architecture, data model; stand up the Next.js + Postgres skeleton.
2. **First vertical slice** — one 🟢 source (e.g. arXiv *or* an RSS blog) → normalize → store → minimal feed screen.
3. **Source registry** — add/remove/edit sources as data.
4. **Broaden ingestion** — 2–3 total 🟢 sources (arXiv, a lab blog, Reddit or HN).
5. **Reader UX** — mobile-first feed, item cards, source link + one-line summary, dark mode, PWA.
6. **Feed filtering** — by platform and category (§5.5).
7. **Feedback capture** — like / not-relevant / save (data collected even if ranking is simple).
8. **Refresh scheduler** — once-daily poll.
9. **Deploy for personal use.**

**→ REVIEW GATE:** use it daily, judge feed quality, then plan Phase 2.

### Phase 2 — Expansion (after review)
Each as its own `orch-add-feature` slice: remaining sources (incl. signpost-only X/LinkedIn), automated source quality scoring + health report (§4.3), source discovery & vetting system (§4.6), feedback-driven ranking, twice-daily refresh + opt-in digest, multi-user auth, production hardening.

---

## 13. Open Decisions (defer to the user — do not silently pick)

Raise these via the Preference Gate when relevant; log answers to `docs/decisions/`:

1. **App name** (codename "Signal" is provisional).
2. **Refresh cadence** — once vs. twice daily.
3. **First sources** — which 2–3 🟢 sources to build first.
4. **Tech stack confirmation** — accept the §4 default or adjust.
5. **Hosting/database provider.**
6. **Notifications** — opt-in digest now or defer to Phase 2.

---

## 14. Session Start Checklist

At the beginning of each working session:
1. Read this file and the relevant `docs/` planning artifacts.
2. Identify the current stage and whether you are in PLANNING or EXECUTION mode.
3. **Run a Preference Gate** for any open decision in the upcoming work (§3.2).
4. Confirm the plan (GATE 1) before writing code.
5. Work in thin vertical slices; review; confirm (GATE 2) before committing.
