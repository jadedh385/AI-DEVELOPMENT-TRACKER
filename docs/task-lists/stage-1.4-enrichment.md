# Stage 1.4 — Item Enrichment: Task List

**Status:** GATE 1 pending approval
**Decisions:** [0003-stage-1.4-enrichment.md](../decisions/0003-stage-1.4-enrichment.md)

## Tasks

- [ ] 1. Install `@anthropic-ai/sdk` package
- [ ] 2. Add `ANTHROPIC_API_KEY=` to `.env.example`; add startup validation in `src/lib/summarize.ts`
- [ ] 3. **TDD RED** — write `tests/lib/summarize.test.ts` (all tests failing)
- [ ] 4. **TDD GREEN** — implement `src/lib/summarize.ts`:
  - Accept `{ title, platform, category }` input
  - Skip and return existing summary if already set (idempotent)
  - Call Claude Haiku 4.5 with prompt-cached system prompt
  - Return one-line summary string on success, `null` on failure
- [ ] 5. Integrate into ingest pipeline — after storing new items, call `summarizeUnsummarized()` in the ingest orchestrator
- [ ] 6. Run `security-reviewer` on API key handling (mandatory per CLAUDE.md §11)
- [ ] 7. Run full test suite — verify ≥80% coverage on new code
- [ ] 8. GATE 2 — confirm diff + commit message before committing

## Acceptance Criteria

- `npm run ingest:all` stores new items AND populates their `summary` field via Claude
- Items with an existing `summary` are not re-summarized
- A missing or invalid `ANTHROPIC_API_KEY` logs a clear error and leaves summaries null (ingest does not crash)
- All tests pass; no regressions
