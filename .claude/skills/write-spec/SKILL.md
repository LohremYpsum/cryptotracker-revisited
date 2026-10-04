---
name: write-spec
description: Extend an epic document with its implementation half — architecture decision records, granular tasks in TDD order, test obligations and a definition of done. Asks selectable multiple-choice questions for major architectural decisions until none are open. Use after brainstorm has completed an epic's requirements, or when asked to write a technical specification for an epic.
---

# write-spec

Turn the requirements half of an epic into an executable implementation plan.

`brainstorm` establishes *what must be true*. This skill establishes *how it gets built, in what order, and how each step is proven*. Both halves live in the same file — see `specs/README.md`.

## Input

An epic identifier, same resolution rules as `brainstorm`.

## Precondition — check first, refuse if unmet

The epic file must exist and pass `brainstorm`'s completeness gate:

- every FR has at least one AK
- no AK contains a TBD or an unresolved either/or
- no unanswered questions remain in `## Open Questions`

If any fails, **stop and say which**. Writing tasks against vague requirements produces tasks nobody can verify, and the vagueness surfaces mid-implementation where it is most expensive.

## Read before writing

Everything `brainstorm` reads, plus:

- **The working tree, properly.** Task steps must name real files and real existing patterns. `src/hooks/useCoins.ts`, `src/components/charts/*`, `src/utils/chartData.ts` and the `renderWithChakra` helper exist — a task that ignores them produces code that does not match the codebase.
- `CLAUDE.md` — the stack's best practices. A task that violates one needs an ADR saying why.
- `specs/README.md` §"Testing this stack" — what is assertable at which level. This directly constrains the Test Obligations you may write.
- Sibling epics' task sections, for granularity calibration.

## Sections to add

Append beneath the requirements, keeping the existing numbering coherent:

### Architecture Decision Records

One `ADR-<id>-n` per genuine decision, and only for genuine decisions — a choice with a real alternative someone could reasonably prefer. Each carries:

- **Decision** — one sentence, unambiguous
- **Rationale** — why, referencing the requirement or constraint that forces it
- **Rejected alternatives** — a table of alternative → why rejected. This is the most valuable part and the most often skipped; it is what stops the same debate reopening in three months.
- **Consequences** — including any deviation from `CLAUDE.md`, which must be recorded as such

Do not write an ADR for "we will use a `useEffect`". Do write one for anything that changes where state lives, adds a dependency, changes the component tree, or changes what a test can observe.

Any ADR that resolves an open decision from roadmap §5 must cite its `D-n` ID — and note that this skill cannot mark it resolved in the roadmap, only report that it should be.

### Granular Tasks

Checkbox tasks, `T1`…`Tn`, in **executable order**. Each task must be:

- **Small enough to finish and verify** in one sitting
- **Named against real artefacts** — "Derive chart labels and values from props via `useMemo` in `PiechartMarketCap.tsx`, drop the `initialChartData` import", not "fix the charts"
- **Ordered by real dependency.** If T5 needs T4's hook signature, say so in T4. An order that cannot be executed is a defect in the spec, not a detail for the implementer.
- **Traceable** — reference the FR/AK it serves where it is not obvious

Flag any task that changes a shared module (`useCoins.ts`, `chartData.ts`) — those have four consumers each, and a signature change is an epic-wide ripple, not a local edit.

### Test Obligations — TDD, in this project's vocabulary

Derive `T-<id>-n` **directly from the AK list**.

- Every AK maps to at least one T. An AK with no test is a requirement nobody will notice breaking.
- Each T names its **assertion**, not just its topic: "unmount calls `destroy` exactly once" beats "test chart cleanup".
- Mark each T with its level: **unit** (`src/utils/*`, pure functions), **hook** (`renderHook`), or **component** (`renderWithChakra` plus DOM assertions).
- Name the mocking strategy where one is required. For anything touching Chart.js this is mandatory and non-obvious — jsdom has no 2D canvas context, so the component mocks `chart.js/auto` and asserts the constructor's config argument. State that in the T, do not leave the implementer to rediscover it.
- Where a rule has combinatorial surface, require exhaustiveness rather than samples.
- Every T must state the **AK ID that will appear in its test title**, per the traceability convention in `specs/README.md`. `verify-epic` greps for exactly that.

### Definition of Done

A checklist a reviewer can walk without reading the rest of the document. Include the three gate commands passing, the conventions recorded, and — critically — the **user-visible outcome** stated plainly, so "done" is not purely internal.

## Architecture questions

When a major architectural decision cannot be made from the requirements, ask. Same format as `brainstorm` — four options, exactly one recommended, `[ ]` selectable, consequences stated.

Ask only about decisions that are **structural** — where state lives, a new dependency, the shape of a shared module's API, what a test can observe. Do not ask about anything derivable from an existing pattern in the codebase; read the pattern and follow it.

Keep asking across cycles until no architecture decision is open. Then convert each answer into an ADR with its rationale, and log the Q&A in the answer log alongside `brainstorm`'s cycles.

## Hard rules

- **Never edit an epic other than the one you were invoked for, and never edit `specs/Roadmap/roadmap.md`.** You append the implementation half to one file in `specs/Epics/`.
- **Never write implementation code.** This skill produces the plan; `implement-epic` executes it.
- **Never leave a task whose completion cannot be checked.** If you cannot state how a reviewer would know it is done, the task is not specified yet.
- **Never propose a new runtime dependency without an ADR and a question.** `CLAUDE.md` requires asking; an ADR alone is not consent.
- If writing the spec reveals that a requirement from the brainstorm phase is wrong or contradictory, **report it and stop**. Do not quietly correct the requirements to fit a convenient implementation — that inverts the direction the whole process depends on.
