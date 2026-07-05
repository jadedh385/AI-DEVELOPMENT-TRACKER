# AI Landscape Signal — Phase 1 PRD

**Status:** DRAFT — awaiting GATE 1.
**Source of truth for WHAT:** [`Ideas_V2.md`](../../Ideas_V2.md). **Process:** [`CLAUDE.md`](../../CLAUDE.md). **Plan:** [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

---

## 1. Purpose

A calm, distraction-free, **single-user** web app that aggregates AI developments that matter to one semi-technical founder, filters them for personal relevance, and **points to the original source** — a signpost, not a reader. Runs locally, refreshes once daily.

## 2. Phase 1 Goal

A usable app showing a once-daily, filterable feed of AI news from **3 sources** (Reddit + Hacker News + a lab-blog RSS), each item linking out to its origin, readable on a phone during a commute.

## 3. In Scope (Phase 1)

- Ingest from Hacker News, Reddit, and ≥1 lab-blog RSS feed.
- Sources are **data** — add/remove/edit/pause at runtime, never hardcoded.
- Normalize every item to a common shape; de-duplicate.
- One-line "why it matters" summary per item (cost-aware LLM).
- Mobile-first reader feed: headline + one-liner + attribution + source link + timestamp.
- Filter the feed by platform and by category.
- Capture feedback (helpful / not-relevant / saved / opened) — **stored from day one**.
- Once-daily refresh; light/dark theme; PWA install + saved-items offline.
- Runs locally with one command.

## 4. Explicitly Out of Scope (Phase 1 — deferred to Phase 2)

- In-app full-text reading / content embedding / article caching (**never** — violates the signpost principle).
- Feedback-driven **ranking** (feedback is *captured* now, *acted on* in Phase 2).
- Automated source quality scoring / health reports.
- Source discovery & vetting system.
- X / LinkedIn (signpost-only, added in Phase 2).
- Multi-user auth; per-user registries (SQLite → Postgres happens in Phase 2).
- Twice-daily refresh; opt-in digest.
- Hosted deployment (local-first for Phase 1).

## 5. Non-Negotiable Principles (from CLAUDE.md §2)

1. **Signpost, not reader** — every item = headline + one-liner + attribution + canonical link. No in-app reader.
2. **Sources are first-class data** — registry table, editable at runtime.
3. **Distraction-free** — no ads, no infinite scroll, no engagement-bait; the feed is **finite** with a clear end.
4. **User in the loop** — nothing enters the registry without user sign-off (matters from Stage 1.2).
5. **Respect ToS / robots.txt** — public JSON/APIs only in Phase 1; rate-limited; graceful degradation.
6. **Relevance is personal & feedback-driven** — never engagement metrics.

## 6. Primary User Flows (Phase 1)

1. **Read the feed** — open app → see a finite, ranked-by-recency list of AI items → tap → land on the source.
2. **Filter** — one-tap platform/category chips → feed narrows → reset easily.
3. **Give feedback** — mark an item helpful / not-relevant / save.
4. **Manage sources** — add / edit / pause / remove a source; feed reflects it on next refresh.
5. **Refresh** — once daily automatically (and a manual "refresh now").

## 7. Success Criteria (Phase 1 exit / Review Gate)

- App boots locally with one command; feed renders real items from all 3 sources.
- Adding/pausing a source from the UI changes the feed with no code edit.
- Feed is readable on a phone (≥44px targets, no horizontal scroll, high contrast).
- Filtering by platform and category works and persists.
- Feedback is captured and stored for every reaction type.
- No duplicate items across sources.
- ≥80% test coverage on new behavior; connectors have parse + malformed-input tests.
- Then: use it daily → judge feed quality & source mix → scope Phase 2.

## 8. Stage Sequence (see IMPLEMENTATION-PLAN.md §2)

1.0 Scaffold → 1.1 HN slice → 1.2 Registry → 1.3 +Reddit +RSS → 1.4 Summaries → 1.5 Reader UX → 1.6 Filters → 1.7 Feedback → 1.8 Scheduler → 1.9 Harden → **Review Gate**.
