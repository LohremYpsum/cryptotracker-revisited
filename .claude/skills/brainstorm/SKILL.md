---
name: brainstorm
description: Draft or refine the requirements half of an epic document from the roadmap, asking selectable multiple-choice questions to close requirement gaps and reconciling the answers into direct requirements. Use when starting a new epic, when asked to create or refine a PRD, when answering open questions on an epic, or when the user says "brainstorm epic E-0x". Operates on specs/Epics/ and stops when the completeness gate in this file is met.
---

# brainstorm

Produce the **requirements half** of an epic document, and iterate on it with the user until it is complete enough to hand to `write-spec`.

This skill never writes implementation steps, ADRs or data models. That is `write-spec`'s job. The boundary matters: requirements describe *what must be true*, and mixing in *how* it will be built makes both harder to review.

## Input

An epic identifier: `E-03`, `e03`, `epic-3`, or an epic name matching a row in `specs/Roadmap/roadmap.md` §2. If the argument is ambiguous or matches nothing, list the candidate rows and ask.

## Read before writing — in precedence order

1. `specs/Epics/*` — including the completed ones in `specs/Epics/done/`. Any epic **other than the one you were invoked for** is binding context: where it already decides something, it wins over everything below and over your own judgement.
2. `specs/README.md` — the ID scheme, the traceability convention and the hard rules.
3. `specs/Roadmap/roadmap.md` — the epic's row (§2), its detail paragraph (§3), its dependencies (§4), and any decision in §5 that blocks it.
4. `CLAUDE.md` — the stack's conventions and the "Bekannte Baustellen" list the roadmap rows were derived from.
5. **Sibling epics** already written — match their structure and tone rather than inventing a format.
6. The working tree, when a requirement touches existing code. A requirement that contradicts what is already built is worth flagging, not silently proposing.

## Phase detection

Determine which phase you are in **before** doing anything:

| State of `specs/Epics/epic-<id>-*.md` | Phase | Action |
|---|---|---|
| Does not exist | **Draft** | Write the requirements half, append open questions |
| Exists, has `## Open Questions` with no `[x]` marks | **Waiting** | Do not rewrite. Tell the user which questions are unanswered and stop |
| Exists, has `## Open Questions` with `[x]` marks | **Reconcile** | Fold answers into the body, move Q&A to the answer log, re-scan, ask again if needed |
| Exists, no open questions, gate met | **Complete** | Say so and point at `write-spec` |

## Draft phase

Write `specs/Epics/epic-<id>-<slug>.md` with these sections:

- **Header block** — Milestone, Status, Gate to start, Blocked by (any `D-n` from roadmap §5), Source defects
- **1. Goal** — what is delivered, and why it matters to a user of the app. Two paragraphs at most.
- **2. Requirements** — `FR-<id>-n` groups, each containing `AK-<id>-n.y` acceptance criteria
- **3. Out of Scope** — what this epic deliberately does not do, each line naming the epic that owns it instead
- **4. Non-Functional Requirements** — `NFR-<id>-n`, only those that genuinely apply
- **5. Key Workflows** — numbered step sequences for the main user paths
- **6. Edge Cases** — a table of case → required behaviour, once there are more than three
- **7. Open Questions** — the question block (see below), removed once answered
- **8. Answer Log** — append-only, one section per run cycle

### Writing acceptance criteria

An AK is testable or it is not an AK. Each one must be checkable by a single assertion or a single short test — see `specs/README.md` for what is assertable in this stack, in particular that Chart.js output is proven by mocking the constructor and asserting its config, never by inspecting canvas pixels.

- **Good:** `AK-E02-1.2` Unmounting a chart component calls `chart.destroy()` exactly once.
- **Bad:** `AK-E02-1.2` Charts should clean up properly.

Prefer stating the exact call count, the exact prop name, the exact boundary value. Vagueness here becomes ambiguity in `write-spec` and defects in `implement-epic`.

## Question protocol

Append unanswered questions in exactly this format so the user can select by typing one character:

```markdown
## Open Questions

### Q1 — Where does the coin data live after E-01?

Nothing in the roadmap decides this, and the choice determines whether every consumer
takes props or a hook, which changes the test surface of all four charts.

- [ ] **A — Lift to `App.tsx`, pass props down** *(recommended)* — smallest change, no new
      dependency, and `MainTable` already takes props. Matches `CLAUDE.md`'s "State einmal
      besitzen und per Props nach unten reichen".
- [ ] **B — React context provider** — no prop drilling, but adds a provider and makes every
      component test need a wrapper.
- [ ] **C — TanStack Query** — caching, dedupe and retry for free; a new runtime dependency
      and `CLAUDE.md` requires asking before adding one.
- [ ] **D — Keep two hook calls, add a module-level request cache** — least disruptive to the
      component tree, but keeps two independent states that can disagree.
```

Rules, all of them load-bearing:

- **Exactly four options.** If you have three, you have not thought of the deferral option. If you have five, two of them are the same option.
- **Exactly one marked `*(recommended)*`**, and the recommendation must follow from the roadmap, `CLAUDE.md` or a recorded decision — not from taste. Say which, in the option text.
- **Include the consequence**, not just the choice. The user is choosing an outcome, not a label.
- **Deferral is usually a legitimate option.** "Not in this epic, owned by E-nn" is frequently the right answer and the user should be able to pick it.
- **Only ask about high-impact gaps** — ones that change the component tree, the test surface, the dependency list, or the epic's scope. Do not ask about naming or formatting, or anything decidable from `CLAUDE.md`.
- **Five questions maximum per cycle.** More than that is not a brainstorm, it is a survey, and the answers get less considered as the list grows.

A question that maps onto an open decision in roadmap §5 must cite its `D-n` ID.

## Reconcile phase

1. Read each `[x]` selection, including any free-text the user added next to it.
2. **Rewrite the affected sections as direct statements.** The answer becomes the requirement. Do not write "as decided in Q1, the system should…" — write the AK.
3. Move the full question, its options and the chosen answer into `## Answer Log` under a new `### Cycle n — <date>` heading. Keep the rationale; it is the record of *why* the requirement reads the way it does.
4. Delete the answered questions from `## Open Questions`.
5. Re-scan the whole document for gaps the answers opened up. Answering one question routinely exposes the next. Ask again, up to five.
6. When the gate below is met, remove the `## Open Questions` section entirely and say the epic is ready for `write-spec`.

**Never** rewrite or condense the answer log. It is append-only, for the same reason an audit trail is.

## Completeness gate

Do not claim readiness until all four hold:

- [ ] Every `FR-<id>-n` has at least one `AK-<id>-n.y`
- [ ] No AK contains a TBD, a "to be decided", an "either/or", or a parenthetical guess
- [ ] Every remaining open point names what it **blocks** and who **owns** it
- [ ] Out of Scope names the owning epic for each excluded item

If a gap cannot be closed because it depends on an undecided `D-n`, that is fine — record it as an open point with its blocker and proceed. An epic can be complete while explicitly waiting on something.

## Hard rules

- **Never edit an epic other than the one you were invoked for.** You own exactly one file in `specs/Epics/`; every sibling is binding context. If a sibling needs changing, report it and let the user decide.
- **Never edit `specs/Roadmap/roadmap.md`.** If the epic's roadmap row is wrong, say so and let the user decide.
- **Never invent a requirement to fill a section.** An honestly short epic beats a padded one. If a section does not apply, omit it.
- **English only**, even when the conversation is German.
- If the roadmap marks this epic blocked by an unresolved `D-n`, say so and ask whether to proceed as a planning document before writing anything.
- **E-00 is special:** its requirements are the measured contents of the failing gate. Re-run `npm run lint` and `npm run build` and write the AKs against what they actually report now, not against the counts recorded in the roadmap, which may be stale.
