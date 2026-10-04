# E-05 — Coin detail view

| | |
|---|---|
| **Milestone** | M2 — Interactive features |
| **Status** | Specified — requirements and implementation plan complete, ready for `implement-epic` |
| **Gate to start** | E-01 — satisfied in the working tree (`App.tsx` owns the single `useCoins()` call and passes data down), although roadmap §2 still lists E-01 as *Not started* |
| **Blocked by** | **D-2** (roadmap §5, routing library for the detail view) — **resolved 2026-10-04: `react-router-dom`**, see Answer Log cycle 1 |
| **Source defects** | `CLAUDE.md` "Known rough edges" #7 (details button points at a placeholder / external page) |

## 1. Goal

A user who finds a coin in the overview table can open that coin's own page inside the
application and read its figures without the surrounding noise of nine other rows. Today
the Details button leaves the app entirely and lands on `coingecko.com`, which throws the
user out of the product they came to use and shows numbers in a currency the app did not
choose.

This epic adds a second route to what is currently a single-screen SPA. The detail page
renders from the coin data the overview already loaded — no second request against an API
that rate-limits at roughly 10–30 requests per minute — and returns the user to the
overview with the page, page size, currency and search term they left behind still intact.

## 2. Requirements

### FR-E05-1 — The Details control navigates inside the application

- **AK-E05-1.1** — The Details control of a table row renders as a link whose `href` is
  `/coin/<coin.id>`, e.g. `/coin/bitcoin` for the row showing Bitcoin.
- **AK-E05-1.2** — That link carries no `target="_blank"` and no `href` containing
  `coingecko.com`.
- **AK-E05-1.3** — Activating the Details control of a row renders the detail view for that
  coin; the overview table is no longer in the document afterwards.
- **AK-E05-1.4** — Activating the Details control issues no further `axios.get` call: the
  call count after navigation equals the call count before it.
- **AK-E05-1.5** — The Details link is not nested inside a `button` element — a nested
  anchor swallows the click (the defect the current `MainTable` test already guards against).

### FR-E05-2 — The detail view renders the selected coin's figures

- **AK-E05-2.1** — The detail view renders the coin's `name` and its `symbol` upper-cased.
- **AK-E05-2.2** — The detail view renders the coin's `image` with the coin's `name` as its
  accessible name (`alt`).
- **AK-E05-2.3** — The detail view renders `current_price`, `ath`, `market_cap`,
  `circulating_supply` and `total_volume`, each next to an English label.
- **AK-E05-2.4** — `current_price`, `ath`, `market_cap` and `total_volume` render with the
  symbol returned by `currencySymbol(currency)` from `src/utils/currency.ts` — the same
  helper the table uses — so with the currency set to `usd` the detail view renders `$` and
  not `€`.
- **AK-E05-2.5** — `circulating_supply` renders without any currency symbol; it is a coin
  count, not an amount of money.
- **AK-E05-2.6** — `ath_change_percentage` renders suffixed with `%`.
- **AK-E05-2.7** — The detail view renders the figures of the coin named in the URL
  segment: rendering `/coin/ethereum` with Bitcoin and Ethereum loaded shows Ethereum's
  `current_price`, not Bitcoin's.
- **AK-E05-2.8** — Switching the currency while the detail view is open re-renders its
  monetary figures with the new symbol, without leaving the detail route.

### FR-E05-3 — The user gets back to the overview

- **AK-E05-3.1** — The detail view renders a control labelled `Back to overview` whose
  `href` is `/`.
- **AK-E05-3.2** — Activating that control renders the overview table again.
- **AK-E05-3.3** — Returning to the overview issues no further `axios.get` call.
- **AK-E05-3.4** — Returning to the overview restores the page number, the page size and
  the currency that were active when the detail view was opened — a coin opened from page 3
  returns to page 3, not to page 1.

### FR-E05-4 — A coin that is not in the loaded data

The overview holds one page of coins, so an id outside that page cannot be resolved from
loaded data. The route says so rather than fetching it (Answer Log cycle 2, Q1).

- **AK-E05-4.1** — While the coin list request is in flight, `/coin/<id>` renders a loading
  indicator and not a "not available" message.
- **AK-E05-4.2** — Once the list has loaded and contains no coin with the requested `id`,
  the route renders an English message naming the requested id.
- **AK-E05-4.3** — That message is accompanied by the same `Back to overview` control
  described in AK-E05-3.1.
- **AK-E05-4.4** — When the coin list request failed, `/coin/<id>` renders the error string
  from `useCoins` as text — the same string the overview renders — and not a "not available"
  message.
- **AK-E05-4.5** — The "not available" route issues no `axios.get` call of its own beyond
  the one the coin list already makes.

### FR-E05-5 — The application shell spans both routes

`App` owns `useCoins()` and the search term and renders the shell; the overview and the
detail view are the two views inside it (Answer Log cycle 2, Q2). That is what makes
AK-E05-3.3 and AK-E05-3.4 structural rather than something to remember.

- **AK-E05-5.1** — Mounting the application at `/` renders the overview: navigation bar,
  table, pagination and all four charts.
- **AK-E05-5.2** — Mounting the application at `/coin/<id>` renders neither the overview
  table nor any of the four charts.
- **AK-E05-5.3** — Exactly one `axios.get` call is made for a mount at `/` followed by
  navigation to a coin and back again.
- **AK-E05-5.4** — Search, currency switch, pagination and dark-mode switch behave on `/`
  exactly as before this epic; their existing tests pass unchanged apart from the router
  wrapper the render helper now provides.
- **AK-E05-5.5** — On `/coin/<id>` the navigation bar still renders the currency switch and
  the dark-mode switch, and renders **no** search input (Answer Log cycle 3).
- **AK-E05-5.6** — A search term entered on `/` is still in the search input after opening a
  coin and returning to `/` — hiding the input does not clear the term.

### FR-E05-6 — The external reference survives on the detail page

The Details button was the app's only link to its data source; it moves rather than
disappears (Answer Log cycle 2, Q3).

- **AK-E05-6.1** — The detail view renders a link labelled `View on CoinGecko` whose `href`
  is `https://www.coingecko.com/en/coins/<coin.id>`.
- **AK-E05-6.2** — That link carries `target="_blank"` and a `rel` containing `noopener`.
- **AK-E05-6.3** — In the detail view's DOM order the `Back to overview` control precedes the
  `View on CoinGecko` link, so the in-app path is the one keyboard navigation reaches first.

## 3. Out of Scope

- **Richer coin data from `GET /coins/{id}`** (description, homepage links, 24 h high/low,
  price-change windows, sparkline). Deliberately excluded: it is a second request against a
  rate-limited API. No epic owns it today — it needs a new roadmap row if it is wanted.
- **A price chart on the detail page.** Chart work is owned by **E-02**, and the data such a
  chart would need is excluded above.
- **Resolving a coin that is outside the loaded page.** Excluded by the answer to Q1; the
  route states the limitation instead (FR-E05-4). No epic owns the single-coin fetch.
- **Correcting the stale status rows and the stale "the gate is red" baseline** in
  `specs/Roadmap/roadmap.md`, `specs/README.md` and `CLAUDE.md`. Those files are not written
  by this skill; the divergence is reported and their owner decides.
- **A catch-all 404 route for arbitrary unknown paths** such as `/nonsense`. This epic
  defines `/` and `/coin/:id` only; a general not-found route needs its own roadmap row.

## 4. Non-Functional Requirements

- **NFR-E05-1** — `react-router-dom` is the only new runtime dependency this epic adds.
  `CLAUDE.md` requires asking before adding one; it was asked and granted (Answer Log
  cycle 1).
- **NFR-E05-2** — The epic adds no network request. The only requests the application makes
  remain the ones `useCoins` already made: one per change of page, page size or currency.
  Navigating to a coin and back adds none.
- **NFR-E05-3** — All three gate commands stay green: `npm run lint` (`--max-warnings 0`),
  `npm run build` and `npm test`. The gate is green on `master` as of 2026-10-04, so this
  epic inherits a green gate and may not be the one that breaks it.
  - **AK-E05-N3.1** — The existing `MainTable` test asserting the CoinGecko `href` is
    **rewritten** to assert the new in-app target, never deleted — it also carries the guard
    against the nested-anchor defect (AK-E05-1.5).
- **NFR-E05-4** — The detail layout uses Chakra props and responsive array syntax
  (`direction={['column', 'row']}`); no fixed pixel widths and no custom CSS file.
- **NFR-E05-5** — Every user-facing string this epic adds is English.

## 5. Key Workflows

### W1 — Open a coin and come back

1. The user is on `/`, page 2, currency `usd`, search term `eth`.
2. The user activates **Details** in the Ethereum row.
3. The application renders `/coin/ethereum` with Ethereum's figures in `$`.
4. No request is sent.
5. The user activates **Back to overview**.
6. The application renders `/` again — page 2, currency `usd`, search term `eth` — and still
   no request is sent.

### W2 — Open a detail URL directly

1. The user opens `/coin/bitcoin` in a fresh tab.
2. The application mounts, the coin list request starts, and the route renders its loading
   indicator.
3. The request resolves with the first page of coins.
4. Bitcoin is among them, so the route renders Bitcoin's figures.

### W3 — Open a detail URL for a coin outside the loaded page

1. The user opens `/coin/some-small-token` in a fresh tab.
2. The list request resolves with the first ten coins by market cap; the requested id is not
   among them.
3. The route renders the "not available" message naming `some-small-token`, plus the back
   control.

### W4 — Follow the reference to the data source

1. The user is on `/coin/bitcoin`.
2. The user activates **View on CoinGecko**.
3. The browser opens `https://www.coingecko.com/en/coins/bitcoin` in a new tab; the
   application stays on `/coin/bitcoin` in the original tab.

## 6. Edge Cases

| Case | Required behaviour |
|---|---|
| `/coin/<id>` while the list request is in flight | Loading indicator (AK-E05-4.1) |
| `/coin/<id>` for an id outside the loaded page | "Not available" message naming the id (AK-E05-4.2) |
| `/coin/<id>` after the list request failed | The `useCoins` error string as text (AK-E05-4.4) |
| `/coin/` with an empty id segment | Falls through to the overview route; no blank detail page |
| Currency switched to `usd`, then a coin opened | Figures render with `$` (AK-E05-2.4) |
| Currency switched *while* the detail view is open | Figures relabel in place, route unchanged (AK-E05-2.8) |
| A search term is active when a coin is opened | The input is hidden on the detail route, the term survives and is back in the input on return (AK-E05-5.5, AK-E05-5.6) |
| Browser back button instead of the back control | Same result as AK-E05-3.2 — the overview, and no request |

## 7. Open Points

No requirement is blocked. Two bookkeeping items sit outside this document and are owned by
the user, not by a skill:

| Item | Blocks | Owner |
|---|---|---|
| Roadmap §5 still lists **D-2** as open; it was resolved on 2026-10-04 in favour of `react-router-dom` | Nothing — recorded here instead | user |
| Roadmap §2 lists E-00…E-04 as *Not started* and §3 / `specs/README.md` / `CLAUDE.md` describe a red gate; the working tree has a green gate and the Details button points at `coingecko.com`, not at `toDo-coinDetails/<id>` | Nothing in E-05 — `verify-epic` reads the gate itself | user |
| The edge-case row "`/coin/` with an empty id segment" has **no AK**. ADR-E05-7 implements it and T-E05-20 tests it, but with no `AK-E05-…` in its title `verify-epic` will not grep for it, so the behaviour is built and tested without being traceable. Closing this means `brainstorm` adding an AK under FR-E05-5 in a later cycle — `write-spec` may not add requirements | Nothing — the behaviour ships either way | user |

## 8. Architecture Decision Records

> Note on IDs: tasks in §9 are `T1…Tn`; test obligations in §10 are `T-E05-n` as defined in
> `specs/README.md`. They are different things despite both starting with `T`.

### ADR-E05-1 — `react-router-dom` v7 is the routing library

**Decision.** Add `react-router-dom@^7.18.4` as a runtime dependency and use its declarative
library API (`BrowserRouter`, `Routes`, `Route`, `Link`, `useParams`, `useLocation`,
`Navigate`). This resolves roadmap decision **D-2**; this skill cannot mark D-2 resolved in
the roadmap, and reports that it should be.

**Rationale.** FR-E05-1 requires the Details control to be a real link with an `href`, and
AK-E05-3.1 plus the browser-back edge case require real history entries. Both are routing
behaviour, not view state. v7 is the current major, its peer range is `react >=18` which the
project satisfies, and its library API is identical to v6's — adopting v6 would mean a
migration later for no present benefit.

| Rejected alternative | Why rejected |
|---|---|
| Inline view switch (`selectedCoinId` in `App` state) | No URL, no deep link, no browser back. Reverses D-2 (Answer Log cycle 1). |
| Hand-written hash routing (`hashchange` listener) | Gets URLs without a dependency, but the router becomes code this project maintains for the rest of its life. |
| `react-router-dom` v6.30.6 | Works identically for this epic, but is one major behind from day one. |
| v7 with `createBrowserRouter` / `RouterProvider` | Its `loader`/`action` surface is the reason to adopt it, and the data stays in `useCoins` by decision (NFR-E05-2), so the surface would go unused while tests would need `createMemoryRouter`. |
| `wouter` (~2 kB) | Smaller, and sufficient for two routes, but reverses D-2 and puts a niche library where the de-facto standard was chosen. |

**Consequences.**

- One new runtime dependency. `CLAUDE.md` requires asking before adding one; it was asked
  and granted (Answer Log cycle 1), and the version was chosen in cycle 4.
- The production bundle grows by roughly 20 kB gzipped on top of the current 221 kB. The
  build already prints Vite's "chunks larger than 500 kB" warning; that warning is a
  `console` notice, not a gate failure, and NFR-E05-3 stays satisfiable.
- `BrowserRouter` needs the host to serve `index.html` for unknown paths. Vite's dev server
  and `npm run preview` do this; a static host without a rewrite rule would 404 on a
  reloaded `/coin/bitcoin`. The project records no deployment target, so this is noted, not
  solved — `HashRouter` is the one-line fallback if a target without rewrites ever appears.

### ADR-E05-2 — Router at the root, route table inside `App`, data passed as element props

**Decision.** `main.tsx` wraps `<App />` in `<BrowserRouter>`. `App` keeps `useCoins()` and
the `searchTerm` state, renders `NavBar`, and below it a `<Routes>` block whose route
elements receive the data they need as ordinary props:

```
<Route path="/" element={<Overview coinsData={…} searchTerm={…} … />} />
<Route path="/coin/:id" element={<CoinDetail coinsData={…} currency={…} error={…} isLoaded={…} />} />
```

**Rationale.** FR-E05-5 requires one owner of the coin state above both routes, which is
what makes AK-E05-3.3, AK-E05-3.4 and AK-E05-5.3 hold by construction. Props are how this
codebase already moves that state (`App` → `TableOverview` → `MainTable`), and `CLAUDE.md`
states the rule directly: own state once and pass it down via props.

| Rejected alternative | Why rejected |
|---|---|
| `<Outlet context={…} />` + `useOutletContext()` | Leaner route table, but `useOutletContext` is untyped until typed by hand, and every page test then needs an outlet wrapper instead of plain props. |
| A dedicated `CoinDataProvider` context | Justified at more consumers; here it adds indirection for two, and another wrapper in every component test. |
| Each route calls `useCoins()` itself | Two states and a request per navigation — the defect E-01 removed, and a direct violation of NFR-E05-2. |

**Consequences.**

- `App.tsx` no longer renders the table and charts directly; that block moves to a page
  component (ADR-E05-3), otherwise the route element becomes unreadable.
- The `visibleCoins` `useMemo` over `filterCoins` moves with it into `Overview`, since
  filtering is an overview concern. `App` passes `coinsData` and `searchTerm`; the charts
  keep receiving the unfiltered list, exactly as today.
- `App` is inside the router, so it may call `useLocation()` (used by ADR-E05-5).

### ADR-E05-3 — Route-level components live in `src/pages/`

**Decision.** Create `src/pages/Overview.tsx` and `src/pages/CoinDetail.tsx`. Both are
default exports with their props interface directly above the component, and their tests sit
beside them (`src/pages/CoinDetail.test.tsx`), matching the convention in `CLAUDE.md`.

**Rationale.** A component that *is* a route is a different kind of thing from `MainTable` or
`Pagination`, which are pieces a route composes. Keeping the two kinds apart is what keeps
the route table in `App` readable at a glance.

| Rejected alternative | Why rejected |
|---|---|
| Keep both in `src/components/` | No new folder, but `components/` then mixes "a page" and "a cell renderer" at the same level with no signal which is which. |
| `src/routes/` | Same thing under a name that invites confusion with react-router's own `Route` objects. |
| Inline JSX fragments in the route table | No new files, but `App.tsx` ends up holding the whole overview again — the thing ADR-E05-2 moves out. |

**Consequences.** One new directory. The project-structure tree in `CLAUDE.md` is updated to
name it (T14), so the next contributor does not have to infer the convention.

### ADR-E05-4 — The detail view is split into a route component and a presentational one

**Decision.** `src/pages/CoinDetail.tsx` reads `useParams()`, looks the coin up in the
`coinsData` prop, and decides between the four states of FR-E05-4 (loading, error, not
available, found). The figures themselves render in `src/components/CoinSummary.tsx`, a
props-only component taking `{ coin, currency }`.

**Rationale.** This is the split the codebase already uses — `TableOverview` holds the error
branch, `MainTable` is props-only — and it is what makes AK-E05-2.1 through AK-E05-2.6
testable with `renderWithChakra` and no route at all.

| Rejected alternative | Why rejected |
|---|---|
| One component doing params, lookup, branching and layout | Fewer files, but every figure assertion then needs a URL and a matching `Route` to get at the markup. |
| `CoinSummary` reading the coin from context | Removes one prop and the testability that comes with it. |

**Consequences.** Two new components and two new test files. `CoinSummary` imports
`currencySymbol` from `src/utils/currency.ts` — the same helper `MainTable` uses, which is
what AK-E05-2.4 pins down.

### ADR-E05-5 — `NavBar` gains a `showSearch` prop; `App` derives it from the location

**Decision.** `NavBar` takes `showSearch: boolean` and renders the `SearchBar` block only
when it is true. `App` computes `const showSearch = useLocation().pathname === '/'` and
passes it down. `NavBar` itself calls no router hook.

**Rationale.** AK-E05-5.5 hides the search input on the detail route. `NavBar`, `SearchBar`
and `CurrencySwitch` are all props-only today; having `NavBar` reach for `useMatch` would
make the one presentational component in the bar route-aware and drag a router into any
future `NavBar` test for no gain.

| Rejected alternative | Why rejected |
|---|---|
| `NavBar` calls `useMatch('/coin/:id')` itself | Self-contained, but couples a presentational component to the route table and inverts the direction props flow everywhere else in this bar. |
| A separate reduced `NavBar` per route | Explicit, but duplicates the bar and remounts it on every navigation, so the dark-mode and currency controls lose their place. |
| Hide the search with CSS on the detail route | Leaves the input in the accessibility tree, so AK-E05-5.5 ("renders no search input") would be false while looking true. |

**Consequences.** `App` must stay inside the router for `useLocation()` — guaranteed by
ADR-E05-2. The search *term* remains in `App` state while the input is hidden, which is what
AK-E05-5.6 asserts.

### ADR-E05-6 — `renderWithChakra` also provides a `MemoryRouter`

**Decision.** Extend `src/test/renderWithChakra.tsx` so its wrapper is
`<ChakraProvider><MemoryRouter initialEntries={…}>{children}</MemoryRouter></ChakraProvider>`,
with a new optional `initialEntries?: string[]` option defaulting to `['/']`. The helper
keeps its name and its existing signature for every current caller.

**Rationale.** After T6 `MainTable` renders a `Link`, which throws outside a router context —
that breaks `MainTable.test.tsx`, `TableOverview.test.tsx` and `App.test.tsx` at once.
AK-E05-5.4 requires those suites to pass unchanged apart from the wrapper, and a default in
the shared helper is the only option that delivers that literally.

| Rejected alternative | Why rejected |
|---|---|
| A second helper `renderWithRouter` | Every test then picks, and picking wrong surfaces as a runtime throw rather than a type error. |
| `MemoryRouter` inline in each test file | Most explicit, but turns AK-E05-5.4's "unchanged apart from the wrapper" into a diff in every affected file. |
| `vi.mock('react-router-dom')` | Fast and isolated, and it abstracts away exactly the navigation that AK-E05-1.3, AK-E05-3.2 and AK-E05-5.3 exist to prove. |

**Consequences.** This is a **shared module with every component test as a consumer** — the
change is epic-wide, not local, and T2 is the task that must leave the existing 74 tests
green before anything else is touched. Tests that need a specific URL pass
`initialEntries: ['/coin/bitcoin']`; tests that do not, say nothing and get `/`.

### ADR-E05-7 — `/coin` without an id redirects to `/`

**Decision.** Add `<Route path="/coin" element={<Navigate to="/" replace />} />` next to the
two real routes. No catch-all `path="*"` route is added.

**Rationale.** The edge-case table requires `/coin/` to fall through to the overview rather
than render a blank detail page, while §3 excludes a general 404 route. One explicit route
for one known path satisfies both; `replace` keeps the dead URL out of the history so the
back button does not bounce the user between `/` and `/coin`.

| Rejected alternative | Why rejected |
|---|---|
| `<Route path="*" element={<Overview …/>} />` | Covers `/coin` and every typo, and is exactly the catch-all §3 puts out of scope. |
| No route at all for `/coin` | React Router renders nothing — a blank page under a navigation bar, which the edge-case row exists to prevent. |
| Render the "not available" message | Names an id the user never supplied, so the message would be a lie about what went wrong. |

**Consequences.** An unknown path such as `/nonsense` still renders nothing below the
navigation bar. That is the documented out-of-scope gap, not a defect of this ADR.

## 9. Granular Tasks

Executable order. Tasks that touch a module with several consumers are flagged; those are
epic-wide ripples, not local edits.

- [ ] **T1 — Add the dependency.** `npm install react-router-dom@^7.18.4` (ADR-E05-1).
      *Done when:* `package.json` lists it under `dependencies`, `package-lock.json` is
      updated, and `npm run build` and `npm test` are still green with no source change.
- [ ] **T2 — Teach `renderWithChakra` about the router.** ⚠️ **Shared module — every
      component test consumes it.** Wrap children in `MemoryRouter`, add the optional
      `initialEntries?: string[]` option defaulting to `['/']`, update the doc comment to say
      why the router is there (ADR-E05-6).
      *Done when:* all 74 existing tests pass with no edit to any test file.
- [ ] **T3 — Mount the router.** Wrap `<App />` in `<BrowserRouter>` in `src/main.tsx`,
      inside `ChakraProvider` (ADR-E05-2).
      *Done when:* `npm run dev` serves the unchanged app at `/`, and `npm run build` passes.
      `main.tsx` has no test; this is checked by running it.
- [ ] **T4 — Extract the overview page.** Create `src/pages/Overview.tsx` holding what
      `App.tsx` renders today below the navigation bar: the `Container`, `TableOverview` and
      the four chart `Stack`s. Move the `visibleCoins` `useMemo` over `filterCoins` into it;
      it takes `coinsData` and `searchTerm` and keeps handing the **unfiltered** list to the
      charts. `App` renders `<Overview …/>` in place of that block (ADR-E05-2, ADR-E05-3).
      *Done when:* the full suite passes unchanged — this task changes structure, not
      behaviour (AK-E05-5.1).
- [ ] **T5 — Rewrite the Details-link test.** In `src/components/MainTable.test.tsx` replace
      the CoinGecko assertions of `links the details button to the coin page on CoinGecko`
      with the obligations of T-E05-1, keeping the `closest('button')` guard. The test must
      **fail** at this point (AK-E05-N3.1).
- [ ] **T6 — Point the Details control at the app.** In `src/components/MainTable.tsx`,
      replace `<Button as={Link} href={…} isExternal>` with
      `<Button as={RouterLink} to={\`/coin/${singleEntry.id}\`}>`, importing
      `Link as RouterLink` from `react-router-dom`; drop the now-unused Chakra `Link`
      import (`noUnusedLocals` is on).
      *Done when:* T5's test passes (FR-E05-1).
- [ ] **T7 — Write the `CoinSummary` tests.** New `src/components/CoinSummary.test.tsx` with
      the obligations T-E05-2 … T-E05-4. All must fail for want of the component.
- [ ] **T8 — Implement `CoinSummary`.** New `src/components/CoinSummary.tsx`, props
      `{ coin: FetchCoins; currency: string }`, importing `FetchCoins` from
      `src/hooks/useCoins.ts` and `currencySymbol` from `src/utils/currency.ts` — no
      duplicate type, no second symbol map. Chakra layout, responsive array syntax, no fixed
      pixel widths (NFR-E05-4), English labels (NFR-E05-5).
      *Done when:* T7's tests pass (FR-E05-2).
- [ ] **T9 — Write the `CoinDetail` tests.** New `src/pages/CoinDetail.test.tsx` with the
      obligations T-E05-5 … T-E05-8, rendering
      `<Routes><Route path="/coin/:id" element={<CoinDetail …/>} /></Routes>` through
      `renderWithChakra` with `initialEntries`. All must fail for want of the component.
- [ ] **T10 — Implement `CoinDetail`.** New `src/pages/CoinDetail.tsx`: `useParams()` for the
      id, lookup in `coinsData`, then the four branches of FR-E05-4 in this order — `isLoaded`
      → Chakra `Spinner`; `error` → the error string as text; no match → the "not available"
      message naming the id; match → `CoinSummary`. `Back to overview` as
      `<Button as={RouterLink} to="/">` renders in every branch and **before** the
      `View on CoinGecko` link (AK-E05-6.3).
      *Done when:* T9's tests pass (FR-E05-4, FR-E05-6).
- [ ] **T11 — Wire the route table.** In `App.tsx` add `<Routes>` with `/` → `Overview`,
      `/coin/:id` → `CoinDetail`, and `/coin` → `<Navigate to="/" replace />`, passing the
      data as element props (ADR-E05-2, ADR-E05-7). Depends on T4 and T10 for both element
      types.
- [ ] **T12 — Hide the search on the detail route.** ⚠️ **`NavBar` has four call sites'
      worth of props already.** Add `showSearch: boolean` to `NavBarProps`, render the
      `SearchBar` `Box` only when true, and compute it in `App` as
      `useLocation().pathname === '/'` (ADR-E05-5).
      *Done when:* T-E05-16 passes (AK-E05-5.5).
- [ ] **T13 — Write the navigation tests.** Extend `src/App.test.tsx` with the obligations
      T-E05-9 … T-E05-17 and T-E05-20. These are the integration layer: they are written
      after T11 and T12 because they assert the assembled route table, not a unit.
- [ ] **T14 — Update `CLAUDE.md`.** Add `src/pages/` to the project-structure tree with a
      one-line description, and amend "Known rough edges" #7 so the details-button clause
      reads as resolved by E-05 while the `SearchBar` clause — already fixed by E-04 — is
      left to its own epic. **Do not touch** the "gate is red" baseline note; that is out of
      scope per §3.
- [ ] **T15 — Run the gate.** `npm run lint`, `npm run build`, `npm test`, all green
      (NFR-E05-3). Then `npm run dev` and walk W1 through W4 by hand, including a browser
      reload on `/coin/bitcoin` and the browser back button.

## 10. Test Obligations

Every obligation names the AK that must appear **as the first token of the test title**, per
`specs/README.md`; `verify-epic` greps for exactly that. Level is `component` throughout —
this epic adds no pure function and no hook.

| ID | Level | File | Assertion | AK in title |
|---|---|---|---|---|
| **T-E05-1** | component | `MainTable.test.tsx` | With two coins rendered, `getAllByRole('link', { name: 'Details' })` have `href` `/coin/bitcoin` and `/coin/ethereum`; neither has a `target` attribute; neither `href` contains `coingecko.com`; `closest('button')` is `null` for both | `AK-E05-1.1`, `AK-E05-1.2`, `AK-E05-1.5` |
| **T-E05-2** | component | `CoinSummary.test.tsx` | Renders `Bitcoin`, `BTC` (upper-cased, and `btc` absent), an `img` whose accessible name is `Bitcoin`, and an English label beside each of the five figures | `AK-E05-2.1`, `AK-E05-2.2`, `AK-E05-2.3` |
| **T-E05-3** | component | `CoinSummary.test.tsx` | For `currency` `eur` → `€`, `usd` → `$` with no `€` present, and `chf` → `CHF` (the fallback branch of `currencySymbol`), the four monetary figures carry the symbol and `circulating_supply` carries none | `AK-E05-2.4`, `AK-E05-2.5` |
| **T-E05-4** | component | `CoinSummary.test.tsx` | `ath_change_percentage` of `-16.6` renders with a `%` suffix | `AK-E05-2.6` |
| **T-E05-5** | component | `CoinDetail.test.tsx` | With Bitcoin and Ethereum in `coinsData` and `initialEntries: ['/coin/ethereum']`, Ethereum's `current_price` is in the document and Bitcoin's is not | `AK-E05-2.7` |
| **T-E05-6** | component | `CoinDetail.test.tsx` | Four separate cases: `isLoaded` → a `progressbar`/`status` role and no "not available" text; loaded without a match → a message containing the requested id; `error='Too many requests…'` → that exact string and no "not available" text; and in all of them `vi.spyOn(axios,'get')` records **zero** calls | `AK-E05-4.1`, `AK-E05-4.2`, `AK-E05-4.4`, `AK-E05-4.5` |
| **T-E05-7** | component | `CoinDetail.test.tsx` | `getByRole('link', { name: 'Back to overview' })` has `href` `/` — asserted both in the found case and in the "not available" case | `AK-E05-3.1`, `AK-E05-4.3` |
| **T-E05-8** | component | `CoinDetail.test.tsx` | `View on CoinGecko` has `href` `https://www.coingecko.com/en/coins/bitcoin`, `target="_blank"`, a `rel` containing `noopener`; and in `getAllByRole('link')` the back control's index is lower than the external link's | `AK-E05-6.1`, `AK-E05-6.2`, `AK-E05-6.3` |
| **T-E05-9** | component | `App.test.tsx` | After the table renders, clicking the Bitcoin row's `Details`: the coin's figures appear, `queryByRole('table')` is `null`, and the `axios.get` call count equals its value before the click | `AK-E05-1.3`, `AK-E05-1.4` |
| **T-E05-10** | component | `App.test.tsx` | From the detail view, clicking `Back to overview` brings `role='table'` back, and the `axios.get` call count is unchanged again | `AK-E05-3.2`, `AK-E05-3.3` |
| **T-E05-11** | component | `App.test.tsx` | Set page size `25`, click `Next` to reach page 2, switch currency to `usd`, open a coin, go back: `Page 2` is displayed, the page-size select still reads `25 per page`, the currency select still reads `usd`, and no request was made by the navigation itself | `AK-E05-3.4` |
| **T-E05-12** | component | `App.test.tsx` | On `/coin/bitcoin`, changing the currency select to `usd` relabels the monetary figures to `$` while `Back to overview` is still in the document (the route did not change) | `AK-E05-2.8` |
| **T-E05-13** | component | `App.test.tsx` | Mounted at `/`: navigation bar, `role='table'`, the `Page 1` pagination text and all four chart titles are present — `chart.js/auto` mocked as the file already does | `AK-E05-5.1` |
| **T-E05-14** | component | `App.test.tsx` | Mounted at `/coin/bitcoin`: `queryByRole('table')` is `null` and none of the four chart titles is in the document | `AK-E05-5.2` |
| **T-E05-15** | component | `App.test.tsx` | Mount at `/`, navigate to a coin, navigate back: `axios.get` has been called exactly once in total | `AK-E05-5.3` |
| **T-E05-16** | component | `App.test.tsx` | On `/coin/bitcoin`, `queryByLabelText('Search coin')` is `null` while `getByLabelText('Display currency')` and the dark-mode control are present | `AK-E05-5.5` |
| **T-E05-17** | component | `App.test.tsx` | Type `eth` into the search, open a coin, return: the search input's value is still `eth` and the table is filtered as before | `AK-E05-5.6` |
| **T-E05-18** | regression | whole suite | The 74 tests present before this epic pass, with no edit other than the rewritten assertions in `MainTable.test.tsx` | `AK-E05-5.4` |
| **T-E05-19** | review | `MainTable.test.tsx` | The diff shows the CoinGecko assertions **replaced**, not the test deleted, and the nested-anchor guard still present. Not automatable — a reviewer checks the diff | `AK-E05-N3.1` |
| **T-E05-20** | component | `App.test.tsx` | Mounted at `/coin` (no id), the overview table renders. **This row has no AK** — see §7 | — |

## 11. Definition of Done

A reviewer can walk this list without reading the rest of the document.

- [ ] **User-visible outcome:** clicking **Details** in any table row opens that coin's own
      page inside the application, showing its name, logo, price, all-time high, ATH change,
      market cap, circulating supply and trading volume in the currency currently selected;
      **Back to overview** returns to the table with the same page, page size, currency and
      search term as before; and the page carries a secondary link to the coin on CoinGecko.
      No step in that walk sends a network request.
- [ ] `/coin/bitcoin` entered directly in the address bar loads the app and shows Bitcoin;
      `/coin/some-unlisted-token` shows a message naming that id plus the back control.
- [ ] `npm run lint` is clean at `--max-warnings 0`.
- [ ] `npm run build` passes `tsc` and the Vite build.
- [ ] `npm test` is green, and the count has grown by the obligations in §10 — no existing
      test deleted or weakened.
- [ ] Every AK in §2 and §4 appears as the first token of at least one test title; running
      `verify-epic` reports no AK as `not proven`.
- [ ] `react-router-dom` is the only dependency added, at `^7.18.4`.
- [ ] No `any`, no type assertion as a workaround, no `eslint-disable`, no `@ts-ignore`.
- [ ] New components follow the file conventions: one component per file, `PascalCase.tsx`,
      props interface directly above, destructuring in the signature, default export last.
- [ ] `CLAUDE.md` names `src/pages/` in its project-structure tree, and rough edge #7 reflects
      that the details button is fixed.
- [ ] All user-facing strings added by this epic are English.

## 12. Answer Log

### Cycle 1 — 2026-10-04

Three decisions were taken by the user before this document was drafted, in response to the
new requirement "clicking Details must open an in-app detail page instead of CoinGecko".

**D-2 (roadmap §5) — Routing library for the detail view, or render the detail inline
without one.**
Options offered: `react-router-dom` (new dependency, real URLs, deep links, browser back) /
an inline view switch held in state (no dependency, no URL) / hand-written hash routing (no
dependency, URLs, but own code to maintain).
**Chosen: `react-router-dom`.** Rationale: the detail view is a page, not a mode; real URLs
make it bookmarkable and keep the browser back button working, and the dependency was
explicitly granted under `CLAUDE.md`'s "no new dependencies without asking". D-2 is therefore
**resolved** — roadmap §5 still lists it as open and needs updating by its owner.

**Data source for the detail page.**
Options offered: the already-loaded coin from the list / a `GET /coins/{id}` request for a
richer page / both combined.
**Chosen: the already-loaded coin.** Rationale: no additional request against a rate-limited
API and no second loading-and-error path. Became NFR-E05-2 and the premise of FR-E05-2; the
richer page is recorded under Out of Scope, and the consequence for deep links is what Q1
asked about.

**Process.**
Options offered: the full spec route (`brainstorm` → `write-spec` → `implement-epic` →
`verify-epic`) / implementing directly against a green gate.
**Chosen: the spec route**, which is why this document exists.

### Cycle 2 — 2026-10-04

**Q1 — What does `/coin/:id` do when the id is not in the loaded coin list?**
Options offered:
A — render a "not available" message naming the id, with the back control *(recommended)*;
B — fetch that one coin via `/coins/markets?ids=<id>&vs_currency=<cur>`;
C — redirect to `/`;
D — render the message now and record the single-coin fetch as its own roadmap row.
**Chosen: A.** Rationale: follows directly from the cycle-1 data-source decision and from
NFR-E05-2 — one component, no extra request, no second loading-and-error path. The accepted
cost is that a deep link to a coin outside the loaded page never resolves; that limitation is
now stated in FR-E05-4 and in Out of Scope rather than worked around. Option D would have
booked the single-coin fetch as a future roadmap row; choosing A over D means the limitation
is accepted, not scheduled.

**Q2 — Where does the router live, and what sits above the routes?**
Options offered:
A — `BrowserRouter` in `main.tsx`, `App` becomes the layout route owning `useCoins` and the
search term, overview and detail as child routes behind an `Outlet` *(recommended)*;
B — two sibling top-level routes, each calling `useCoins`;
C — no router, a `selectedCoinId` in state;
D — `HashRouter` instead of `BrowserRouter`.
**Chosen: A.** Rationale: keeps `CLAUDE.md`'s "own state once and pass it down via props",
and makes AK-E05-3.3 and AK-E05-3.4 hold by construction instead of by discipline — B would
have reintroduced the duplicate-request defect E-01 removed. Became FR-E05-5. The structural
consequence for the navigation bar is what Q4 now asks about.

**Q3 — What happens to the link to CoinGecko that the Details button replaces?**
Options offered:
A — a secondary `View on CoinGecko` link on the detail view *(recommended)*;
B — drop the link entirely;
C — keep both controls in every table row;
D — defer the external link.
**Chosen: A.** Rationale: the app keeps a path to its own data source without adding a second
control to an already wide table, and the link sits where a user who wants more detail is
already looking. Became FR-E05-6.

### Cycle 3 — 2026-10-04

**Q4 — What does the navigation bar show on the detail route?**
The layout-route structure chosen in Q2 keeps `NavBar` mounted on `/coin/:id`, which puts the
search input on a page with no table to filter, while the currency switch is the opposite
case — it demonstrably changes the figures there (AK-E05-2.8).
Options offered:
A — full navigation bar with the search input hidden on the detail route *(recommended)*;
B — navigation bar unchanged, search input visible on both routes;
C — search input visible and navigating back to the overview on the first keystroke;
D — a reduced bar on the detail route showing only the logo and the dark-mode switch.
**Chosen: A.** Rationale: a control that does nothing where it is shown (B) is worse than no
control, a keystroke that silently changes route (C) is a surprising side effect, and D would
have removed the currency switch exactly where AK-E05-2.8 needs it. The search *term* stays
in `App`'s state while the input is hidden, so returning to the overview restores it. Became
AK-E05-5.5 and AK-E05-5.6; the cost is one additional prop on `NavBar`.

### Cycle 4 — 2026-10-04 (`write-spec`)

**Q5 — Which `react-router-dom` major?**
Options offered: v7.18.4 (latest) *(recommended)* / v6.30.6 / v7 with the
`createBrowserRouter` data-router API / `wouter`.
**Chosen: v7.18.4.** Rationale: its library API is identical to v6's, its peer range
`react >=18` is satisfied, and taking v6 would book a migration for no present benefit.
Became **ADR-E05-1**.

**Q6 — How does the detail route receive `coinsData`, `currency` and the rest?**
Options offered: props on the route elements *(recommended)* / `Outlet` context /
a dedicated React context / the page calling `useCoins` itself.
**Chosen: props on the route elements.** Rationale: it is how this codebase already moves
state (`App` → `TableOverview` → `MainTable`) and what `CLAUDE.md` prescribes; the `Outlet`
mechanism sketched in cycle 2's Q2 option A was the one part of that option not carried
forward, and FR-E05-5 is satisfied either way since it constrains *where the state lives*,
not how it is handed over. Became **ADR-E05-2**.

**Q7 — How do the existing tests get a router?**
Options offered: `renderWithChakra` wraps a `MemoryRouter` too *(recommended)* / a second
`renderWithRouter` helper / `MemoryRouter` inline per test / mocking `react-router-dom`.
**Chosen: extend `renderWithChakra`.** Rationale: AK-E05-5.4 requires the existing suites to
pass unchanged apart from the wrapper, and only a default in the shared helper delivers that
literally; mocking the router would abstract away the navigation that AK-E05-1.3, AK-E05-3.2
and AK-E05-5.3 exist to prove. Became **ADR-E05-6**.
