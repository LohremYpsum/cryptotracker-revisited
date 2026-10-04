# CLAUDE.md

Guidance for Claude Code in this repository.

## Language

**English is the mandatory primary language of this repository.** This is not a
preference and not a per-file choice — it applies to everything the repository
contains or produces:

| Artefact                                           | Language |
| -------------------------------------------------- | -------- |
| Code, identifiers, types, file names               | English  |
| Comments and docstrings                            | English  |
| Documentation (`CLAUDE.md`, `README.md`, `specs/`) | English  |
| Skills in `.claude/skills/`                        | English  |
| Commit messages                                    | English  |
| **Pull request titles and descriptions**           | English  |
| **User-facing UI strings and error messages**      | English  |

Pull request descriptions are English **always** — no exception for a quick draft, an
internal PR, or a body written in a hurry. A PR whose body is not English gets rewritten
before review, not merged and fixed afterwards.

The same rule governs new UI text: user-visible labels, headings and error messages are
written in English. Where German strings still exist they are legacy and get corrected
when the surrounding file is touched — see "Known rough edges".

## Project

Crypto tracker SPA: fetches market data from the CoinGecko API and presents it as a table
and as charts (doughnut/bar).

## Tech Stack

| Area       | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Build      | Vite 5, `@vitejs/plugin-react` (Babel)                |
| Language   | TypeScript 5 (`strict: true`), ESM                    |
| UI         | React 18 (function components + hooks)                |
| Components | Chakra UI v2 + Emotion + framer-motion                |
| Icons      | react-icons                                           |
| Charts     | Chart.js 4 (`chart.js/auto`, directly on canvas)      |
| HTTP       | axios                                                 |
| Tests      | Vitest 2 + Testing Library + jsdom                    |
| Lint       | ESLint 8 (`.eslintrc.cjs`, flat config is NOT active) |

## Commands

```bash
npm run dev         # dev server with HMR
npm run build       # tsc (typecheck) && vite build
npm run lint        # eslint . --ext ts,tsx --max-warnings 0
npm test            # vitest run
npm run test:watch  # vitest in watch mode
npm run preview     # serve the build locally
```

The gate is those three commands: `npm run lint`, `npm run build` and `npm test`.
`--max-warnings 0` means every warning fails the lint. There is **no CI** — the gate only
runs when somebody runs it.

> **As of 2026-10-04 the gate is green on `master`** (commit `e864940`): lint clean, build
> passing, 107 tests passing. E-00 fixed the red baseline that used to be recorded here.
> Since there is no CI, that is a snapshot of one tree — re-run the three commands rather
> than trusting this line.

## Project structure

```
src/
  main.tsx                 # entry: StrictMode > ChakraProvider > BrowserRouter > App
  App.tsx                  # shell: owns the coin state, renders NavBar + the route table
  hooks/useCoins.ts        # data fetching + FetchCoins interface
  utils/chartData.ts       # ChartData type + colour palette
  test/
    setup.ts               # jest-dom, cleanup, matchMedia stub for Chakra
    renderWithChakra.tsx   # render() inside ChakraProvider + MemoryRouter
  pages/                   # one route each, data arrives as props from App
    Overview.tsx           # '/' — table, pagination and the four charts
    CoinDetail.tsx         # '/coin/:id' — one coin, resolved from the loaded list
  components/
    MainTable.tsx          # presentational table (props only)
    TableOverview.tsx      # container for MainTable
    CoinSummary.tsx        # presentational figures of a single coin (props only)
    charts/                # one chart per file, each with its own canvas
    commons/               # NavBar, SearchBar, DarkModeSwitch, NavigationLogo
specs/                     # spec-driven development, see specs/README.md
  Roadmap/roadmap.md       # epics, milestones, dependencies, open decisions
  Epics/                   # one epic per file, done/ for completed ones
```

Tests live **next to** the file they test (`MainTable.tsx` → `MainTable.test.tsx`), not in
a separate tree. Only the helpers live in `src/test/`.

Conventions that apply here and should be preserved:

- One component per file, `PascalCase.tsx`, **default export** at the end of the file.
- Hooks as `useXyz.ts` in `src/hooks/`, likewise default export.
- Props interface directly above the component (`interface Props` or `interface XyzProps`).
- Destructuring in the signature: `const Chart = ({ cryptos, chartTitle }: Props) => {`.
- Shared types live where they originate (`FetchCoins` in `useCoins.ts`) and are imported
  from there — do not create duplicates.

## Best practices for this stack

### TypeScript

- `strict`, `noUnusedLocals` and `noUnusedParameters` are on: no dead variables and no
  unused parameters left behind — that breaks the build.
- **No `any`.** The code still contains `catch (error: any)`; new code uses
  `catch (error: unknown)` plus `axios.isAxiosError(error)` or `instanceof Error`.
- `isolatedModules` is active: import types with `import type { … }` when only the type is
  needed; use `export type` instead of `export` for pure type re-exports.
- No type assertions as a workaround (`as CustomColorModeContextType` in
  `DarkModeSwitch.tsx` is exactly that) — Chakra already provides correct types.
- Type API responses explicitly: `axios.get<FetchCoins[]>(…)`.

### React 18

- Function components and hooks only. Follow the Rules of Hooks —
  `eslint-plugin-react-hooks` is active.
- **Dependency arrays complete and free of values the effect sets itself.** In
  `useCoins.ts`, `isLoaded` sits in the array although the effect calls `setIsLoaded`: that
  is a loop and must not be copied.
- StrictMode mounts effects twice in dev. Every effect needs a correct cleanup function
  (abort the AbortController, destroy the chart, remove the listener).
- Compute derived values with `useMemo` instead of writing them into state or assembling
  them in an effect.
- The `key` when mapping is a stable ID from the data (`coin.id`), never the index.
- Own state once and pass it down via props. Right now `App.tsx` **and**
  `TableOverview.tsx` each call `useCoins()` — that is two independent states and two
  network requests for the same data. New consumers receive the data as props; if that gets
  too deep, introduce a context (or TanStack Query) instead of calling the hook again.

### Chart.js 4

- `chart.js/auto` registers all controllers automatically — if bundle size becomes a
  concern, use targeted `Chart.register(...)` instead.
- **Every chart instance has to be destroyed**, otherwise Chart.js throws "Canvas is
  already in use" on re-render. Pattern:

  ```ts
  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d')
    if (!ctx) return
    const chart = new Chart(ctx, config)
    return () => chart.destroy()
  }, [labels, values])
  ```

- **Always derive chart data fresh from the props** (`useMemo`), never push into a module
  object. `initialChartData` in `utils/chartData.ts` is a shared, mutable singleton; the
  charts push into it on every effect run, share `currencySymbols` and accumulate
  duplicates as a result. When working on the charts: use only `colorArray` as a constant
  and build the data arrays locally.
- Apply limits with `.slice(0, 15)`, not with a thrown `Error` as a loop break.
- Render the canvas inside a container with a defined height and set
  `options.maintainAspectRatio: false` instead of `width`/`height` on the element.

### Chakra UI v2

- Layout and spacing via Chakra props (`Stack`, `Flex`, `Box`, `spacing`, `padding`), not
  via custom CSS. `App.css`/`index.css` stay minimal.
- Responsive values in array syntax: `direction={['column', 'row']}`,
  `w={['100%', '600px']}`. Fixed pixel widths like `w='600px'` break on mobile — use
  responsive values for new layouts.
- Dark mode runs through `useColorMode`; resolve colour-dependent values with
  `useColorModeValue`, no hard-coded hex colours in components.
- Theme customisations belong in an `extendTheme` object passed to `ChakraProvider` — do
  not scatter them as inline overrides.

### Data fetching / axios

- Every request gets an `AbortController` whose `abort()` runs in the effect cleanup;
  `CanceledError` is caught and ignored (as `useCoins` does).
- Keep the error state as a `string` (or `Error`) and render it as text. An axios error
  object placed directly into JSX (`{error && <Text>{error}</Text>}`) crashes React.
- The CoinGecko free API has a tight rate limit (~10–30 requests/minute). Duplicate hook
  calls, missing dedupe and effect loops lead straight to HTTP 429 — another reason to load
  the data only once.
- Do not scatter the base URL and query parameters across components; they belong in the
  hook or in an axios instance.
- If an API key is ever added: read it via `import.meta.env.VITE_*`, `.env` stays untracked.
  Everything with a `VITE_` prefix ends up in the client bundle — no secrets belong there.

### Vite

- Include assets via an import (`import navLogo from '../../assets/NavLogo.webp'`) so they
  are hashed and bundled; `public/` only for files that must live at a fixed path.
- Access env exclusively via `import.meta.env`, never `process.env`.
- HMR fast refresh only works when a module file exports components exclusively
  (`react-refresh/only-export-components`) — put helper functions and constants in their
  own files.

### Tests (Vitest + Testing Library)

- `globals: true` is set — do **not** import `describe`/`it`/`expect`/`vi`. There is an
  ESLint override for test files that knows these globals.
- Render Chakra components with `renderWithChakra` from `src/test/renderWithChakra.tsx`,
  never with the bare `render` — otherwise the theme context is missing.
- Test hooks with `renderHook` from `@testing-library/react`.
- **Chart.js cannot be checked visually in jsdom.** jsdom has no 2D canvas context,
  `getContext('2d')` returns `null`. What is checkable is the configuration handed to
  Chart.js:

  ```ts
  vi.mock('chart.js/auto', () => ({ default: vi.fn(() => ({ destroy: vi.fn() })) }))
  ```

  Then assert on the constructor arguments — labels, datasets, type. That is where the
  defects sit, not in the pixels.
- Query by role and visible text (`getByRole`, `getByText`), not by CSS classes or test IDs.
  Chakra generates class names that cannot be relied upon.
- No assertion that only checks "rendered without an exception". That proves nothing and
  `verify-epic` reports it as `not proven`.

## Spec-driven development

Larger changes go through `specs/` and four skills in `.claude/skills/`:

```
roadmap line → /brainstorm E-0n → /write-spec E-0n → /implement-epic E-0n → /verify-epic E-0n
               (requirements)     (implementation plan) (tests first, then code)  (the gate)
```

`specs/README.md` is the binding convention: the ID scheme (`FR-`/`AK-`/`NFR-`/`ADR-`/`T-`),
traceability and the hard rules. The most important parts:

- Every acceptance criterion is proven by a test that **carries the AK ID in its title** —
  `it('AK-E02-1.2 — destroys the chart instance on unmount', …)`. That is the only
  traceability mechanism in this stack; `verify-epic` greps for it.
- Epic documents are written only by `brainstorm` and `write-spec`. `implement-epic` and
  `verify-epic` read and report, they never edit — not even task checkboxes.
- Never adapt a spec to the code, never weaken a test, never relax `--max-warnings`. A
  deviation is reported, not defined away.

For small changes (a typo, a colour, a dependency bump) the epic route is overhead — those
apply directly, with a green gate.

## Known rough edges

These points are documented deliberately so they are not copied as a model. Do not rebuild
them unasked in passing — but do straighten them out when working on the affected file:

1. `utils/chartData.ts` as a mutable data store shared by all charts.
2. Chart.js instances without `destroy()` in the cleanup.
3. `useCoins()` is called twice (`App.tsx` + `TableOverview.tsx`).
4. `isLoaded` in the dependency array of `useCoins`.
5. `currency` is the string `'eur'` but is evaluated as a boolean (`currency ? '€' : '$'`) —
   the dollar branch is dead.
6. `setCount` / `setPage` / `setCurrency` exist but are not returned — pagination and
   currency switching are not wired up.
7. `SearchBar` has no state. *(The second half of this entry — the details button linking
   out of the app — is resolved: E-05 made it an in-app link to `/coin/:id`.)*
8. `error` is rendered as an object.
9. Leftover German UI strings — `App.tsx` still passes the chart title
   `'ATH Veränderung in %'`. English is mandatory (see "Language"); correct such strings
   when touching the file.

## How to work here

- Adopt the existing patterns of neighbouring files (imports, naming, comment density)
  instead of introducing new styles.
- No new dependencies without asking — the stack is deliberately lean.
- After code changes: run `npm run lint`, `npm run build` and `npm test`.
- Commit messages in the style of the history: short, English, descriptive (e.g. "Added
  Mockup-Button for DetailsLink on Maintable"), and **without any tooling signature** — see
  "No tooling signatures".
- For pull requests there is the skill `.claude/skills/github-pull-requests/` — it governs
  the branch guard, the plan, the gate (`npm run lint && npm run build && npm test`) and
  `gh pr create` against `master`. PR titles there in conventional-commit form; that applies
  to PR titles only, not to commit messages. **The PR description is English, always** — see
  "Language".

## No tooling signatures

**Commits and pull requests in this repository carry no attribution to the tool that
produced them.** Two lines in particular are forbidden and must never be written:

```
Co-Authored-By: Claude <...>          ← never in a commit message
🤖 Generated with [Claude Code](...)  ← never in a PR body or commit message
```

This covers every variant, not just these two spellings: no `Co-Authored-By` trailer naming
an assistant or a bot, no "Generated with" / "Created by" / "Written by" footer, no robot
emoji sign-off, and no equivalent line in a PR title, a PR body, a commit subject, a commit
body, or a review comment.

The reason is authorship: the commit author and the PR author are the person who takes
responsibility for the change. A co-author trailer puts a second name on that record, and a
generation footer turns the body into advertising rather than a description of the change.
Neither helps a reviewer, and both outlive the session that created them.

This rule overrides any default behaviour of the tooling that suggests such a line. If the
harness proposes one, drop it before writing the message — it is not a required trailer, and
nothing downstream parses it.

A commit or PR that already carries one gets the line removed: strip it from the PR body
with `gh pr edit <n> --body-file <file>`. Removing it from a commit message means rewriting
history, which needs the author's explicit go-ahead — ask rather than force-push unasked.

## Cutting PRs by concern

As soon as more than one concern is in flight, apply the skill `.claude/skills/pr-splitting/`
**before** the first branch; it delivers the cut, the order and the base branch per PR, and
`github-pull-requests` then opens each individual PR. Short form of the rules that apply
here:

- **One PR = one conventional commit.** If the title needs an "and", it is two PRs. No
  collective PR that merges everything at once.
- What belongs together is what shares **one common cause** (the chart singleton affects all
  four chart files — still one refactor). What gets separated is what merely happens to share
  **the same file**: two unrelated bugs in `useCoins.ts` are two PRs.
- **Tests travel with the change** they secure — no trailing "add tests" PR.
- A different `type` (`fix` / `feat` / `chore`) means a different PR. Never mix mechanical
  work (rename, formatting, dead code) into a substantive fix.
- **Order:** docs & tooling → leaf fixes → refactors that move state → features. PRs are
  **stacked**: PR *n* branches from PR *n−1* and targets that branch so the diff shows only
  its own change. Write the stack position into the PR body and merge in stack order.
- **Red gate:** `master` is currently red (see "Known rough edges"). The standard per PR is
  therefore "no *new* errors", not "gate green"; the remaining pre-existing errors belong in
  the PR body together with a note on which later PR clears them. The last PR in the stack
  has to leave the gate green. Never reach green by relaxing `--max-warnings`, deleting a
  rule, or using `eslint-disable` or `@ts-ignore`.
