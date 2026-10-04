# Roadmap — cryptotracker-revisited

Status date: 2026-10-04. Conventions: `specs/README.md`.

This roadmap was derived from the defect list in `CLAUDE.md` ("Known rough edges") plus
the measured state of the quality gate. It is a **starting point**, not a committed plan —
rows are expected to change before each epic is brainstormed.

> **All six epics have shipped.** Measured on `master` at commit `e864940`:
> `npm run lint` clean, `npm run build` passing, `npm test` 107 passing. Every defect this
> roadmap was derived from is fixed. The epic rows and their problem statements are kept as
> the record of what was wrong and why it was done in this order.

## 1. Milestones

| ID | Name | Exit condition |
|---|---|---|
| **M0** | Green baseline | `npm run lint`, `npm run build` and `npm test` all green — **reached** |
| **M1** | Correct data layer | Coin data fetched once, errors renderable, charts render real per-chart data — **reached** |
| **M2** | Interactive features | Currency switch, pagination, search and a detail view work — **reached** |

## 2. Epics

| ID | Epic | Milestone | Status | Gate to start | Source defects |
|---|---|---|---|---|---|
| **E-00** | Green quality gate | M0 | **Done** | — | 6, 7 (partly) |
| **E-01** | Single source of truth for coin data | M1 | **Done** | E-00 | 3, 4, 8 |
| **E-02** | Correct chart data and lifecycle | M1 | **Done** | E-01 | 1, 2 |
| **E-03** | Currency switch and pagination | M2 | **Done** | E-01 | 5, 6 |
| **E-04** | Coin search | M2 | **Done** | E-01 | 7 |
| **E-05** | Coin detail view | M2 | **Done** | E-01 | 7 |

E-00 through E-04 shipped as individual pull requests without an epic document; only E-05
went through the full `brainstorm` → `write-spec` → `implement-epic` → `verify-epic` loop
and is therefore the only one with a file in `specs/Epics/done/`.

"Source defects" are the numbered entries under **Known rough edges** in `CLAUDE.md`.

## 3. Epic rows in detail

Each paragraph below is the **problem statement from before the work**, kept as the record
of what was wrong. All of them are now fixed; the present tense describes the repository as
it was when the roadmap was written, not as it is.

### E-00 — Green quality gate

**Shipped.** The gate is green: `npm run lint` clean, `npm run build` passing, `npm test`
107 passing.

Make all three gate commands pass, without weakening any rule. Measured when this row was
written, on a then-clean `master`:

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

**Blocked everything.** `verify-epic` cannot return `PASS` for any epic while the gate is red.

### E-01 — Single source of truth for coin data

**Shipped.** `App.tsx` holds the only `useCoins()` call, the dependency array is
`[count, page, currency]`, and `error` is a string rendered as text. **D-1 resolved:** the
state was lifted to `App` and passed down as props; no context and no TanStack Query.

`useCoins()` is currently called by both `App.tsx` and `TableOverview.tsx`, producing two
independent states and two requests for identical data against an API with a ~10–30
req/min limit. Plus: `isLoaded` sits in its own effect's dependency array, and `error` is
stored as an axios error object and rendered directly into JSX.

Owns the decision of *where* the state lives — lifting to `App` versus a context versus
adopting TanStack Query is an architecture decision for `write-spec`, not a foregone
conclusion.

### E-02 — Correct chart data and lifecycle

**Shipped.** `utils/chartData.ts` exports only the palette and `MAX_CHART_ENTRIES`; each
chart derives its labels and values from props via `useMemo` and returns `chart.destroy()`
from its effect cleanup.

`utils/chartData.ts` exports a single mutable object that all four charts import and
`push()` into on every effect run; they share `currencySymbols` and accumulate duplicates.
No chart instance is ever destroyed. Both defects are invisible on a first render and
obvious on the second.

Depends on E-01 because the fix is to derive chart data from props via `useMemo`, which
presumes the props are a trustworthy single source.

### E-03 — Currency switch and pagination

**Shipped.** `utils/currency.ts` maps the code to a symbol, `CurrencySwitch` and
`Pagination` are wired to the setters `useCoins` now returns.

`currency` holds the string `'eur'` but is evaluated as a boolean (`currency ? '€' : '$'`),
so the dollar branch is unreachable. `setCount`, `setPage` and `setCurrency` exist in
`useCoins` but are never returned. Wiring these is a feature, not a bug fix, and needs UI.

### E-04 — Coin search

**Shipped. D-3 resolved:** client-side filtering of the loaded page via
`utils/filterCoins.ts`, so typing costs no request.

`SearchBar` renders an uncontrolled input with no state and no handler. Owns the decision
between client-side filtering of the loaded page and a server-side query.

### E-05 — Coin detail view

**Shipped. D-2 resolved:** `react-router-dom` v7. The Details button links to `/coin/:id`,
and the page renders from the already-loaded coin. Full specification in
`specs/Epics/done/epic-e05-coin-detail-view.md`.

By the time this row was worked on, the Details button no longer pointed at
`toDo-coinDetails/<id>` as written below but at `coingecko.com` — an external link either
way, which is the defect the epic removed.

The Details button links to `toDo-coinDetails/<id>` with `isExternal`. Needs a routing
decision — the project has no router dependency today.

## 4. Dependencies

```
E-00 ──┬── E-01 ──┬── E-02
       │          ├── E-03
       │          ├── E-04
       │          └── E-05
```

E-02, E-03, E-04 and E-05 are independent of each other and may run in any order. All of
them have shipped; the graph is kept as the record of the order that was required.

## 5. Decisions

No decision is open.

| ID | Decision | Resolved as | Where it is recorded |
|---|---|---|---|
| **D-1** | State container for coin data: lift to `App`, React context, or TanStack Query | Lifted to `App`, passed down as props | `App.tsx` |
| **D-2** | Routing library for the detail view, or render the detail inline without one | `react-router-dom` v7 | ADR-E05-1 |
| **D-3** | Search is client-side over the loaded page, or a CoinGecko `/search` request | Client-side over the loaded page | `utils/filterCoins.ts` |

An epic whose blocking decision is unresolved may still be brainstormed as a planning
document — `brainstorm` will say so and ask before starting.

## 6. Housekeeping

- No CI exists. The gate runs only when a human or `verify-epic` runs it. Every measurement
  quoted in this file is therefore a snapshot, not a guarantee.
- **The AK convention is live.** E-05 was the first epic to ship tests naming their
  acceptance criteria; 31 `AK-E05-…` IDs appear as the first token of a test title in
  `src/`, which is what `verify-epic` greps for.
- `src/components/MainTable.test.tsx` predates the convention. Its E-05 tests carry AK IDs;
  the older ones (row rendering, ticker casing, currency symbols) deliberately do not — they
  are harness tests for behaviour no epic claimed.
- One acceptance criterion is knowingly unprovable: `AK-E05-N3.1` states that a test was
  rewritten rather than deleted, which is a property of the diff and not of any runtime
  behaviour. `verify-epic` will keep reporting it as `not proven` until a `brainstorm` cycle
  moves it out of the requirements and into the epic's definition of done.
