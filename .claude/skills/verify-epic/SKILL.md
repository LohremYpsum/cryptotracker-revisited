---
name: verify-epic
description: Run full QA for one epic — the epic-filtered test suite, the full suite, lint and the typecheck/build, plus a traceability check that every acceptance criterion is named by a test. Reports acceptance-criteria coverage and flags any AK with no covering test. Use when asked to verify, QA or validate an epic, and at the end of implement-epic.
---

# verify-epic

Full quality gate for a single epic. Answers one question: **is every acceptance criterion in this epic actually proven?**

Distinct from the lightweight checks during implementation. Those confirm a task did not break anything; this confirms the epic is done.

## Input

```
verify-epic <epic-id>
```

`<epic-id>` resolves as in `brainstorm`; a completed epic resolves to `specs/Epics/done/`.

## Checks — run all of them, do not stop at the first failure

Collect everything, so one run gives the whole picture.

1. **Epic-filtered tests.**
   ```bash
   npx vitest run <the epic's test files>
   ```
   Derive the file list from the epic's Test Obligations.

2. **Full suite**, to catch collateral damage:
   ```bash
   npm test
   ```

3. **Lint:**
   ```bash
   npm run lint
   ```
   `--max-warnings 0` is part of the gate. A warning is a failure. If the epic added an
   `eslint-disable` comment, that is a **finding**, not a pass — report the rule, the file
   and the line.

4. **Typecheck and build:**
   ```bash
   npm run build
   ```
   This runs `tsc` first, so it is the typecheck as well as the bundle. Report the two
   separately when `tsc` is what failed; "the build is red" and "the types are wrong" send
   the reader to different places.

5. **Traceability check** — see below.

6. **Behaviour walk** — for each AK describing a user-visible behaviour, confirm a
   component test actually asserts the rendered outcome, not merely that the component
   rendered without throwing. A test whose only assertion is `expect(container).toBeTruthy()`
   proves nothing and must be reported as `not proven`.

## Traceability check — the core of this skill

1. Parse every `AK-<id>-n.y` from the epic document.
2. Grep the suite for each ID:
   ```bash
   rg -n "AK-E02-1\.2" src/
   ```
   Per `specs/README.md`, a proving test names the AK ID as the first token of its title.
3. **Report every AK with no match.** These are the requirements that can break without
   anything going red.

An uncovered AK is a **finding**, not a warning. Report it as `not proven`, distinct from
`not done`:

| Status | Meaning |
|---|---|
| `done` | A test names the AK and passes |
| `partly` | A test names the AK but covers only part of what it states |
| `not proven` | The behaviour appears implemented; no test names the AK |
| `not done` | The behaviour is not implemented |

## What this stack cannot verify

State these as limits in the report rather than passing over them:

- **No E2E layer.** Playwright is not installed and is deliberately not a dependency of
  this workflow. Everything is proven at the component level via Testing Library. An AK
  that genuinely needs a real browser — a CSS-dependent layout, a real network round trip
  — cannot be proven here. Say so; do not mark it `done`.
- **No canvas rendering.** jsdom implements no 2D context. A chart AK is proven by
  asserting the config handed to a mocked `chart.js/auto` constructor. An AK written as
  "the chart displays X" is **unverifiable as written** — report it as a spec problem and
  propose the assertable rewording.
- **No CI.** Nothing re-runs this gate after a push. The verdict is only true for the
  working tree at the moment it ran. Record the commit SHA in the report.

## Drift check

Compare a small number of recorded facts against reality and report divergences:

- **`CLAUDE.md`'s "Known rough edges" list** versus the code. An entry fixed by this epic
  should be struck from that list — report it as a required follow-up edit. This skill does
  not make the edit.
- **The roadmap's status column** for this epic versus what was just measured.
- **The E-00 baseline counts** in `specs/README.md` and roadmap §3 versus the current lint
  and build output. Once E-00 lands these go stale, and a stale baseline reads as a
  regression to the next person.

## Report format

```markdown
# verify-epic — <epic-id> <epic name>

**Run:** <date>   **Commit:** <sha>   **Verdict:** PASS | FAIL

## Acceptance Criteria

| AK | Status | Proven by |
|---|---|---|
| AK-E02-1.2 | done | PiechartMarketCap.test.tsx |
| AK-E02-2.1 | partly | covers the doughnut charts; the bar chart has no test |
| AK-E02-3.4 | not proven | no test names this AK |
| AK-E02-4.1 | not done | not implemented |

**Totals:** n done · n partly · n not proven · n not done

## Checks

| Check | Result |
|---|---|
| Epic tests | ✅ 12 passed |
| Full suite | ✅ 15 passed |
| Lint | ❌ 2 errors |
| Typecheck (tsc) | ✅ |
| Build (vite) | ✅ |
| Traceability | ❌ 1 AK unproven |

## Findings

Ordered most severe first, each with the AK it violates and what to change.

## Limits

What this run could not verify, and why.

## Drift

- `CLAUDE.md` still lists defect 2 as open; this epic fixed it
```

`PASS` requires: every AK `done`, zero `not proven`, all four commands green. Anything else
is `FAIL` with the reason stated. **Do not report a pass with caveats** — a caveated pass
gets read as a pass.

## Hard rules

- **Never modify the epic document** to match what the code does. That inverts spec-driven
  development. Report divergence and let the user decide.
- **Never mark an AK `done` because the code looks right.** `done` means a test proves it.
  Looking right is `not proven`.
- **Never skip a check silently.** Unavailable is a reported result, not an omission.
- **Do not fix anything.** This skill reports; `implement-epic` fixes. Keeping them
  separate is what makes the report trustworthy.
