# Budget Tracker

A personal budget and expense tracker that runs entirely in the browser — no backend, no account, no tracking. Built as a portfolio piece to show React + TypeScript fundamentals, state management, data visualisation and UI/UX craft.

**[Live demo](#)** · _replace with your deployed URL_

![Dashboard](docs/screenshots/dashboard-light.png)

---

## Features

### Transactions

- Create, edit and delete transactions (amount, type, category, date, note)
- Validation that refuses zero/negative amounts, missing categories and — unless planning mode is on — future dates
- Filter by search text, type, category and date range; sort by date or amount
- Paginated list that resets to page 1 whenever the filters change
- Optimistic delete with an **Undo** action in the toast
- CSV import and export, with per-row error reporting instead of an all-or-nothing failure

### Categories

- Full CRUD with a colour and icon picker
- Drag to reorder, plus arrow buttons so reordering also works from the keyboard
- Deleting a category reassigns its transactions to **Uncategorized** rather than orphaning them
- Default categories are seeded on first run and protected from deletion

### Budgets

- A monthly limit per category, stored per `yyyy-MM` so history stays intact
- Progress bars that warn at 80% and highlight when you go over
- "Copy last month" to carry limits forward

### Dashboard

- Summary cards: income, expenses, net balance and savings rate, each with a month-over-month delta
- Donut chart of spending by category, with small categories collapsed into "Other"
- Combined bar + line chart of income vs. expenses over the last six months
- Budget progress and recent activity at a glance
- A month picker shared across the dashboard and budgets pages

### Polish

- Mobile-first responsive layout, verified at 375 / 768 / 1280 px
- Light, dark and system themes, applied before first paint so there is no flash
- Empty states for every list, and loading skeletons that mirror the real layout
- Toast notifications on every create / update / delete
- Confirm dialogs in front of destructive actions
- Focus-trapped dialogs, Escape to close, focus restored to the trigger, labelled inputs, live regions for toasts, and a skip link

---

## Tech stack

| Concern          | Choice                        | Why                                                                   |
| ---------------- | ----------------------------- | --------------------------------------------------------------------- |
| Framework        | React 19 + TypeScript (strict) | No `any` anywhere; the domain model is the contract                    |
| Build            | Vite                          | Fast dev server, route-level code splitting out of the box             |
| Routing          | React Router                  | Five views with lazily loaded route chunks                             |
| State            | Zustand                       | Small, hook-first, no provider tree. See the note on Redux below       |
| Charts           | Recharts                      | Composable SVG charts that inherit the app's CSS custom properties     |
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

115 tests covering:

- **Utilities** — money parsing/formatting across locales, month and category aggregation, budget thresholds, filter/sort/pagination, form validation, CSV round-trips
- **Services** — CRUD, persistence, `not_found` / `conflict` errors, category reassignment on delete, budget upsert semantics
- **Integration** — the full "add a transaction" flow through form → store → service → list, plus edit, delete-with-confirmation and validation failures

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
- **Multi-currency** with real conversion rates; the settings already separate currency from locale.
- **PDF export** of a monthly report.
- **Virtualised list** once transaction counts pass a few thousand rows.
- **E2E coverage** with Playwright for the flows that span pages.
