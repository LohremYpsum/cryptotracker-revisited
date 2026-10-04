---
name: github-pull-requests
description: "Apply this skill when the user asks to create a PR, open a pull request, or merge changes via GitHub. Covers: inspecting the current branch, checking for unpushed commits, pushing the branch, creating a PR with a descriptive title and body, and optionally setting it as a draft. Does NOT cover: force-pushing, rewriting history, reverting PRs, or merge conflict resolution."
license: MIT
---

# GitHub Pull Requests

This skill guides creating GitHub Pull Requests from the current branch in a structured, predictable way.

Adapted for this repository from the `cookiefactory/RPL-Replay-Reloaded` original: the base branch is
`master`, and the quality gate is the npm toolchain rather than PHP/DDEV.

## Phase 0: Pick the mode. Once per session.

**On the very first invocation in a session, ask which mode to run in.** Use `AskUserQuestion`, `header: "PR-Modus"`:

| Mode | Behaviour |
|---|---|
| **Interactive** (default) | Present the plan and **wait for confirmation** before every PR. The behaviour described in Phase 1. |
| **Queue** | Present the plan and **proceed without waiting**, as long as the plan is unambiguous. For runs that open several PRs back to back. |

Then **remember the answer for the rest of the session and do not ask again** — a mode question repeated per PR is the exact cost Queue mode exists to remove. Say which mode is active in the first plan you print, so the user can see what they chose taking effect.

Skip the question when the mode is already fixed: the user named it in their request. A single one-off PR outside any run stays Interactive; there is nothing to batch.

### What Queue mode does not change

Queue mode removes the *wait*, never the *plan* and never a safety check. In Queue mode you still:

- print the full plan — base, head, title, body, draft status — **before** creating the PR, so the transcript records what was decided;
- run every Phase 1 check: the dirty-worktree guard in step 3, the unpushed-commit check, the target-branch determination;
- **fall back to asking for that one PR** whenever the plan is *not* unambiguous. Concretely: the current branch is the target branch, the worktree is dirty, the target branch is anything other than `master`, or the gate was requested and failed. Ambiguity is the trigger to stop, and Queue mode does not suppress it.

So Queue mode is "don't ask me again about the routine ones", not "don't ask me anything".

## Phase 1: Plan

Before running any commands, gather context:

1. **Identify the current branch**
   ```bash
   git branch --show-current
   ```

2. **Check for uncommitted or unpushed changes**
   ```bash
   git status
   git log --oneline origin/master..HEAD
   ```

3. **Safety check — never PR from the target branch with dirty worktree.** If the current branch is the target branch (`master` by default) **and** there are uncommitted changes, **do not create a PR directly**. Present an options list via `AskUserQuestion`:
   - **Create a new branch** — the user types the desired branch name (e.g. `feat/describe-the-change`)
   - **Cancel the PR skill** — stop; do not create a branch or open a PR

   If the user chose to create a branch, ask a second question via `AskUserQuestion` about committing all changes:
   - **Commit all changes** — create the branch, stage everything, and commit, then continue with the PR plan:
     ```bash
     git checkout -b <branch-name>
     git add -A
     git commit -m "feat(scope): description"
     ```
   - **Cancel the PR skill** — stop; the skill is cancelled without creating a branch or opening a PR

   If the user cancels at any point, stop immediately.

   Also stop (no PR) when the current branch equals the target branch, even with a clean worktree — there is nothing to merge into itself.

   > This repository currently has only `master`. The guard will therefore fire on most
   > invocations — that is the intended behaviour, not a misconfiguration. Branch first.

4. **Determine the target branch** — `master` here, but confirm if the user specified otherwise.

5. **Formulate the PR plan** — present to the user:
   - Base branch (target)
   - Head branch (current)
   - Suggested title (conventional commit style)
   - Suggested body (bullet points of what changed, derived from the commits in the range)
   - **Interactive mode** — ask the user to choose via `AskUserQuestion`:
     - **Draft** — PR created as draft, not ready for review
     - **Ready for Review** — PR created ready for review
     - **Run gate & Draft** — run the quality gate first, then create as draft
     - **Run gate & Ready** — run the quality gate first, then create ready for review
   - **Queue mode** — print the same four-way choice as a stated decision rather than a question: name the option being taken and why, then continue. Default to **Draft** unless the caller passed a different draft status, and to no gate run unless the caller asked for one or the gate has not run.

> **Never skip the planning phase.** Always present the plan. In Interactive mode, wait for confirmation; in Queue mode, print it and proceed. Skipping the *plan* is never allowed in either mode — a PR whose title and base nobody stated is unreviewable.

## Phase 2: Execute

For each approved PR:

1. **Run the gate if requested** — if "Run gate & Draft" or "Run gate & Ready" was chosen:
   ```bash
   npm run lint && npm run build
   ```
   There is no test suite in this repository; `npm run build` runs `tsc` and is therefore the
   typecheck. `npm run lint` is configured with `--max-warnings 0`, so a single warning fails it.
   If either fails, stop and do not proceed — report the output. Do not create the PR with a red gate,
   and never make it pass by relaxing `--max-warnings` or deleting a rule.

2. **Push the branch if not already pushed**
   ```bash
   git push -u origin HEAD
   ```

3. **Create the PR** — add `--draft` flag if the user chose Draft or Run gate & Draft:
   ```bash
   gh pr create \
     --base master \
     --head {current-branch} \
     --title "type(scope): description" \
     --body "Summary of changes..." \
     --draft  # only if Draft or Run gate & Draft was chosen
   ```

4. **Confirm success** — print the PR URL from the command output.

## PR Title Conventions

| Type       | Usage                                      |
|------------|--------------------------------------------|
| `feat`     | A new feature                              |
| `fix`      | A bug fix                                  |
| `refactor` | Code restructuring without features/fixes  |
| `docs`     | Documentation only                         |
| `test`     | Adding or updating tests                   |
| `chore`    | Maintenance, dependencies, configuration   |
| `style`    | Code style / formatting                    |
| `perf`     | Performance improvements                   |

The original skill prepends a Jira ticket key extracted from the branch name. This repository has
no issue tracker wired up, so **there is no ticket to extract** — omit the bracketed prefix, and do
not treat a missing key as an ambiguity that blocks Queue mode. If a GitHub issue number is known,
reference it in the body (`Closes #12`) rather than the title.

## This repository

- **`--base master`**, remote `LohremYpsum/cryptotracker-revisited`. There is no
  `.github/pull_request_template.md`, so write the body inline with `--body`; a scratchpad file plus
  `--body-file` is only worth it for a long body.
- **No CI.** Nothing re-runs the gate after the push, which makes the Phase 2 step 1 gate the only
  check that ever runs. Prefer the "Run gate" options for anything beyond a doc tweak.
- **Commit message style.** The existing history uses plain descriptive English
  ("Added Mockup-Button for DetailsLink on Maintable"), not conventional commits. The
  conventional-commit format above applies to **PR titles**; do not rewrite existing commit
  messages to match, and follow `CLAUDE.md` for new commit messages.

## Common Pitfalls

- **Don't** guess the target branch — confirm with the user first
- **Don't** create a PR from the target branch (`master`) with uncommitted changes — offer the options list to create a branch and commit all changes, or cancel
- **Don't** force-push unless explicitly asked
- **Don't** create a PR with unpushed commits — push first
- **Don't** skip the plan — always present title, body, and draft status; for approval in Interactive mode, as a stated decision in Queue mode
- **Don't** ask for the mode more than once per session — Queue mode saves nothing if it is re-negotiated per PR
- **Don't** let Queue mode swallow an ambiguity — a dirty worktree, a PR from the target branch or a failing gate still stops that PR and asks
- **Don't** block on a missing ticket key — this repository has none by design
