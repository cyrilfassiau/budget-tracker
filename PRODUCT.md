# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: a person tracking their own money.** They open the app to answer one of three questions — "how is this month going?", "where did that money go?", and "am I about to blow a budget?". They enter transactions in small, repetitive bursts (a coffee, a shop, a fare), usually on a phone, usually within a day or two of spending. They are not an accountant and do not want a spreadsheet.

**Secondary: a frontend hiring manager or interviewer** evaluating the author's craft, typically in under two minutes, usually on a desktop, often by clicking three things and reading the README.

**Confirmed priority:** where the two conflict, the real user wins. The craft story belongs in the README, the code and the architecture — not surfaced inside the product UI.

## Product Purpose

A personal budget and expense tracker that runs entirely in the browser, with no account, no server, and no tracking. Success is a user who can log a transaction in seconds, and who trusts the numbers the app reports back to them.

It is also the author's portfolio piece for frontend developer applications, which sets a quality bar but — per the priority above — does not get to shape the interface.

## Positioning

Most client-side budget trackers are CRUD lists with a chart bolted on. This one commits to two things a generic dashboard cannot truthfully copy:

- **It tells the truth about an unfinished month.** Where you are in the month is a first-class concept, so a budget at 27% on day 26 reads as behind, not as healthy.
- **It knows the difference between spending money and moving it.** A transfer to savings is not an expense.

## Operating Context

- Data lives in one browser's `localStorage`. No sync, no account, no recovery if the user clears site data. The app must be honest about this.
- Entry is bursty and mobile-first; review is considered and often desktop.
- A six-month demo dataset is seeded on first run so the app is never empty on arrival.
- Money periods are calendar months. The month under inspection is shared state across surfaces.

## Capabilities and Constraints

**Confirmed functionality:** transaction CRUD with validation; filter by search/type/category/date range; sort by date or amount; pagination; category CRUD with colour, icon and manual ordering; per-category monthly budgets with progress and over-budget warning; balance, spending breakdown and six-month trend; month picker shared across Home, Transactions and Budgets; CSV import/export; light/dark/system theme; settings for currency and locale.

**Confirmed additions for this redesign:**
- A **transfer** transaction type, so moving money between one's own accounts is excluded from both income and expenses, and from the savings-rate calculation.
- **Month pacing**: days elapsed as a proportion of the month, driving budget progress, the current-month dashboard figures, and any period-over-period comparison (which must compare like-for-like day ranges).

**Technical constraints that must survive:**
- The async service layer in `src/services` and its `localStorage`-behind-an-API architecture, plus the existing test suite.
- Recharts as the charting library.
- Tailwind CSS v4 and the CSS-custom-property token system.
- The five-route structure: Home, Transactions, Budgets, Categories, Settings.
- React 19 + TypeScript strict + Vite. No `any`.

**Terminology:** income, expense, transfer, category, budget (a monthly limit per category), net balance, savings rate.

**Removed:** the "Simulated latency" user-facing setting. Artificial delay serves the reviewer at the real user's expense. The latency mechanism may remain in the service layer for development, but is not a product preference.

## Brand Commitments

No pre-existing brand, logo, or typeface. Name: **Budget Tracker**. Voice is plain and non-jargon — "Record money in or out", "Data lives in this browser only" — and that register is confirmed as correct and worth preserving.

**Pinned visual reference (standing preference).** The interface should sit alongside **Revolut** and read as a modern consumer banking app: flat surfaces, generously rounded cards, circular category avatars, a large display balance, pill controls, and a bottom sheet for entry. **No gradients anywhere** — an explicit constraint, including where the reference itself uses them.

**Explicitly rejected.** The editorial-ledger vocabulary of the previous build: hairline rules as the structural device, ruled column tables, uppercase letter-spaced micro-labels, monospace "stamp" text, square corners, and paper tints. The user identified this as a recognisable house style and does not want it here.

## Evidence on Hand

- A seeded six-month demo dataset (`src/lib/seed.ts`) — deterministic, plausible, clearly synthetic.
- No real user data, no customers, no testimonials, no benchmarks, no press. Future work must not fabricate any.
- Screenshots for the README are **not yet captured**; `docs/screenshots/` holds a placeholder listing the expected filenames.
- The live demo is not yet deployed; the README link is a placeholder.

## Product Principles

1. **Never flatter the user with an artefact of timing.** An unfinished month is labelled as unfinished; comparisons are like-for-like.
2. **Moving money is not spending it.** The model distinguishes transfers from expenses everywhere it reports a total.
3. **Entry is the hot path.** Logging a transaction is the most repeated action in the product and gets the shortest path, on phone first.
4. **Be honest about fragility.** Data lives in one browser; the interface says so plainly and protects destructive actions in proportion to what is lost.
5. **The craft shows in the work, not in claims about the work.** No architecture talk inside the product UI.

## Accessibility & Inclusion

WCAG 2.1 AA is the target. Established requirements: text contrast at 4.5:1; every flow completable by keyboard; visible focus; and no meaning carried by colour alone.

These were outstanding defects in the first build and must not regress: the muted-text tokens (now `--fg-muted` and `--fg-faint`) once measured 3.03:1, and colour once carried both category identity and budget status in the same element. In the current build category colour is identity, green means money arrived, and red is reserved for trouble.
