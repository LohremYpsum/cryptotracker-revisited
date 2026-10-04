# specs/ — Spec-Driven Development

The conventions every epic document and every skill in `.claude/skills/` relies on.
Adapted from `cookiefactory/RPL-Replay-Reloaded` and reduced to what a single-developer
React SPA actually needs.

## The loop

```
roadmap row  →  /brainstorm E-0n   →  /write-spec E-0n  →  /implement-epic E-0n  →  /verify-epic E-0n
               (requirements half)   (implementation half)  (tests first, then code)  (the gate)
```

Both halves live in **one file** per epic: `specs/Epics/epic-<id>-<slug>.md`. Requirements
describe *what must be true*; the implementation half describes *how it gets built and how
each step is proven*. Keeping them in one file means a reviewer never has to reconcile two
documents; keeping them in separate *phases* means the "what" is settled before the "how"
starts arguing.

A finished epic moves to `specs/Epics/done/`.

## Layout

| Path | Contents |
|---|---|
| `specs/Roadmap/roadmap.md` | All epics, their milestone, status, gate and dependencies |
| `specs/Epics/epic-<id>-<slug>.md` | One epic, both halves |
| `specs/Epics/done/` | Completed epics, unchanged |

There is deliberately no `Briefing/`, `Docs/` or `exclude/` tier: this project has one
developer and no upstream stakeholder, so the roadmap plus `CLAUDE.md` carry everything
those tiers would.

## Requirement IDs

IDs are **epic-scoped** and stable once written. Never renumber — a changed ID breaks the
traceability grep that `verify-epic` depends on.

| Prefix | Meaning | Example |
|---|---|---|
| `FR-E01-n` | Functional requirement | `FR-E01-2` |
| `AK-E01-n.y` | Acceptance criterion under `FR-E01-n` | `AK-E01-2.3` |
| `NFR-E01-n` | Non-functional requirement | `NFR-E01-1` |
| `ADR-E01-n` | Architecture decision record | `ADR-E01-1` |
| `T-E01-n` | Test obligation | `T-E01-4` |

`AK` is the load-bearing one. An acceptance criterion is testable or it is not an
acceptance criterion:

- **Good** — `AK-E02-1.2` Unmounting a chart component calls `chart.destroy()` exactly once.
- **Bad** — `AK-E02-1.2` Charts should clean up properly.

## Traceability — how an AK is proven

The RPL original uses PHPUnit `@covers` docblocks. Vitest has no docblock convention, so
this project uses the **test title**: every test that proves an acceptance criterion names
its ID as the first token.

```ts
it('AK-E02-1.2 — destroys the chart instance on unmount', () => { … })
```

`verify-epic` greps the suite for each `AK-…` in the epic. An AK with no match is reported
as **`not proven`** — distinct from `not done`. It means the code may well be correct and
nothing would go red if it broke.

One AK may be proven by several tests, and one test may name several AKs.

## The quality gate

```bash
npm run lint    # eslint, --max-warnings 0
npm run build   # tsc (typecheck) && vite build
npm test        # vitest run
```

All three must be green. There is no CI, so this gate only runs when someone runs it —
`verify-epic` is the thing that runs it in full.

> **Baseline, as of 2026-10-04:** `npm run lint` reports 11 errors and 4 warnings, and
> `npm run build` fails with 8 `TS6133` errors. This is pre-existing on `master`, not
> caused by the test setup. **E-00 exists to fix exactly this** and gates every other
> epic — until the gate can go green, no epic can be verified as done.

## Testing this stack

| Target | Level | How |
|---|---|---|
| `src/utils/*`, pure functions | unit | plain Vitest, no DOM |
| `src/hooks/*` | unit | `renderHook` from `@testing-library/react` |
| Components | component | `renderWithChakra` from `src/test/renderWithChakra.tsx` |
| Chart.js output | component | **mock `chart.js/auto`** and assert the config object |

The last row matters and is easy to get wrong. Chart.js draws to a `<canvas>`, and jsdom
implements no 2D context — you cannot assert pixels, and `getContext('2d')` returns `null`
unless mocked. What you *can* assert is the configuration the component hands to Chart.js:

```ts
vi.mock('chart.js/auto', () => ({ default: vi.fn(() => ({ destroy: vi.fn() })) }))
```

Then assert on the constructor's call arguments — the labels, the dataset values, the
chart type. That proves the data mapping, which is where the defects actually live.

## Hard rules

These hold for every skill and every contributor:

- **An epic document is only edited by `brainstorm` and `write-spec`.** `implement-epic`
  and `verify-epic` read it and report against it; they never edit it, not even to tick a
  task checkbox.
- **Never edit `specs/Roadmap/roadmap.md` from a skill.** If a roadmap row is wrong, say so
  and let the user decide.
- **Never change a spec to match what the code does.** That inverts the whole process.
  Report the divergence.
- **Never weaken a test to make it pass**, and never relax `--max-warnings 0` to make lint
  pass. A caught defect converted into a documented defect is a loss.
- **English in the spec files**, matching the codebase. Conversation can be German.
