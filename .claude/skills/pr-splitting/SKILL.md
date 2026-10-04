---
name: pr-splitting
description: Cut a pile of pending or planned work into thematically separate, stacked pull requests — one concern per PR, each with its own conventional-commit type, in a dependency-correct order. Use before opening the first PR whenever more than one concern is in flight, when the working tree mixes unrelated changes, when asked how to split a change set, or when a PR body would need the word "and". Produces the cut, the order and the base branch per PR; github-pull-requests then opens each one.
---

# pr-splitting

Decide **how many pull requests a change set becomes, in what order, and off which base** — before the first branch exists. Running this after the work sits in one commit on one branch means untangling it by hand, which is the cost this skill exists to avoid.

This skill produces a plan. It does not open PRs — `github-pull-requests` does, once per planned PR.

## Input

```
/pr-splitting [<scope>]
```

`<scope>` is optional: a list of concerns, an epic ID, or nothing at all (then read the working tree and the roadmap).

## Step 1 — Inventory the concerns

List every distinct concern currently in flight. Sources, in order:

```bash
git status --short
git diff --stat HEAD
```

plus the epic's task list if this is epic work, plus `CLAUDE.md` §"Bekannte Baustellen" when the work touches a known defect.

For each concern record: **what changes**, **which files**, **which conventional-commit type**, and **what it depends on**.

## Step 2 — Apply the cut rules

These are the rules from `CLAUDE.md` §"PRs thematisch schneiden", which is the authority. Restated here with the reasoning, because a rule nobody understands gets worked around:

- **One PR = one conventional commit.** If the title needs an "and", it is two PRs. A title is the cheapest possible test of whether a change set is coherent, and it is reliable.
- **Group by shared cause, not by shared file.** The `initialChartData` singleton touches all four chart components — that is *one* refactor with one cause, so one PR. Two unrelated bugs in `useCoins.ts` share a file and nothing else, so two PRs. Reviewers reason about causes; the file layout is incidental.
- **Tests travel with the change they prove.** Never a trailing "add tests" PR. A PR whose behaviour change arrives without its test is unreviewable, and the test is the thing that makes the claim checkable.
- **Different type means different PR.** `fix`, `feat` and `chore` do not mix. Mechanical work — renames, formatting, dead-code removal — never rides along with a behavioural fix, because it inflates the diff and hides the one line that matters.

Apply them in that order. The first rule that splits a group, splits it.

## Step 3 — Order the stack

Fixed order, because each tier unblocks the next:

```
1. Docs & Tooling          (no behaviour change, lands first, shrinks every later diff)
2. Leaf fixes              (self-contained, no shared state moved)
3. Refactors moving state  (the ripple tier — everything above rebases on it)
4. Features                (built on the corrected foundation)
```

Within a tier, order by dependency. A concern that cannot be placed in a tier is usually two concerns.

## Step 4 — Stack the branches

PR *n* branches from PR *n−1* and **targets that branch**, not `master`. This is the point of the stack: each diff shows only its own change, so review effort scales with the change rather than with its position in the queue.

```bash
git switch -c <branch-1>                 # off master
# … work, commit …
git switch -c <branch-2>                 # off branch-1, not master
```

Each PR body states its stack position:

```markdown
**Stack:** 2 / 4 — based on #11, blocks #13
```

**Merge in stack order.** Merging out of order puts changes into `master` that the lower PR's diff claims are not there yet, and every branch above has to be rebased by hand.

Keep a stack to **5 PRs at most**. A sixth means the work splits into two consecutive stacks: ship and merge the first, then branch the second off the updated `master`.

## Step 5 — The gate, while `master` is red

`master` currently fails `npm run lint` and `npm run build` (see `CLAUDE.md` §"Befehle"). So the per-PR standard is **"no new errors"**, not "gate green":

1. Record the baseline counts before the first branch:
   ```bash
   npm run lint 2>&1 | tail -3
   npm run build 2>&1 | tail -20
   ```
2. For each PR, re-run and compare. Equal or fewer is acceptable; more is a blocker.
3. State the remaining pre-existing failures in the PR body, naming **which later PR clears them**. An unexplained red check gets normalized, and then a real failure goes unnoticed.
4. **The last PR in the stack must leave the gate green.** That is the stack's exit condition.

Never reach green by weakening the gate: no relaxed `--max-warnings`, no deleted rule, no `eslint-disable`, no `@ts-ignore`. Those convert a caught defect into an invisible one.

## Step 6 — Present the plan

```markdown
## PR-Schnitt — <scope>

| # | Titel | Typ | Dateien | Base | Räumt |
|---|---|---|---|---|---|
| 1 | docs: record the testing conventions | docs | CLAUDE.md, specs/ | master | — |
| 2 | fix(hooks): remove isLoaded from its own effect deps | fix | useCoins.ts | pr-1 | Baustelle 4 |
| 3 | refactor(charts): derive chart data from props | refactor | charts/*, chartData.ts | pr-2 | Baustelle 1, 2 |

**Baseline:** lint 11 errors / 4 warnings · build 8 TS6133
**Nach PR 3:** Gate grün
```

Then hand each row to `github-pull-requests`, in order. Queue mode there is the right choice for a stack of three or more.

## Hard rules

- **Never open the first PR before the cut is decided.** Splitting after the fact costs more than planning it.
- **Never merge a stack out of order**, and never rebase a lower branch without rebasing everything above it.
- **Never mix a mechanical change into a behavioural one**, however small the rename.
- **Never let a PR body say "and"** in its title. That is the signal to split, not to phrase it better.
- **Never make the gate green by weakening it.**
- This skill plans. It does not implement, and it does not open PRs.
