# Roadmap — cryptotracker-revisited

Status date: 2026-10-04. Conventions: `specs/README.md`.

This roadmap was derived from the defect list in `CLAUDE.md` ("Bekannte Baustellen") plus
the measured state of the quality gate. It is a **starting point**, not a committed plan —
rows are expected to change before each epic is brainstormed.

## 1. Milestones

| ID | Name | Exit condition |
|---|---|---|
| **M0** | Green baseline | `npm run lint`, `npm run build` and `npm test` all green |
| **M1** | Correct data layer | Coin data fetched once, errors renderable, charts render real per-chart data |
| **M2** | Interactive features | Currency switch, pagination, search and a detail view work |

## 2. Epics

| ID | Epic | Milestone | Status | Gate to start | Source defects |
|---|---|---|---|---|---|
| **E-00** | Green quality gate | M0 | Not started | — | 6, 7 (partly) |
| **E-01** | Single source of truth for coin data | M1 | Not started | E-00 | 3, 4, 8 |
| **E-02** | Correct chart data and lifecycle | M1 | Not started | E-01 | 1, 2 |
| **E-03** | Currency switch and pagination | M2 | Not started | E-01 | 5, 6 |
| **E-04** | Coin search | M2 | Not started | E-01 | 7 |
| **E-05** | Coin detail view | M2 | Not started | E-01 | 7 |

"Source defects" are the numbered entries under **Bekannte Baustellen** in `CLAUDE.md`.

## 3. Epic rows in detail

### E-00 — Green quality gate

Make all three gate commands pass, without weakening any rule. Measured on 2026-10-04 on a
clean `master`:

- `npm run build` — 8 × `TS6133` (declared but never read) in `App.tsx`, `TableOverview.tsx`,
  `NavigationLogo.tsx`, `useCoins.ts`
- `npm run lint` — 11 errors (3 × unused var, 4 × `no-explicit-any` in the chart `catch`
  blocks, …) and 4 `react-hooks/exhaustive-deps` warnings

The unused-variable errors are symptoms of defects 3, 5 and 6, so E-00 must decide per case
whether to **remove** the dead binding or **wire it up**. Where wiring it up belongs to a
later epic, remove it and let that epic reintroduce it. The `exhaustive-deps` warnings must
not be silenced with an eslint-disable comment; they are defect 4 and belong to E-01 and
E-02 — E-00 may leave them as warnings only if the gate still passes, which it does not
today, so decide this in brainstorm.

**Blocks everything.** `verify-epic` cannot return `PASS` for any epic while the gate is red.

### E-01 — Single source of truth for coin data

`useCoins()` is currently called by both `App.tsx` and `TableOverview.tsx`, producing two
independent states and two requests for identical data against an API with a ~10–30
req/min limit. Plus: `isLoaded` sits in its own effect's dependency array, and `error` is
stored as an axios error object and rendered directly into JSX.

Owns the decision of *where* the state lives — lifting to `App` versus a context versus
adopting TanStack Query is an architecture decision for `write-spec`, not a foregone
conclusion.

### E-02 — Correct chart data and lifecycle

`utils/chartData.ts` exports a single mutable object that all four charts import and
`push()` into on every effect run; they share `currencySymbols` and accumulate duplicates.
No chart instance is ever destroyed. Both defects are invisible on a first render and
obvious on the second.

Depends on E-01 because the fix is to derive chart data from props via `useMemo`, which
presumes the props are a trustworthy single source.

### E-03 — Currency switch and pagination

`currency` holds the string `'eur'` but is evaluated as a boolean (`currency ? '€' : '$'`),
so the dollar branch is unreachable. `setCount`, `setPage` and `setCurrency` exist in
`useCoins` but are never returned. Wiring these is a feature, not a bug fix, and needs UI.

### E-04 — Coin search

`SearchBar` renders an uncontrolled input with no state and no handler. Owns the decision
between client-side filtering of the loaded page and a server-side query.

### E-05 — Coin detail view

The Details button links to `toDo-coinDetails/<id>` with `isExternal`. Needs a routing
decision — the project has no router dependency today.

## 4. Dependencies

```
E-00 ──┬── E-01 ──┬── E-02
       │          ├── E-03
       │          ├── E-04
       │          └── E-05
```

E-02, E-03, E-04 and E-05 are independent of each other and may run in any order.

## 5. Open decisions

| ID | Decision | Blocks | Owner |
|---|---|---|---|
| **D-1** | State container for coin data: lift to `App`, React context, or TanStack Query | E-01 | user |
| **D-2** | Routing library for the detail view, or render the detail inline without one | E-05 | user |
| **D-3** | Search is client-side over the loaded page, or a CoinGecko `/search` request | E-04 | user |

An epic whose blocking decision is unresolved may still be brainstormed as a planning
document — `brainstorm` will say so and ask before starting.

## 6. Housekeeping

- No CI exists. The gate runs only when a human or `verify-epic` runs it.
- No `FR-`, `AK-` or `T-` reference exists anywhere in `src/` yet. The first epic to ship
  tests establishes the convention from `specs/README.md`.
- `src/components/MainTable.test.tsx` predates the convention and carries no AK IDs; it is
  a harness smoke test, and E-00 or E-01 should either annotate it or state that it stays
  unannotated on purpose.
