# AI Intelligence Hub — Ideas V2

## 1. Problem Statement

The AI landscape moves faster than any individual can track. Major releases, research breakthroughs, influential voices, and community discussions happen simultaneously across many platforms. Missing even two weeks of news can leave you feeling out of the loop.

Worse, the platforms where this information lives — **LinkedIn, X (Twitter), Reddit** — are engineered to distract. Going to them for AI news means wading through **notifications, ads, algorithmic "stories," and engagement-bait** whose motives are the platform's, not mine. The signal I want is buried inside an attention economy designed to pull me elsewhere. It's easy to open X for one paper and lose 30 minutes to unrelated feeds.

**Goal:** Build a personal AI intelligence platform that aggregates, filters, and surfaces the AI developments that matter most to me — and eventually to others — in a **calm, distraction-free environment** with no ads, no notifications, and no algorithmic manipulation. Pull the signal out of the noisy platforms so I never have to visit them just to stay informed.

---

## 2. User Context

- Semi-technical background,former software engineer, deeply curious about AI and tech
- Running a business in a traditionally non-tech field
- Primary motivation: apply AI discoveries to everyday work
- Future intent: open the platform to other users with their own preferences

---

## 3. Core Concept

A single-platform web application that tracks everything happening in AI that I find personally relevant. The platform learns and improves based on my feedback over time.

**Working name:** TBD — a good, memorable app name is needed.

---

## 4. Content Sources

> **Guiding principle: the app is only as good as its sources.** Great sources produce a great feed; stale or noisy sources degrade it. Sources are therefore treated as a **first-class, living part of the product** — always reviewable, always editable, never hardcoded.

### 4.1 Categories to Track

| Category | Examples |
|---|---|
| **People** | Researchers, founders, engineers, influencers |
| **Companies** | Anthropic, OpenAI, Google DeepMind, Mistral, etc. |
| **Research Papers** | arXiv, conference proceedings |
| **GitHub Repos** | Trending AI repos, notable open-source projects |
| **LinkedIn** | Posts from key figures and organizations |
| **X (Twitter)** | AI community discussion, announcements |
| **Reddit** | r/MachineLearning, r/LocalLLaMA, r/artificial, etc. |
| **Top Researchers** | Curated list of researchers to follow |
| **Conferences** | ICML, NeurIPS, ICLR, CVPR, etc. |
| **Products** | New AI-powered tools and services |
| **LLM Models** | New model releases, benchmarks, comparisons |

> This list is open — additional categories can be added as the product evolves.

### 4.2 Source Management (Add / Remove / Edit)

The app must let me **manage sources directly** — no code change required to curate what it tracks:

- **Add** a new source (paste an RSS feed, subreddit, GitHub org, X handle, arXiv category, etc.)
- **Remove / disable** a source that has gone stale, noisy, or irrelevant
- **Edit** a source's settings — category, weight/priority, refresh frequency, keyword filters
- **Pause vs. delete** — temporarily mute a source without losing its config
- Every source stored as **data, not code** (a source registry), so the list evolves freely over time

### 4.3 Source Quality Review (Consistent, Recurring)

To keep quality high, each source is scored and reviewed on a recurring cadence rather than set-and-forgotten.

**Quality signals tracked per source:**

| Signal | What it measures |
|---|---|
| **Volume** | How much it publishes (too quiet = low value; too noisy = fatigue) |
| **Relevance rate** | % of its items I mark helpful vs. not-relevant |
| **Engagement** | How often I open / save / act on its items |
| **Freshness** | Is it still actively publishing, or has it gone dormant? |
| **Uniqueness** | Does it surface things other sources miss, or just duplicate them? |
| **Signal-to-noise** | Helpful items ÷ total items over a window |

**Recurring review ritual (e.g. monthly source health report):**
- Rank all sources by a composite **quality score** derived from the signals above.
- Flag **underperformers** (low relevance, dormant, high-noise) as candidates to prune or down-weight.
- Highlight **top performers** to weight more heavily.
- I make the final add/remove/reweight decision — the app recommends, I approve.

### 4.4 Suggesting New Sources

The app should actively help me *discover* sources, not just manage the ones I already have:

- **Discovery feed:** periodically surface candidate new sources (e.g. frequently-cited researchers, trending repos, newsletters, subreddits) with a reason for the suggestion.
- **Gap detection:** if a topic I engage with is thinly covered, recommend sources that would fill the gap.
- **Citation mining:** watch what my best sources reference/link to, and propose those as candidates.
- **One-tap adopt / dismiss:** accept a suggestion straight into the source registry, or dismiss it so it isn't re-suggested.
- Suggestions feed the same feedback loop, so recommendations improve over time.

### 4.5 Starter Source Catalog

A concrete, non-exhaustive starting list to seed the source registry. It is deliberately annotated with **access method** and **integration difficulty**, because how a source is fetched determines how much it costs to build and maintain.

**Difficulty legend:**
- 🟢 **Easy** — open RSS / JSON / free public API. Build first.
- 🟡 **Medium** — unofficial API, scraping, or rate-limited/keyed access.
- 🔴 **Hard** — paid API, login-gated, or against platform ToS. Approach with caution or via workarounds.

> **Phase 1 seed (recommended):** start with the 🟢 sources in *Research Papers*, *Lab/Company Blogs*, *Reddit*, *Hacker News*, and 2–3 *Newsletters*. They cover ~80% of high-signal AI news with the least engineering. Everything 🔴 (X, LinkedIn) is Phase 2 and may stay signpost-only.

#### Research Papers
| Source | Access | Difficulty |
|---|---|---|
| arXiv (cs.AI, cs.LG, cs.CL, cs.CV, stat.ML) | Official API + per-category RSS | 🟢 |
| Hugging Face Daily Papers | Public page / API | 🟢 |
| Papers with Code (trending + latest) | API / RSS | 🟢 |
| Semantic Scholar | Free API (keyed) | 🟢 |
| OpenReview (ICLR/NeurIPS submissions & reviews) | API | 🟡 |
| The Gradient | RSS | 🟢 |

#### Lab / Company Blogs *(mostly RSS — easiest high-signal wins)*
| Source | Access | Difficulty |
|---|---|---|
| Anthropic — News | RSS / page | 🟢 |
| OpenAI — Blog | RSS / page | 🟢 |
| Google DeepMind — Blog | RSS | 🟢 |
| Google Research — Blog | RSS | 🟢 |
| Meta AI (AI at Meta) — Blog | RSS | 🟢 |
| Microsoft Research — Blog | RSS | 🟢 |
| Mistral AI — News | Page | 🟡 |
| Cohere — Blog | RSS | 🟢 |
| Hugging Face — Blog | RSS | 🟢 |
| NVIDIA — Technical/AI Blog | RSS | 🟢 |
| Stability AI — News | Page | 🟡 |
| xAI — News | Page | 🟡 |
| AWS — Machine Learning Blog | RSS | 🟢 |

#### Newsletters / Analysis *(curated human signal)*
| Source | Access | Difficulty |
|---|---|---|
| Import AI (Jack Clark) | RSS / email | 🟢 |
| The Batch (DeepLearning.AI, Andrew Ng) | RSS / email | 🟢 |
| Ahead of AI (Sebastian Raschka) | RSS / email | 🟢 |
| Interconnects (Nathan Lambert) | RSS / email | 🟢 |
| Latent Space (swyx) | RSS / email | 🟢 |
| Simon Willison's Weblog | RSS | 🟢 |
| Last Week in AI | RSS / email | 🟢 |
| TLDR AI | Email | 🟡 |
| AI News (smol.ai) | RSS / email | 🟢 |

#### GitHub
| Source | Access | Difficulty |
|---|---|---|
| GitHub Trending (Python / overall) | No official API — scrape or unofficial API | 🟡 |
| Key orgs' releases (openai, huggingface, google-research, facebookresearch, pytorch, langchain-ai, vllm-project, ggerganov/llama.cpp) | Official GitHub API (releases/activity) | 🟢 |
| Papers with Code — trending repos | API | 🟢 |

#### Reddit *(public JSON is very accessible)*
| Source | Access | Difficulty |
|---|---|---|
| r/MachineLearning | Public JSON / API | 🟢 |
| r/LocalLLaMA | Public JSON / API | 🟢 |
| r/artificial | Public JSON / API | 🟢 |
| r/OpenAI | Public JSON / API | 🟢 |
| r/StableDiffusion | Public JSON / API | 🟢 |
| r/singularity | Public JSON / API | 🟢 |

#### Products / Launches / Community
| Source | Access | Difficulty |
|---|---|---|
| Hacker News (front page + Show HN, AI-filtered) | Algolia HN API (free) | 🟢 |
| Product Hunt — AI category | API / RSS | 🟢 |
| Hugging Face Spaces — trending | API | 🟢 |

#### LLM Models / Leaderboards
| Source | Access | Difficulty |
|---|---|---|
| Hugging Face Models — trending / new | API | 🟢 |
| LMSYS Chatbot Arena Leaderboard | Page / dataset | 🟡 |
| Open LLM Leaderboard (HF) | Page / API | 🟡 |
| Artificial Analysis (model benchmarks) | Page / API | 🟡 |
| Epoch AI (models & compute trends) | Page / data | 🟡 |

#### Conferences
| Source | Access | Difficulty |
|---|---|---|
| NeurIPS, ICML, ICLR (accepted papers, schedules) | OpenReview API + conference sites | 🟡 |
| CVPR / ICCV / ECCV (vision) | Conference sites / open-access proceedings | 🟡 |
| ACL / EMNLP (NLP) | ACL Anthology | 🟢 |
| AAAI, KDD, SIGGRAPH, COLM, RLC | Conference sites | 🟡 |

#### X (Twitter) 🔴 *(Phase 2 — hard; paid API / ToS-restricted)*
| Source | Access | Difficulty |
|---|---|---|
| Key accounts & lists (labs + researchers) — e.g. @AnthropicAI, @OpenAI, @GoogleDeepMind, @karpathy, @ylecun, @_akhaliq, @DrJimFan, @sama, @demishassabis | Paid X API or curated signpost links | 🔴 |

> **Reality check:** X's API is expensive and its terms are restrictive; free scraping is fragile and often against ToS. Treat X as **curated, signpost-only** (follow a hand-picked list of accounts, link out) rather than a bulk-ingested source.

#### LinkedIn 🔴 *(Phase 2 — hardest; no viable API)*
| Source | Access | Difficulty |
|---|---|---|
| Posts from key figures / companies | No public API; scraping violates ToS | 🔴 |

> **Reality check:** LinkedIn has no usable public API and actively blocks scraping. Realistically this stays a **manual / signpost-only** category — track a short list of people and open LinkedIn directly when needed, rather than ingesting it.

> **On the two 🔴 categories:** they were the original motivation (§1), yet they're the hardest to ingest. The pragmatic answer is that this app's *summarize-and-link* model (§5.4) lets us treat X and LinkedIn as **curated pointers** — a maintained list of who to follow, surfaced as links — without solving the full ingestion problem. That preserves the value (you know where to look) while keeping the build feasible.

### 4.6 Source Discovery & Vetting System (Human-in-the-Loop)

> **The concern this solves:** a platform like LinkedIn, X, or Reddit is enormous. *Which specific accounts, handles, authors, or subreddits within it are actually worth following?* And if we scrape a candidate, how do we know it's good enough to keep? This system answers both — it finds the **relevant places inside each big platform**, scores them, and only admits the ones **I approve**.

This is distinct from §4.2–4.4: those manage sources that already exist in my registry. **This system's job is to find *new candidate sources within a platform* and vet them before they ever enter the registry.** Nothing gets tracked until it clears a quality bar and my personal rating.

#### The Pipeline

**Step 1 — Seed & Discover (find candidates within a platform)**
- Start from **seeds** I provide: a few known-good accounts/handles, topics, keywords, or hashtags.
- The system expands outward *within that platform* to surface related candidates:
  - **X:** who my seed accounts follow/retweet, frequently-cited handles, accounts behind trending AI posts.
  - **Reddit:** top/most-upvoted posters in relevant subreddits, and related subreddits.
  - **LinkedIn:** authors of high-engagement AI posts connected to my seeds, companies frequently referenced.
  - **GitHub / newsletters / blogs:** frequently-linked authors and orgs.

**Step 2 — Sample & Score (automated first pass)**
- Pull a **small sample** of each candidate's recent content.
- Compute automated quality signals (reuses the §4.3 signals): topic relevance, posting cadence, engagement, originality / signal-to-noise, freshness.
- Produce a **ranked shortlist** of candidates — best first — so I'm never handed a random pile.

**Step 3 — Human Rating Gate (I decide what gets in)**
- The system presents each shortlisted candidate with a **preview** (who they are + a few sample posts) and asks me to **rate it** (e.g. 1–5 stars or keep/skip).
- **Only top-rated candidates are admitted** to the source registry and begin being tracked. Everything else is dropped or parked.
- This keeps me in control: the system does the tedious finding and scoring; I make the final call on quality. Nothing enters my feed without my sign-off.

**Step 4 — Continuous Re-Vetting**
- Periodically re-run discovery to catch newly relevant accounts/subreddits.
- Feed admitted sources into the recurring §4.3 health review, so a source that was great once but decays gets flagged and can be dropped.

#### Per-Platform Reality (how scraping actually works)

The *approach* to discovery/scraping differs by platform difficulty (per §4.5) — the system adapts rather than pretending one method fits all:

| Platform | Discovery / scraping approach |
|---|---|
| **Reddit** 🟢 | Automate fully — public JSON allows finding top posters, ranking subreddits, and sampling content. |
| **GitHub / RSS sources** 🟢 | Automate via official APIs — surface prolific authors and frequently-linked orgs. |
| **X** 🔴 | Semi-automated — limited by paid API/ToS. Use official API where affordable, otherwise **assisted-manual**: I paste/point at candidates, the system helps sample, score, and rate them. |
| **LinkedIn** 🔴 | **Assisted-manual only** — no viable API and scraping violates ToS. The system helps me *organize, score, and rate* candidates I supply, and maintains the vetted follow-list as signpost links (per §5.4). It does not auto-scrape LinkedIn. |

> **Guiding stance:** respect each platform's Terms of Service and `robots.txt`. Where automated scraping isn't permitted (LinkedIn especially), the system degrades gracefully into a **human-assisted curation tool** — it still does the ranking and rating workflow, just with me supplying the raw candidates. The output is the same either way: a **vetted, top-rated follow-list** feeding the registry.

---

## 5. Key Features

### 5.1 Aggregation
- Pull from multiple sources across platforms
- Unified feed filtered by relevance to me

### 5.2 Personalization & Feedback Loop
- Rate or react to content (helpful / not relevant / more like this)
- System adapts to preferences over time
- Explicit preference settings (topics, sources, people to follow)

### 5.3 Refresh Cadence
- **Open question:** Once per day vs. twice per day?
- Recommendation: twice daily (morning briefing + evening catch-up) to stay current without overwhelming

### 5.4 Source Referencing — "Point Me in the Right Direction"

**The app's job is to be a signpost, not a reader.** I do not need to consume the full article/post *inside* the app — I just need to know *what happened* and *where to go read it*. Reading the actual content on the original site is completely fine. This is a deliberate scope simplification: it keeps the build far simpler and sidesteps the hardest problems (embedding paywalled or login-gated content, x.com's restrictive embed terms, copyright).

**Core requirement — every item must:**
- **Point clearly to the source** — store and display the canonical URL of its origin (the exact x.com post, arXiv abstract, GitHub repo, Reddit thread). One tap opens the real source in the browser / native app.
- **Give enough to decide** — a short headline + one-line summary/why-it-matters so I can judge, in seconds, whether it's worth clicking through.
- **Show clear attribution** — source name, author/handle, platform, and original publish date/time on every card.
- **Support save-for-later** — bookmark an item (keeping its link) to open when I have time.

**Explicitly out of scope (kept simple):**
- Full-text in-app reader views, embedded posts/papers, and offline article caching are **not required**. Linking out is the expected, accepted behavior.

**Optional / nice-to-have (only if it stays cheap):**
- Lightweight rich previews (title, thumbnail, excerpt) where a platform provides them for free — but never a blocker, and never worth fighting embed restrictions for.

### 5.5 Feed Filtering & Focus Modes

As a **reader**, I want to narrow the feed to just what I care about *right now* instead of always seeing everything at once. Focus beats firehose.

- **Filter by platform** — show only one source platform at a time (e.g. "just Reddit," "just X," "just arXiv").
- **Filter by category** — narrow to a single content type (e.g. only *Research Papers*, only *LLM Models*, only *Products*).
- **Filter by individual source** — drill into a single source in the registry (e.g. only Anthropic's blog, only r/LocalLLaMA).
- **Combine filters** — e.g. *Research Papers from arXiv this week*, or *Reddit + X only*.
- **Focus / reading modes** — quick-switch presets so I can enter a single-lens reading session (one platform or one category) and concentrate, then clear the filter to return to the full feed.
- **Persistent & quick** — filters are one tap (chips / segmented control), remember my last choice, and are easy to reset. Fits the mobile-first, on-the-go UX (§6).
- Filtering is **view-only** — it changes what I *see*, never what's ingested or my underlying preferences.

### 5.6 User Authentication *(later stage)*
- Multi-user support
- Each user manages their own tracked sources and preferences
- Personal feeds independent of one another

---

## 6. UI / UX Design Requirements

The interface must be **extremely modern** and **extremely user-friendly**. It will be used across contexts — at a desk, in a car, on the SkyTrain — so readability and responsiveness are non-negotiable.

### 6.1 Responsive & Cross-Device
- **Mobile-first** design that scales gracefully to tablet and desktop
- Fluid layouts, no horizontal scrolling, touch-friendly tap targets (min 44×44px)
- Fast loads and smooth interactions even on mobile networks

### 6.2 Readability On-the-Go
- High-contrast typography, generous font sizes, comfortable line length
- Glanceable content — scan the feed in seconds while commuting
- **Dark mode** and light mode (auto-switch by system preference)
- Works well in bright outdoor light and low-light transit settings

### 6.3 Modern Feel
- Clean, uncluttered visual hierarchy with clear whitespace
- Subtle, purposeful motion (micro-interactions, not distraction)
- Accessible by default — WCAG 2.2 AA (color contrast, keyboard nav, screen readers)
- Offline-friendly / installable (PWA) so saved items are readable without signal

### 6.4 Distraction-Free by Design *(core principle)*
A deliberate antidote to LinkedIn / X / Reddit. The platform's incentives are aligned with **my attention, not engagement metrics**:

- **No ads, ever** — nothing sponsored, nothing promoted.
- **No engagement-bait** — no infinite scroll traps, no "stories," no autoplay, no red-dot notification pressure.
- **Calm by default** — no push notifications unless I explicitly opt in (e.g. a single daily digest); the app never nags to pull me back.
- **Content over chrome** — the AI signal is the whole screen; no unrelated feeds, trending sidebars, or "people you may know."
- **Finite, not endless** — the feed has a clear end (today's items), so I can finish reading and put it down instead of doom-scrolling.
- **My motives, not the platform's** — ordering is driven by my relevance feedback, never by what maximizes time-on-app.

### 6.5 Recommended Stack *(to confirm in planning)*
- **Framework:** Next.js (React) — SSR for speed + PWA support
- **Styling:** Tailwind CSS + a modern component library (shadcn/ui)
- **Motion:** Framer Motion for micro-interactions
- **Design tokens:** shared theme for light/dark and consistent spacing/type

---

## 7. Development Approach

### Principles
- **Plan before building** — no implementation without a documented plan
- **Build in two phases** — ship a simpler, working product first; only expand after reviewing it in real use
- **Thin vertical slices** — build one complete end-to-end path at a time (source → feed → screen), not all-backend-then-all-frontend
- **Feedback-driven** — if outputs feel off, iterate on the preference system before adding scope

### Two-Phase Model

Product development happens in **two phases**. Nothing is built all at once — Phase 1 delivers a usable core, and Phase 2 is only scoped *after* Phase 1 has been reviewed in real-world use.

#### Phase 1 — Simple Working Product (Personal MVP)
*Goal: a usable single-user app I can actually read on my commute.*

- Planning: PRD, architecture, and roadmap documents
- Ingest **2–3 highest-signal sources only** (e.g. arXiv, GitHub trending, one aggregator) — not all 11 categories at once
- **Source registry** with manual add / remove / edit (sources stored as data from day one — see §4.2)
- Unified, readable feed (mobile-first, dark mode, PWA)
- **Basic feed filtering** — by platform and by category, so I can focus on one lens at a time (see §5.5)
- **Source link + attribution + one-line summary on every item** (canonical URL, author, platform, timestamp — see §5.4). App points to the source; reading happens on the original site (no in-app reader to build)
- Basic like / not-relevant feedback capture (data collected, even if ranking is simple)
- Once-daily refresh
- Deploy for personal use

**→ REVIEW GATE:** Use the app daily for a period, judge feed quality, then decide Phase 2 scope.

#### Phase 2 — Expansion (Only After Review)
*Goal: broaden coverage and turn feedback into real personalization.*

- Add the remaining sources (LinkedIn, X, Reddit, conferences, people, products, models)
- **Automated source quality scoring + recurring health report** (§4.3) and **new-source suggestions** (§4.4)
- **Source Discovery & Vetting System** (§4.6) — discover candidate accounts/handles/subreddits within a platform, score them, and admit only the ones I rate highly
- Feedback-driven relevance / ranking engine
- Twice-daily refresh + optional notifications
- User authentication and per-user preferences (multi-user)
- Production hardening: monitoring, reliability, security audit

---

## 8. Build Tooling — Skills & Sub-Agents

This project will be built with Claude Code. The following ECC skills and sub-agents map to each stage of work. They are recommendations — invoke the ones that fit the task at hand.

### 8.1 Planning & Architecture

| Tool | Type | Use For |
|---|---|---|
| `planner` | Sub-agent | Turning each stage into a concrete implementation plan |
| `architect` / `code-architect` | Sub-agent | System design, data model, source-ingestion architecture |
| `plan-prd` / `plan` | Skill | Generating PRD, roadmap, and task lists |
| `api-design` | Skill | Designing the internal API and source-connector contracts |

### 8.2 Frontend (UI/UX)

| Tool | Type | Use For |
|---|---|---|
| `react-patterns` / `nextjs-turbopack` | Skill | Next.js + React best practices |
| `frontend-patterns` / `frontend-design-direction` | Skill | Modern, clean UI structure and visual direction |
| `design-system` | Skill | Reusable component + design-token system (light/dark) |
| `frontend-a11y` / `accessibility` | Skill | WCAG 2.2 AA compliance, readable-on-the-go UX |
| `motion-ui` / `motion-patterns` | Skill | Purposeful micro-interactions |
| `react-reviewer` | Sub-agent | Reviewing component + hook correctness and render perf |
| `a11y-architect` | Sub-agent | Accessibility architecture and audits |
| `react-build-resolver` | Sub-agent | Fixing React/Next build failures |

### 8.3 Backend & Data Ingestion

| Tool | Type | Use For |
|---|---|---|
| `backend-patterns` | Skill | API server structure and conventions |
| `data-scraper-agent` | Skill | Building source connectors (RSS, GitHub, Reddit, X, etc.) |
| `api-connector-builder` | Skill | Integrating third-party APIs cleanly |
| `postgres-patterns` / `prisma-patterns` | Skill | Schema design, migrations, querying |
| `redis-patterns` | Skill | Caching feeds + rate-limiting source polls |
| `database-reviewer` | Sub-agent | Query optimization and schema review |
| `security-reviewer` | Sub-agent | Securing API keys, auth, user data |

### 8.4 Personalization / Relevance Engine

| Tool | Type | Use For |
|---|---|---|
| `cost-aware-llm-pipeline` | Skill | LLM-based summarization + relevance scoring at low cost |
| `recsys-pipeline-architect` | Skill | Feedback-driven ranking / recommendation logic |
| `mle-workflow` | Skill | Evaluating and improving relevance quality |
| `mle-reviewer` | Sub-agent | Reviewing the scoring/ranking pipeline |

### 8.5 Auth & Multi-User *(later stage)*

| Tool | Type | Use For |
|---|---|---|
| `backend-patterns` | Skill | Auth flows and session handling |
| `security-scan` / `security-review` | Skill | Pre-launch security audit |
| `security-reviewer` | Sub-agent | Auth, authorization, PII handling review |

### 8.6 Quality, Testing & Deployment

| Tool | Type | Use For |
|---|---|---|
| `tdd-workflow` / `react-testing` | Skill | Test-first development, component tests |
| `e2e-testing` / `browser-qa` | Skill | Critical user-flow E2E coverage |
| `tdd-guide` / `e2e-runner` | Sub-agent | Enforcing coverage, running E2E journeys |
| `code-reviewer` | Sub-agent | General review after each change |
| `deployment-patterns` / `docker-patterns` | Skill | Production deploy + containerization |
| `production-audit` / `quality-gate` | Skill | Pre-production readiness checks |
| `build-error-resolver` | Sub-agent | Unblocking failed builds |

> **Workflow note:** For coordinating multiple of these at once, the `feature-dev`, `orch-build-mvp`, and `multi-workflow` skills can orchestrate planning → build → review in one pass.

---

## 9. Best Practices — How to Build This (from the ECC toolkit)

These practices are drawn directly from the ECC orchestration pipeline (`orch-pipeline`, `orch-build-mvp`, `orch-add-feature`) and its rules. They define *how* the two phases above should actually be executed.

### 9.1 The Gated Pipeline
Every unit of work — for both phases — flows through six phases with **two human approval gates**:

```
Intake → Research → Plan → [GATE 1] → Implement (TDD) → Review → [GATE 2] → Commit
```

- **GATE 1 (after Plan):** approve the task list *before* any implementation code is written.
- **GATE 2 (before Commit):** review the diff summary and commit messages *before* anything is committed.
- Everything between the gates flows without stopping. This keeps the build controllable without micromanaging every step.

### 9.2 Start With Phase 1 via `orch-build-mvp`
- Point `orch-build-mvp` at the Phase 1 spec/PRD document.
- It ingests the doc, orders the work into **thin vertical slices**, scaffolds the first end-to-end slice, then implements → reviews → commits each slice separately.
- Each slice is a real, working path — so you always have something usable, never a half-finished pile of parts.

### 9.3 Add Phase 2 Features via `orch-add-feature`
- After the Phase 1 review gate, bring in each Phase 2 capability as its own `orch-add-feature` slice.
- New capability = new slice = its own plan, tests, review, and commit. Never bolt everything on at once.

### 9.4 Right-Size the Ceremony
Match process weight to blast radius — don't over-engineer small changes:

| Change size | Process |
|---|---|
| Trivial (few lines) | Implement → Review → Commit |
| Small (1 file) | Light plan → Implement → Review → Commit |
| Standard (2–5 files) | Research → Plan → Implement → Review → Commit |
| Large (cross-cutting, new API/dep) | Full pipeline incl. architecture + scaffold |

> Anything touching auth, user data, external APIs, or secrets is **at least** "standard," regardless of size.

### 9.5 Research & Reuse Before Writing Code
Mandatory before any new implementation (per ECC `development-workflow`):
1. **GitHub search first** — `gh search repos` / `gh search code` for existing implementations.
2. **Vendor docs second** — Context7 / official docs to confirm APIs.
3. **Package registries** — prefer battle-tested libraries (npm/PyPI) over hand-rolled code.
4. **Broader web search** only when the above are insufficient.

> This matters a lot here — source connectors (RSS, GitHub, Reddit) are a solved problem; adopt proven libraries rather than reinventing them.

### 9.6 Test-Driven & Reviewed
- **TDD:** write the failing test first (red), implement to pass (green), then refactor.
- **Coverage target:** ≥ 80% on new/changed behavior.
- **Automatic security review:** any slice touching authentication, user input, database queries, file paths, external APIs, or secrets pulls in `security-reviewer` before Gate 2. (Directly relevant to Phase 2 auth + all source-API integrations.)

### 9.7 Docs Are the Handoff
The pipeline carries no hidden state — the planning documents *are* the source of truth:
- `PRD`, `architecture`, `system_design`, and `task_list` live under the repo's `docs/`.
- Conventional commits (`feat:`, `fix:`, `refactor:`), one per logical change.

---

## 10. Open Questions

1. **App name** — what should this be called?
2. **Refresh cadence** — once or twice daily?
3. **Which platforms to prioritize first** — where is signal highest for AI news?
4. **Content format** — summaries only, or full articles with links?
5. **Notification system** — push/email alerts for high-importance items?

---

## 11. Success Criteria

- I feel consistently up to date with AI without spending hours searching
- The feed improves over time as I interact with it
- I can identify relevant AI developments to apply in my business within days of their release
