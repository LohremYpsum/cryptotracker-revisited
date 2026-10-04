---
name: implement-epic
description: Implement a fully specified epic end to end — analyze the spec, write tests from its acceptance criteria, implement task by task with a narrow check after each, then run verify-epic as the final gate and fix findings until it passes. Reports acceptance-criteria coverage as done/partly/not done. Use when asked to implement or build an epic.
---

# implement-epic

Execute a completed epic specification. Tests first, task by task, with the full QA gate at the end.

## Input

An epic identifier, same resolution as `brainstorm`.

## Step 0 — Preconditions. Refuse if unmet.

Check all four **before writing any code**. Each exists because proceeding without it wastes more time than the check costs:

1. **The epic file exists** and has both halves — requirements *and* granular tasks. If tasks are missing, stop and point at `write-spec`.
2. **No open questions or open architecture decisions remain.** An epic whose `D-2` blocks `T4` cannot start at T4.
3. **The epic's gate is satisfied.** Read its "Gate to start" header and roadmap §4. If E-02 requires E-01 complete, verify that before starting.

   **While `master` is red, record the baseline first** (`npm run lint`, `npm run build`) and say so in the plan. An epic other than E-00 may proceed on a red baseline, but it cannot reach `verify-epic PASS` until E-00 lands — the honest per-change standard until then is "no new errors", per `CLAUDE.md` §"Cutting PRs by concern". Report that limit up front rather than discovering it at Step 5.
4. **The working tree is clean**, or the user has said to proceed anyway. Mixing an epic implementation into unrelated uncommitted work makes the change unreviewable.

If a precondition fails, report precisely which and stop. Do not offer to work around it.

## Step 1 — Analyze

Read the epic document in full, then `specs/README.md`, `CLAUDE.md`, roadmap §3 for this epic, and the code each task touches.

Produce a short plan before acting: the task order you will follow, which existing patterns you will extend, and anything in the spec that looks wrong. **Raise concerns now**, not at task six.

If the spec contradicts the codebase, say so and stop. This happens, and it is information — often the spec is right and the code is wrong, which is the entire premise of E-00 through E-02.

## Step 2 — Decide the PR cut, then branch

Never implement an epic directly on `master`. The `github-pull-requests` skill expects a feature branch and will refuse to open a PR from the target branch.

**Decide the cut before the first edit, not at task six** — by then the commit history no longer allows it.

- The epic resolves to **one concern** → one branch, one PR:
  ```bash
  git switch -c feat/<epic-id>-<slug>
  ```
- The epic carries **more than one concern** — different conventional-commit types, or a title that would need an "and" — → invoke **`pr-splitting`** first. It returns the cut, the order and the base branch per PR; `github-pull-requests` then opens each one in that order.

An epic whose tasks refuse to group into at most 5 stacked PRs is too large. That is a finding about the epic, not a reason for a deeper stack — report it.

## Step 3 — Tests first, from the acceptance criteria

For each task, before implementing it:

1. Identify the `AK-<id>-n.y` the task serves and the `T-<id>-n` obligations covering them.
2. **Write those tests. Watch them fail.** A test that passes before the implementation exists is testing nothing — investigate rather than celebrating.
3. **Name the AK ID in the test title.** This is mandatory, not stylistic — it is the only traceability mechanism this stack has:

   ```ts
   it('AK-E02-1.2 — destroys the chart instance on unmount', () => { … })
   ```

   `verify-epic` greps for each AK ID and reports any with no match as `not proven`, even when the behaviour works and every test passes.

4. Follow the conventions in `specs/README.md`: `renderWithChakra` for anything rendering Chakra components, `renderHook` for hooks, and a mocked `chart.js/auto` for anything touching a chart — jsdom provides no 2D canvas context, so an unmocked chart test fails for the wrong reason.

## Step 4 — Implement

Work **one task at a time, in the spec's order.** Do not batch tasks; do not skip ahead because a later one looks easier.

Match the codebase's patterns rather than importing new ones — `CLAUDE.md` is the reference, and its "Known rough edges" list names the patterns that must **not** be copied.

**Lightweight check per task** — not the full gate:

```bash
npx vitest run <path-to-the-test-file-for-this-task>
```

That is deliberately narrow. The full suite, lint and build run once, at the end, through `verify-epic`. Running everything after every task wastes time and trains you to ignore the output.

Mark each task `[x]` in a **scratch note, not in the epic file.** See the hard rules.

Commit per task or per coherent group, referencing the requirement ID:

```
fix(charts): AK-E02-1.2 destroy chart instance on unmount
```

Note that this conflicts with the plain-descriptive style of the existing history. The reference convention wins for epic work because `verify-epic` and review depend on it; `CLAUDE.md` records the general style for everything else.

## Step 5 — Full QA gate

When every task is implemented, invoke **`verify-epic <epic-id>`**. Let it choose its own mode.

## Step 6 — Fix until it passes

`verify-epic` returns findings. For each, in severity order:

1. Fix the cause, not the symptom. A failing assertion changed to match wrong behaviour is not a fix.
2. Re-run the narrow check for that fix.
3. When all findings are addressed, **re-run `verify-epic` in full.** Fixes cause regressions; a partial re-check hides them.
4. Repeat until the verdict is `PASS`.

**If a finding cannot be fixed without changing the spec, stop and report.** Do not adjust the spec to match the implementation. Present the conflict and let the user decide.

Two cases are common and both tempt a bad fix:

- **`not proven` AKs** — the implementation is right, no test names the AK. The fix is the test title or the missing test, never marking it done.
- **A lint rule in the way** — the fix is the code, never an `eslint-disable` comment or a relaxed `--max-warnings`. An `exhaustive-deps` warning in a chart effect is defect 1 or 2 from `CLAUDE.md`, not noise.

## Step 7 — Report

```markdown
# implement-epic — <epic-id> <epic name>

**Verdict:** COMPLETE | INCOMPLETE   **verify-epic:** PASS | FAIL
**Branch:** feat/<epic-id>-<slug>   **PR:** #n | not opened

## Acceptance Criteria

| AK | Status | Proven by | Note |
|---|---|---|---|
| AK-E02-1.2 | done | T-E02-3 | |
| AK-E02-2.1 | partly | T-E02-5 | covers the doughnut charts; bar chart not |
| AK-E02-3.4 | not done | — | blocked by D-1, unresolved |

**Totals:** n done · n partly · n not done

## Tasks

Which completed, which did not, and why not.

## Deviations from the spec

Anything built differently than specified, with the reason. If empty, say so — an empty
list is a meaningful result.

## Spec problems found

Contradictions, gaps or errors discovered while implementing. **Reported, not fixed.**

## Follow-ups

Work this epic revealed but does not own, each with a suggested owning epic.
```

Report `partly` and `not done` honestly. An inflated report is worse than a short one, because it moves the discovery of missing work to whoever depends on it next.

## Hard rules

- **Never edit any file under `specs/`.** If implementation reveals a spec is wrong, report it precisely (section, requirement ID, what is wrong) and propose the correction. This includes ticking task checkboxes — track progress in your own notes.
- **Never mark an AK done without a passing test that names it.**
- **Never weaken a test to make it pass.** Changing an assertion to match observed behaviour converts a caught bug into a documented bug.
- **Never silence a lint rule** to get the gate green. `--max-warnings 0` is the gate, not an obstacle to it.
- **Never skip the `verify-epic` gate**, and never accept a caveated pass as a pass.
- **Never implement beyond the epic's scope.** Adjacent improvements go in the follow-ups section — this repository has eight known defects and it is tempting to fix the next one while nearby. Don't; it makes the change unreviewable and steals the next epic's content.
- **Never work on `master`.**
