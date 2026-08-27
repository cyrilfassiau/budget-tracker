# Budget Tracker

A personal account book that runs entirely in the browser — no backend, no account, no tracking. Built as a portfolio piece to show React + TypeScript fundamentals, state management, data visualisation and UI/UX craft.

It is deliberately **not** a dashboard. Two decisions drive the whole design:

- **It tells the truth about an unfinished month.** How much of the period has elapsed is a first-class value, so a budget at 27% on day 26 reads as *ahead of pace*, not as healthy. Period-over-period comparisons are cut to the same day, and the daily rate divides by days elapsed rather than days in the month.
- **It knows the difference between spending money and moving it.** A transfer to savings is its own entry type, excluded from income, expenses, budgets and the savings rate.

**[Live demo](#)** · _replace with your deployed URL_

![Home](docs/screenshots/home-dark.png)

---

## Features

### The register

- Create, edit and delete entries (amount, type, category, date, particulars)
- Three entry types — **paid out**, **paid in**, and **transfer** — separated by *column*, not by colour
- A running balance column, computed across all history rather than the visible page
- Validation that refuses zero/negative amounts, missing categories and — unless planning is on — future dates
- Scope to the period on screen or to all history; filter by search text, type, category and date range; sort by date or amount
- Paginated, resetting to page 1 whenever the filters or the period change
- Optimistic delete with an **Undo** action in the toast
- CSV import and export — export writes exactly the rows on screen, honouring the filters

### Categories

- Full CRUD with a colour and icon picker
- Drag to reorder, plus arrow buttons so reordering also works from the keyboard
- Deleting a category reassigns its transactions to **Uncategorized** rather than orphaning them
- Default categories are seeded on first run and protected from deletion

### Budgets

- A monthly limit per category, stored per `yyyy-MM` so history stays intact
- Pace bars with a **scheduled tick** at days-elapsed, so spend is read against the month rather than in isolation
- Overspend hatches back over the bar instead of saturating at 100%
- "Copy previous" to carry limits forward, which reports a no-op as a no-op rather than a success

### The statement

- An account summary the reader can follow down the column and check: brought forward → paid in → paid out → transferred → carried forward
- An **analysis of payments** table, ranked by amount with each category's share — chosen over a donut, which asks the reader to compare seven near-identical wedges to learn what a ranked column simply states
- Six periods of paid in against paid out, with the period still in progress **hatched** rather than drawn solid
- A period picker shared across the statement, register and budgets

### Polish

- Mobile-first responsive layout, verified at 375 / 768 / 1280 px, with the register collapsing to a single amount column on phones and direction moving onto a tag
- One navigation at every width — no band where the app has none and none where it has two
- Light ("sheet"), dark ("carbon") and system themes, applied before first paint so there is no flash
- Empty states for every list, and loading skeletons that mirror the real layout
- Toast notifications on every create / update / delete
- Confirm dialogs in front of destructive actions
- Focus-trapped dialogs, Escape to close, focus restored to the trigger, labelled inputs, live regions for toasts, and a skip link
- Confirm dialogs focus **Cancel**, never the destructive button; deleting everything requires typing the word and offers a backup export first

---

## Tech stack

| Concern          | Choice                        | Why                                                                   |
| ---------------- | ----------------------------- | --------------------------------------------------------------------- |
| Framework        | React 19 + TypeScript (strict) | No `any` anywhere; the domain model is the contract                    |
| Build            | Vite                          | Fast dev server, route-level code splitting out of the box             |
| Routing          | React Router                  | Five views with lazily loaded route chunks                             |
| State            | Zustand                       | Small, hook-first, no provider tree. See the note on Redux below       |
| Charts           | Recharts                      | Composable SVG charts that inherit the app's CSS custom properties     |
| Type             | Manrope                       | A geometric grotesque that holds up at 800 weight for the display balance |
| Styling          | Tailwind CSS v4               | Design tokens in CSS variables, so theming is one swap at `:root`      |
| Dates            | date-fns                      | Tree-shakeable, immutable, no global patching                          |
| Tests            | Vitest + React Testing Library | Same transform pipeline as the app; tests behaviour, not internals     |
| Persistence      | `localStorage`                | Wrapped in a data-access layer — see below                             |

**On Redux:** the state here is a handful of independent collections with no cross-cutting middleware needs, so Redux Toolkit's reducers, actions and store wiring would be ceremony without payoff. The stores are already organised as one slice per resource with async actions, so swapping in RTK (or TanStack Query, which is the better fit once a real API exists) would be a per-store change, not a rewrite.

---

## The data layer (the part worth talking about in an interview)

The app never touches `localStorage` directly. Reads and writes go through four layers, each with one job:

```
components  →  stores (Zustand)  →  services (async)  →  db/table  →  storage
   UI            client state        "the API"          persistence   browser
```

```
src/
  lib/
    storage.ts              # the ONLY module that calls localStorage
  services/
    db.ts                   # table() abstraction + seeding
    http.ts                 # simulated latency, ServiceError, defensive clone
    transactionsService.ts  # getAll, getById, create, update, remove, createMany
    categoriesService.ts    # + reorder
    budgetsService.ts       # upsert (unique per category+month), copyMonth
    settingsService.ts
  store/
    useTransactionsStore.ts # async actions, request status, optimistic delete
    useCategoriesStore.ts
    useBudgetsStore.ts
```

Three deliberate decisions:

1. **Every service function is `async`,** even though the storage call underneath is synchronous. Call sites already `await`, handle rejections and render pending states, so pointing these functions at `fetch` changes `src/services` and nothing else.

2. **Latency is simulated** (configurable in Settings, 320 ms by default). Loading skeletons and pending buttons are exercised in normal development rather than only appearing on a slow connection in production.

3. **Errors are typed.** Services throw `ServiceError` with a `code` (`not_found`, `conflict`, `validation`, `storage`) — the same shape an HTTP client would surface — and the UI turns those into toasts.

4. **Schema changes migrate, they do not re-seed.** Transfers were added after the first release, so a book written before them holds Savings entries typed as expenses. `migrate()` in `src/services/db.ts` retypes those in place and records a schema version, because re-seeding would fix the demo and destroy anyone's real data.

Business logic lives in `src/utils` (`calculations`, `filters`, `validation`, `csv`, `money`, `dates`) as pure functions, and `src/hooks/useDashboard.ts` memoises them into the shape the dashboard renders. Components stay presentational, and the maths is unit-tested without a DOM.

---

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173. A six-month demo dataset is seeded on first load; **Settings → Restore demo data** brings it back, and **Delete everything** clears it.

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server with HMR                   |
| `npm run build`     | Typecheck, then production build      |
| `npm run preview`   | Serve the production build            |
| `npm test`          | Run the test suite once               |
| `npm run test:watch`| Watch mode                            |
| `npm run typecheck` | TypeScript only                       |
| `npm run lint`      | oxlint                                |

## Tests

146 tests covering:

- **Utilities** — money parsing/formatting across locales, month and category aggregation, budget thresholds, filter/sort/pagination, form validation, CSV round-trips
- **The model** — transfers excluded from every total and from the savings rate, month pacing (a finished month is fully elapsed, a current one is not), the daily rate dividing by days elapsed, like-for-like period comparison, and the running balance computed chronologically regardless of display order
- **Services** — CRUD, persistence, `not_found` / `conflict` errors, category reassignment on delete, budget upsert semantics, and the schema migration (including that it never overwrites a kind the user chose)
- **Integration** — the full "record an entry" flow through form → store → service → register, asserting the *columns* rather than just the figure, plus edit, delete-with-confirmation and validation failures

The integration test earned its keep immediately: it caught the modal focus trap running a frame late, which let a fast typist's first keystrokes land in the wrong field.

```bash
npm test
```

## Deployment

The repo ships configs for both hosts, each with the SPA fallback client-side routing needs:

- **Vercel** — `vercel.json`; import the repo, defaults are correct
- **Netlify** — `netlify.toml`; build `npm run build`, publish `dist`

## Future improvements

- **Backend integration.** Replace the bodies of `src/services/*` with `fetch` calls against a REST or tRPC API — the signatures already match. Add TanStack Query for caching, retries and background refetching, and move the stores to UI-only state.
- **Accounts and sync**, so the data follows the user across devices instead of living in one browser.
- **Recurring transactions** — rent and salary materialised automatically each month.
- **Keyboard entry** — a shortcut to open the entry slip, "save and add another", and duplicate-last, which is what the hot path actually needs.
- **Multi-currency** with real conversion rates; the settings already separate currency from locale.
- **PDF export** of a monthly report.
- **Virtualised list** once transaction counts pass a few thousand rows.
- **E2E coverage** with Playwright for the flows that span pages.
