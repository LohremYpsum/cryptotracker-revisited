---
name: pr-splitting
description: "Apply this skill BEFORE creating pull requests whenever the pending work covers more than one concern — a dirty worktree with mixed changes, a batch of review findings, a refactor plus the bugfix that motivated it. Covers: slicing work into PRs that each map to exactly one Conventional Commit type+scope, ordering them into a dependency stack, choosing each PR's base branch, and handling a repository whose quality gate is already red. Does NOT cover: the mechanics of opening the PR itself — hand off to `github-pull-requests` for that."
license: MIT
---

# PR Splitting

One PR, one reason to exist. This skill decides **what goes in which PR and in what order**;
`github-pull-requests` then opens each one. Run this skill first, then that one per slice.

## The rule

> **If a PR's title needs an "and", it is two PRs.**

A PR that cannot be described by a single Conventional Commit subject line — one `type`, one
`scope`, one imperative description — is carrying more than one concern and must be split.
"Fix the fetch loop **and** the error rendering" is two bugs for two reasons; they get two PRs
even though both touch `useCoins.ts`.

Never open a single "here is everything I found" PR. A reviewer approving a 400-line mixed diff
is not reviewing it.

## Phase 1: Inventory the concerns

Before touching a branch, list every pending change as a one-line Conventional Commit subject.
Work from the actual diff and the actual findings, not from memory:

```bash
git status --short
git diff --stat
npm run lint 2>&1 | tail -40     # the gate's complaints are themselves a work inventory
npm run build 2>&1 | tail -40
```

Write the inventory out explicitly, e.g.:

```
fix(hooks):    isLoaded in dep array -> refetch loop
fix(hooks):    error state is an object, crashes React when rendered
feat(hooks):   setPage/setCount/setCurrency exist but are never returned
refactor(app): useCoins called twice -> two requests for the same data
fix(charts):   Chart instances never destroyed
chore:         dead NavigationLogo stub breaks tsc
```

Each line is one PR. If two lines have the same `type(scope)` **and** the same root cause, merge
them. If one line has two verbs, split it.

## Phase 2: Group — what belongs together

Put changes in the **same** PR when:

- They share one root cause. Fixing the shared mutable chart singleton necessarily touches all
  four chart files — that is one refactor, not four.
- One is mechanically required by the other. A dependency bump that a new tool needs ships with
  that tool; a rename ships with its call sites.
- A fix and its regression test. **Tests ride along with the change they cover** — never a
  trailing "add tests" PR for work already merged.

Put changes in **different** PRs when:

- The `type` differs (`fix` vs `feat` vs `chore`) — different types mean different review
  questions and different release-note lines.
- They are independently revertible. If reverting one would not require reverting the other,
  they were never one change.
- One is mechanical and one is semantic. Formatting, renames and import sorting drown a real
  fix; send them separately so the reviewer can skim one and read the other.
- They only share a *file*. Co-location is not a theme. Two unrelated bugs in `useCoins.ts` are
  two PRs.

## Phase 3: Order — build the stack

Sort the inventory so each PR only depends on PRs already in front of it:

1. **Docs and tooling first.** Guidelines, skills, test harness, lint config. They touch no
   product code, so they can never conflict with what follows and they unblock tests.
2. **Leaf fixes next** — changes contained in one module with no callers to update.
3. **Refactors that move state or change signatures after** their leaf fixes, so the fixes stay
   small diffs against unmoved code.
4. **Features last.** A feature on top of fixed foundations is a small diff; the same feature
   first drags the fixes into its own review.

### Base branches

Stack the branches. PR *n* is branched from and targets PR *n-1*'s branch, not `master`:

```bash
git checkout -b fix/second-thing          # while still on fix/first-thing
gh pr create --base fix/first-thing --head fix/second-thing ...
```

This keeps each PR's diff to **only its own change**. Branching every PR off `master` instead
makes PR 7 show the diff of PRs 2-7 together, which defeats the split.

State the base branch explicitly in every PR plan, and note the stack position in the PR body
(`Stacked on #12 — merge that first`). Merge in stack order. When GitHub auto-retargets a PR
after its base merges, verify the diff is still only that PR's change.

Branch off `master` directly only for a slice that is genuinely independent of everything else
in the batch — and say so in the plan.

## Phase 4: Handle a red gate honestly

A repository whose `npm run lint && npm run build` is **already failing on `master`** is common
and must not silently block the stack or get bulldozed into one giant green-it-all PR.

- Record the baseline failures **before** the first branch — count and list them.
- After each PR, re-run the gate and compare against that baseline. The bar per PR is
  **"introduces no new failures"**, not "gate is green".
- Put the remaining pre-existing failures in the PR body, naming which later PR in the stack
  clears each one. The reviewer then knows a red gate is expected, not a regression.
- The **last** PR in the stack must leave the gate green. If it does not, the inventory missed
  something — go back to Phase 1.
- Never make the gate pass by relaxing `--max-warnings`, deleting a rule, or adding
  `eslint-disable` / `@ts-ignore` to code you are not otherwise fixing.

## Phase 5: Hand off

For each slice, in stack order, invoke `github-pull-requests` with the base branch, head branch,
title and body this skill produced. Answer its Phase 0 mode question **once** — a batch of
stacked PRs is exactly the case Queue mode exists for — and let it run the gate and push.

## Writing the title

The PR title is a Conventional Commit subject: `type(scope): imperative description`, lower
case, no trailing period, under ~72 characters.

| Type | Use it when the PR... |
|---|---|
| `feat` | adds behaviour a user can observe |
| `fix` | makes existing behaviour correct |
| `refactor` | changes structure with no behaviour change |
| `perf` | makes it faster, same behaviour |
| `test` | adds or changes tests only |
| `docs` | changes documentation or guidelines only |
| `chore` | dependencies, config, tooling, dead-code removal |
| `style` | formatting only, no code meaning changed |

Scopes in this repository follow the source layout: `hooks`, `charts`, `table`, `commons`,
`app`, `ui`, `search`, `test`, `deps`. Omit the scope when a change is genuinely repo-wide.

Commit **messages** inside the branch stay in this repository's existing plain-English style per
`CLAUDE.md`; only the **PR title** is Conventional Commit form.

## Common pitfalls

- **Don't** open the "everything I found" PR — split it, even under time pressure.
- **Don't** let a shared file force unrelated changes together.
- **Don't** branch every PR off `master` when the work is sequential — stack it.
- **Don't** defer tests to a later PR; they ship with the change they cover.
- **Don't** mix a mechanical rename or reformat into a semantic fix.
- **Don't** report a red gate as success, and don't silence it to look green.
- **Don't** re-ask the PR mode per slice — decide once for the batch.
