# CLAUDE.md

Leitfaden für Claude Code in diesem Repository.

## Projekt

Crypto-Tracker SPA: lädt Marktdaten von der CoinGecko-API und stellt sie als Tabelle
und als Charts (Doughnut/Bar) dar. UI-Sprache: Deutsch, Code/Bezeichner: Englisch.

## Tech Stack

| Bereich     | Technologie                                             |
| ----------- | ------------------------------------------------------- |
| Build       | Vite 5, `@vitejs/plugin-react` (Babel)                  |
| Sprache     | TypeScript 5 (`strict: true`), ESM                      |
| UI          | React 18 (Function Components + Hooks)                  |
| Komponenten | Chakra UI v2 + Emotion + framer-motion                  |
| Icons       | react-icons                                             |
| Charts      | Chart.js 4 (`chart.js/auto`, direkt auf Canvas)         |
| HTTP        | axios                                                   |
| Tests       | Vitest 2 + Testing Library + jsdom                      |
| Lint        | ESLint 8 (`.eslintrc.cjs`, Flat Config ist NICHT aktiv) |

## Befehle

```bash
npm run dev         # Dev-Server mit HMR
npm run build       # tsc (Typecheck) && vite build
npm run lint        # eslint . --ext ts,tsx --max-warnings 0
npm test            # vitest run
npm run test:watch  # vitest im Watch-Modus
npm run preview     # Build lokal servieren
```

Das Gate sind die drei Befehle `npm run lint`, `npm run build` und `npm test`.
`--max-warnings 0` heißt: jede Warnung bricht den Lint ab. Es gibt **keine CI** —
das Gate läuft nur, wenn es jemand ausführt.

> **Stand 2026-10-04: Das Gate ist rot, und zwar unverändert seit `master`.**
> `npm run build` bricht mit 8 × `TS6133` ab, `npm run lint` meldet 11 Fehler und
> 4 Warnungen. Das ist Altbestand, nicht Folge des Test-Setups. **Epic E-00 existiert
> genau dafür** und blockiert alle anderen Epics (`specs/Roadmap/roadmap.md`).

## Projektstruktur

```
src/
  main.tsx                 # Entry: StrictMode > ChakraProvider > App
  App.tsx                  # Layout, verteilt coinsData an die Charts
  hooks/useCoins.ts        # Datenabruf + FetchCoins-Interface
  utils/chartData.ts       # ChartData-Typ + Farbpalette
  test/
    setup.ts               # jest-dom, cleanup, matchMedia-Stub für Chakra
    renderWithChakra.tsx   # render() im ChakraProvider — für Komponententests
  components/
    MainTable.tsx          # Präsentations-Tabelle (nur Props)
    TableOverview.tsx      # Container für MainTable
    charts/                # Ein Chart pro Datei, je eigener Canvas
    commons/               # NavBar, SearchBar, DarkModeSwitch, NavigationLogo
specs/                     # Spec-Driven-Development, siehe specs/README.md
  Roadmap/roadmap.md       # Epics, Milestones, Abhängigkeiten, offene Entscheidungen
  Epics/                   # Ein Epic pro Datei, done/ für abgeschlossene
```

Tests liegen **neben** der getesteten Datei (`MainTable.tsx` → `MainTable.test.tsx`),
nicht in einem separaten Baum. Nur die Helfer liegen in `src/test/`.

Konventionen, die hier gelten und beibehalten werden sollen:

- Eine Komponente pro Datei, `PascalCase.tsx`, **Default Export** am Dateiende.
- Hooks als `useXyz.ts` in `src/hooks/`, ebenfalls Default Export.
- Props-Interface direkt über der Komponente (`interface Props` oder `interface XyzProps`).
- Destrukturierung in der Signatur: `const Chart = ({ cryptos, chartTitle }: Props) => {`.
- Geteilte Typen leben dort, wo sie entstehen (`FetchCoins` in `useCoins.ts`) und
  werden von dort importiert — keine Duplikate anlegen.

## Best Practices für diesen Stack

### TypeScript

- `strict`, `noUnusedLocals`, `noUnusedParameters` sind an: keine toten Variablen,
  keine ungenutzten Parameter stehen lassen — das bricht den Build.
- **Kein `any`.** Im Code existiert noch `catch (error: any)`; neuer Code nutzt
  `catch (error: unknown)` plus `axios.isAxiosError(error)` bzw. `instanceof Error`.
- `isolatedModules` ist aktiv: Typen mit `import type { … }` importieren, wenn nur
  der Typ gebraucht wird; `export type` statt `export` für reine Typ-Re-Exports.
- Keine Type-Assertions als Workaround (`as CustomColorModeContextType` in
  `DarkModeSwitch.tsx` ist genau das) — Chakra liefert bereits korrekte Typen.
- API-Responses explizit typisieren: `axios.get<FetchCoins[]>(…)`.

### React 18

- Nur Function Components und Hooks. Rules of Hooks einhalten —
  `eslint-plugin-react-hooks` ist aktiv.
- **Dependency-Arrays vollständig und frei von Werten, die der Effekt selbst setzt.**
  In `useCoins.ts` steht `isLoaded` im Array, obwohl der Effekt `setIsLoaded` aufruft:
  das ist eine Schleife und darf nicht kopiert werden.
- StrictMode mountet Effekte im Dev doppelt. Jeder Effekt braucht eine korrekte
  Cleanup-Funktion (AbortController abbrechen, Chart zerstören, Listener entfernen).
- Abgeleitete Werte mit `useMemo` berechnen, statt sie in einen State zu schreiben
  oder in einem Effekt zusammenzubauen.
- `key` beim Mapping ist eine stabile ID aus den Daten (`coin.id`), nie der Index.
- State einmal besitzen und per Props nach unten reichen. Aktuell rufen `App.tsx`
  **und** `TableOverview.tsx` jeweils `useCoins()` auf — das sind zwei unabhängige
  States und zwei Netzwerk-Requests für dieselben Daten. Neue Konsumenten bekommen
  die Daten als Props; wenn das zu tief wird, einen Context (oder TanStack Query)
  einführen, statt den Hook erneut aufzurufen.

### Chart.js 4

- `chart.js/auto` registriert alle Controller automatisch — wenn Bundle-Größe zum
  Thema wird, stattdessen gezielt `Chart.register(...)`.
- **Jede Chart-Instanz muss zerstört werden**, sonst wirft Chart.js beim
  Re-Render "Canvas is already in use". Muster:

  ```ts
  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d')
    if (!ctx) return
    const chart = new Chart(ctx, config)
    return () => chart.destroy()
  }, [labels, values])
  ```

- Chart-Daten **immer frisch aus den Props ableiten** (`useMemo`), niemals in ein
  Modul-Objekt pushen. `initialChartData` in `utils/chartData.ts` ist ein geteiltes,
  mutables Singleton; die Charts pushen bei jedem Effekt-Lauf hinein, teilen sich
  `currencySymbols` und sammeln dadurch Duplikate an. Bei Arbeit an den Charts:
  nur `colorArray` als Konstante nutzen, die Datenarrays lokal aufbauen.
- Obergrenzen über `.slice(0, 15)` ziehen, nicht über ein geworfenes `Error` als
  Schleifenabbruch.
- Canvas in einem Container mit definierter Höhe rendern und
  `options.maintainAspectRatio: false` setzen, statt `width`/`height` am Element.

### Chakra UI v2

- Layout und Spacing über Chakra-Props (`Stack`, `Flex`, `Box`, `spacing`, `padding`),
  nicht über eigenes CSS. `App.css`/`index.css` bleiben minimal.
- Responsive Werte als Array-Syntax: `direction={['column', 'row']}`,
  `w={['100%', '600px']}`. Feste Pixelbreiten wie `w='600px'` brechen auf Mobile —
  bei neuen Layouts responsive Werte verwenden.
- Dark Mode läuft über `useColorMode`; farbabhängige Werte mit `useColorModeValue`
  auflösen, keine hartkodierten Hex-Farben in Komponenten.
- Theme-Anpassungen gehören in ein `extendTheme`-Objekt, das an `ChakraProvider`
  übergeben wird — nicht als Inline-Overrides verstreuen.

### Datenabruf / axios

- Jeder Request bekommt einen `AbortController`, dessen `abort()` im Effekt-Cleanup
  läuft; `CanceledError` wird abgefangen und ignoriert (so macht es `useCoins`).
- Error-State als `string` (oder `Error`) halten und als Text rendern. Ein
  Axios-Error-Objekt direkt in JSX (`{error && <Text>{error}</Text>}`) lässt React
  abstürzen.
- Die CoinGecko-Free-API hat ein enges Rate-Limit (~10–30 Requests/Minute).
  Doppelte Hook-Aufrufe, fehlende Dedupe und Effekt-Schleifen führen direkt zu
  HTTP 429 — ein weiterer Grund, die Daten nur einmal zu laden.
- Base-URL und Query-Parameter nicht quer durch Komponenten streuen; sie gehören
  in den Hook bzw. in eine axios-Instanz.
- Falls je ein API-Key dazukommt: über `import.meta.env.VITE_*` einlesen, `.env`
  bleibt ungetrackt. Alles mit `VITE_`-Präfix landet im Client-Bundle — dort
  gehören keine Secrets hinein.

### Vite

- Assets über einen Import einbinden (`import navLogo from '../../assets/NavLogo.webp'`),
  damit sie gehasht und mitgebündelt werden; `public/` nur für Dateien, die unter
  festem Pfad liegen müssen.
- Env-Zugriff ausschließlich über `import.meta.env`, nie `process.env`.
- HMR-Fast-Refresh funktioniert nur, wenn eine Modul-Datei ausschließlich
  Komponenten exportiert (`react-refresh/only-export-components`) — Hilfsfunktionen
  und Konstanten in eigene Dateien legen.

## Bekannte Baustellen

Diese Punkte sind bewusst dokumentiert, damit sie nicht als Vorbild kopiert werden.
Nicht ungefragt im Vorbeigehen umbauen — beim Arbeiten an der betroffenen Datei
aber geradeziehen:

1. `utils/chartData.ts` als mutabler, von allen Charts geteilter Datenspeicher.
2. Chart.js-Instanzen ohne `destroy()` im Cleanup.
3. `useCoins()` wird doppelt aufgerufen (`App.tsx` + `TableOverview.tsx`).
4. `isLoaded` im Dependency-Array von `useCoins`.
5. `currency` ist der String `'eur'`, wird aber als Boolean ausgewertet
   (`currency ? '€' : '$'`) — der Dollar-Zweig ist tot.
6. `setCount` / `setPage` / `setCurrency` existieren, werden aber nicht
   zurückgegeben — Pagination und Währungswechsel sind nicht verdrahtet.
7. `SearchBar` hat keinen State; der Details-Button in `MainTable` verlinkt auf
   einen Platzhalterpfad (`toDo-coinDetails/:id`) mit `isExternal`.
8. `error` wird als Objekt gerendert.

## Arbeitsweise

- Vorhandene Muster der Nachbardateien übernehmen (Imports, Namensgebung,
  Kommentardichte) statt neue Stile einzuführen.
- Keine neuen Dependencies ohne Rückfrage — der Stack ist bewusst schlank.
- Nach Codeänderungen: `npm run lint` und `npm run build` laufen lassen.
- Commit-Messages im Stil der History: kurz, englisch, beschreibend
  (z. B. "Added Mockup-Button for DetailsLink on Maintable").
- Für Pull Requests gibt es die Skill `.claude/skills/github-pull-requests/` —
  sie regelt Branch-Guard, Plan, Gate (`npm run lint && npm run build`) und
  `gh pr create` gegen `master`. PR-Titel dort in Conventional-Commit-Form;
  das gilt nur für PR-Titel, nicht für Commit-Messages.

## PRs thematisch schneiden

Sobald mehr als ein Anliegen offen ist, **vor** dem ersten Branch die Skill
`.claude/skills/pr-splitting/` anwenden; sie liefert Schnitt, Reihenfolge und
Base-Branch, `github-pull-requests` öffnet danach jeden einzelnen PR. Kurzfassung
der Regeln, die hier gelten:

- **Ein PR = ein Conventional Commit.** Braucht der Titel ein „und", sind es zwei
  PRs. Kein Sammel-PR, der alles auf einmal merged.
- Zusammen gehört, was **eine gemeinsame Ursache** hat (der Chart-Singleton betrifft
  alle vier Chart-Dateien — trotzdem ein Refactor). Getrennt wird, was nur zufällig
  **dieselbe Datei** teilt: zwei unabhängige Bugs in `useCoins.ts` sind zwei PRs.
- **Tests reisen mit der Änderung**, die sie absichern — kein nachgelagerter
  „add tests"-PR.
- Unterschiedlicher `type` (`fix` / `feat` / `chore`) heißt unterschiedlicher PR.
  Mechanisches (Rename, Formatierung, toter Code) nie in einen inhaltlichen Fix mischen.
- **Reihenfolge:** Docs & Tooling → Leaf-Fixes → Refactors, die State verschieben →
  Features. PRs werden **gestapelt**: PR *n* zweigt von PR *n−1* ab und targetet
  dessen Branch, damit der Diff nur die eigene Änderung zeigt. Stack-Position in den
  PR-Body schreiben und in Stack-Reihenfolge mergen.
- **Roter Gate:** `master` ist aktuell rot (siehe „Bekannte Baustellen"). Maßstab pro
  PR ist deshalb „keine *neuen* Fehler", nicht „Gate grün"; die verbleibenden
  vorbestehenden Fehler gehören in den PR-Body samt Hinweis, welcher spätere PR sie
  räumt. Der letzte PR im Stack muss den Gate grün hinterlassen. Niemals grün machen
  durch `--max-warnings`-Aufweichen, Regel-Löschen, `eslint-disable` oder `@ts-ignore`.
