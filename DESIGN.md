---
name: Budget Tracker
description: An account book, not a dashboard — two inks on cheque safety stock, ruled columns instead of cards.
colors:
  paper: "#e9eee4"
  sheet: "#fbfcf9"
  sheet-alt: "#f3f6ef"
  rule: "#c2ccbd"
  rule-strong: "#9aa795"
  perforation: "#d5ddcf"
  ink: "#12161c"
  ink-2: "#4a5560"
  ink-3: "#5f6a75"
  carbon: "#2f3b8c"
  carbon-2: "#4d59b0"
  carbon-tint: "#dee2f4"
  red: "#a8231c"
  red-tint: "#f7e3e1"
  paper-dark: "#0f1116"
  sheet-dark: "#171a21"
  sheet-alt-dark: "#1d212a"
  rule-dark: "#2b313c"
  rule-strong-dark: "#414958"
  perforation-dark: "#232833"
  ink-dark: "#e6e9e2"
  ink-2-dark: "#a8b0ba"
  ink-3-dark: "#8f97a2"
  carbon-dark: "#9aa2f2"
  carbon-2-dark: "#b3b9f7"
  carbon-tint-dark: "#232741"
  red-dark: "#f08b82"
  red-tint-dark: "#331b1c"
typography:
  display:
    fontFamily: "Archivo Narrow, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum lnum"
  headline:
    fontFamily: "Archivo Narrow, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.05em"
  title:
    fontFamily: "Archivo Narrow, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  note:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Archivo Narrow, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.09em"
  stamp:
    fontFamily: "Courier Prime, ui-monospace, Courier New, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  pill: "9999px"
spacing:
  hair: "1px"
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "3.5": "14px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
components:
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.none}"
  sheet-head:
    typography: "{typography.title}"
    textColor: "{colors.ink}"
    padding: "10px 16px"
  button-primary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.sheet}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.carbon-2}"
    textColor: "{colors.sheet}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.sheet-alt}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.red-tint}"
    textColor: "{colors.red}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  button-danger-hover:
    backgroundColor: "{colors.red}"
    textColor: "{colors.sheet}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.title}"
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "36px"
  input-invalid:
    backgroundColor: "{colors.red-tint}"
    textColor: "{colors.ink}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    typography: "{typography.title}"
    padding: "8px 20px"
  nav-item-active:
    backgroundColor: "{colors.carbon-tint}"
    textColor: "{colors.ink}"
  segment-selected:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.sheet}"
    typography: "{typography.title}"
    padding: "6px 8px"
  column-head:
    backgroundColor: "{colors.sheet-alt}"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    padding: "6px 8px"
---

# Design System: Budget Tracker

## Overview

**Creative North Star: "The Passbook"**

This is an account book, not a dashboard. The governing fiction is a bank passbook printed on cheque safety-tint stock: pale green paper, a whiter sheet laid on it, hairline rules dividing columns, and two inks doing all the work — the ledger's black and the carbon-copy blue of a committed entry. Every figure is money in a column, so no figure may ever shift; every entry carries the balance it left behind, so "how am I doing" is answered by the register's own construction rather than by a row of stat cards.

The system's discipline is subtractive. It refuses the KPI-card row, the donut, the tinted status pill, and the coloured category chip — not as taste, but because each of them spends colour on identity, and in this world colour is reserved for one meaning: trouble. Income and expense are separated by *column position*, the way a real register separates them; that frees red to mean exactly one thing everywhere it appears. The rest of the interface is structure: ruled rows, printed column heads, stamped reference codes. Density is high and deliberate — 13px body, 2–3px vertical padding inside rows — because a book of accounts is meant to be read down, not scanned across.

Dark mode is not an inversion. It is the carbon copy underneath the top sheet: the same document, printed through, warmer greys and a lighter blue ink. The two themes are two sides of one artefact, and the theme control names them that way ("Sheet", "Carbon").

**Key Characteristics:**
- Cheque safety-tint stock with a whiter sheet laid on it; no gradients, no glass, no tint fills except the two semantic tints.
- Two inks: ledger black for structure and figures, carbon blue for the committed and the interactive.
- Ledger red spent on one meaning only — money you do not have, or a limit you have passed.
- Hairline rules and ruled columns instead of cards; square corners everywhere; zero shadows.
- Archivo for reading, Archivo Narrow stamped in uppercase for heads and controls, Courier Prime for the machine-stamped reference layer.
- Tabular lining figures in every table, right-aligned on a shared decimal.
- One display step, one authored motion moment, one global instrument (the elapsed rule).

## Colors

A two-ink palette printed on green safety stock: everything is stock, ink, or the single alarm colour. Token values in the frontmatter are normative; each token exists in both a light (top sheet) and a dark (carbon copy) definition, exposed as CSS custom properties on `:root` and `.dark`.

### Primary
- **Carbon Copy Blue** (`--carbon`): the committed ink. Primary buttons, the active navigation marker and its tint, the focus ring, the caret, the selected segment in a picker, the "paid in" bars in the trend chart, inline links inside sheets, and a budget bar that is running at or under pace. It marks what the interface has committed to or what the user is currently on — never mood, never category.
- **Carbon Light** (`--carbon-2`): the hover state of the primary ink, and a budget bar that is ahead of pace.
- **Carbon Tint** (`--carbon-tint`): the only interactive fill in the system — the active nav row, a drag drop-target, and the opening frame of the `entry-strike` animation.

### Secondary
- **Ledger Red** (`--red`): trouble, and nothing else. A negative figure (printed with a trailing `DR`, so the sign is not carried by colour alone), an over-limit budget bar and its verdict line, a field in error, the delete action, and the irreversible block on the account page.
- **Red Tint** (`--red-tint`): the ground of an invalid field and the resting fill of the danger button; it goes solid red on hover.

### Neutral
- **Safety Stock** (`--paper`): the page ground, the app's outermost surface. Never used for a component fill.
- **Sheet** (`--sheet`): the surface laid on the stock. Every `Sheet`, every control, every menu, dialog and toast sits on it.
- **Sheet Alt** (`--sheet-alt`): the ruled band — column-head rows, row hover, ghost-button hover, the trough of a pace bar, the tooltip cursor.
- **Rule** (`--rule`): the default hairline. It is the global `border-color` for every element, so a bare `border` is always correct.
- **Rule Strong** (`--rule-strong`): the heavier hairline — the register's head, the first entry of a new day, the outline of a secondary button, a control's hover border, the chart's x-axis, the scrollbar thumb.
- **Perforation** (`--perforation`): the stub tint used in the repeating perforation gradient.
- **Ink** (`--ink`): body text, figures, the "paid out" bars, the elapsed rule's fill, the total border, and the strongest frame (menus, dialogs, toasts).
- **Ink 2** (`--ink-2`): secondary prose, descriptions, transfer figures.
- **Ink 3** (`--ink-3`): the stamped reference layer, column heads, notes, disabled and placeholder text, and blank-cell dashes.

### Named Rules

**The One Meaning Rule.** Colour carries exactly one meaning in this app: trouble. Direction of money is read from column position, never from green-versus-red. If a new surface needs to distinguish income from expense, it gets another column or a ruled tag — not a hue.

**The Two Inks Rule.** Every mark is ledger black or carbon blue. Ink is structure, figures and the printed page; carbon is what the user has committed to or is standing on. A third accent has no role to fill and must not be introduced.

**The Colour-As-Subject Rule.** Category colour appears in exactly two places: the categories index, where the colour *is* the thing being edited, and a chart where colour is the only encoding available. It is deliberately absent from the register, the analysis table and the budget bars. Identity colour competing with alarm colour makes both unreadable.

**The Carbon Copy Rule.** Dark mode is the same document printed through, not an inversion. Dark tokens keep the light theme's *roles* intact — stock stays below sheet, rule stays below rule-strong, carbon stays the committed ink. Never resolve a dark-mode contrast problem by swapping a role.

## Typography

**Display Font:** Archivo Narrow (with Archivo, then system sans)
**Body Font:** Archivo (with system sans)
**Label/Mono Font:** Courier Prime (with system monospace)

**Character:** Archivo is a grotesque with true tabular figures — plain, unstyled, exactly the voice of a printed statement. Archivo Narrow is its condensed sibling and does all the *stamped* work: every heading, column head, button, nav item and display figure is Narrow, uppercase, letterspaced, as if struck by a machine. Courier Prime is the reference layer — dates, codes, stamps, the "DAY 12 OF 31" line — the typewritten annotation on a printed form.

### Hierarchy
- **Display** (Narrow, 700, 30px → 38px at `sm`, line-height 1, tracking -0.01em): the one figure a page exists to report. Carried forward on the statement, closing balance on the register, paid-against-limits on budgets. Always a money figure, always tabular.
- **Headline** (Narrow, 700, 17px → 19px at `sm`, uppercase, tracking 0.05em): the page title in the statement head. One per page.
- **Title** (Narrow, 600, 13px, uppercase, tracking 0.08em): the printed head of a sheet, a dialog title. Also the shape of every button and nav item (at 11–13px, tracking 0.05–0.07em).
- **Body** (Archivo, 400, 13px): every register line, every field value, every description. Prose sits at `leading-relaxed`; row text is single-line and truncates.
- **Note** (Archivo, 400, 11px): field hints, verdict lines, footnotes, the honesty lines under a summary. Almost always `--ink-3`.
- **Label** (`.col-head` — Narrow, 600, 10.5px, uppercase, tracking 0.09em, `--ink-3`): the printed column head. It sits above a *table column* or above a *figure*; it is the world's native way of naming a number.
- **Stamp** (`.stamp` — Courier Prime, 11px, uppercase, tracking 0.02em): the reference layer. Dates in the register, period status, section numerals in the sidebar, the `TFR` and `IN` tags, empty-state slugs. Used between 9px and 11px only.

### Named Rules

**The Tabular Rule.** `font-variant-numeric: tabular-nums lining-nums` applies to every `table` and every `.figure` at the base layer. A figure that shifts as it updates has broken the column, and the column is the whole argument of this design. Money is right-aligned on a shared decimal, always via the `Amount` component — never formatted inline.

**The One Display Step Rule.** There is exactly one display size and exactly one display figure per page. If a second figure wants to be big, the page has two subjects and one of them is wrong.

**The Stamped Head Rule.** Headings, buttons, nav and column heads are always Archivo Narrow, uppercase, letterspaced. Sentence-case headings and body-weight buttons do not exist in this world.

**The No-Kicker Rule.** No kicker or eyebrow above a heading, on any navigation surface. A `.col-head` above a *figure* is native to the world and correct — a decorative label above a *heading* is not the same device and is not permitted.

## Layout

The app is a bound book: a 208px ruled sidebar from `lg` up, a sticky statement head across the top, content in a `max-w-5xl` (64rem) column, and a tab bar along the foot below `lg`. Settings-style single-column reading narrows to `max-w-2xl`; dialogs to `max-w-sm`/`max-w-md`.

Spacing is a 4px grid, used sparingly: sheets stack at 16px (`gap-4`), related controls at 8–12px, inline label-to-value at 4–8px. Sheet padding is 16px horizontal (20px from `sm`) with 10–12px vertical; register and summary rows run at 8–10px vertical. Page padding is 16px/16px, rising to 24px/20px at `sm`. The density is intentional: rows are meant to accumulate into a column you read downward.

Breakpoints are effectively two. `sm` (640px) is the workhorse — it is where the register's single "Amount · balance" column splits into Paid out / Paid in / Transfer / Balance, and where horizontal padding steps up. `lg` (1024px) is where navigation moves from foot to left edge and two-up sheet grids appear. Content that cannot compress (the register table) scrolls inside its own `overflow-x-auto` container rather than forcing the page to scroll sideways.

### Named Rules

**The Ruled Row Rule.** Structure comes from hairlines between rows, not from gaps between boxes. A list is a sequence of `border-t border-rule` rows inside one sheet; it is never a stack of separated tiles.

**The Column-Position Rule.** In any table of money, direction is encoded by which column the figure lands in. Below `sm`, where the columns collapse into one, direction moves onto a ruled `.stamp` tag (`TFR`, `IN`) — a small printed object on the sheet, never a colour and never a whisper.

**The One Navigation Rule.** There is exactly one navigation at every width: sidebar at `lg` and above, tab bar below it. No band where the app has two, none where it has none.

## Elevation & Depth

**There are no shadows in this system — zero, in any component.** Depth is entirely tonal and linear: the stock sits under the sheet, and separation is expressed by the *weight of the rule* rather than by lift. A `Sheet` is a 1px `--rule` outline on `--sheet`; nothing floats, nothing lifts on hover, and hover is expressed as a change of ground (`--sheet-alt`) or of border darkness.

The one exception to flatness is the modal scrim, `rgb(12 16 14 / 0.5)`, which fades in over 160ms. Dialogs, dropdown menus and toasts do not use a shadow to separate from the page; they use the heaviest frame available, `border-ink`.

### The Rule-Weight Ladder
- **`--rule` (1px)** — the default hairline: between rows, around sheets, around controls.
- **`--rule-strong` (1px)** — a stronger division: the register's column-head row, the first entry of a new day, a secondary button's outline, a control's hover border.
- **`--ink` (1px, or 2px as `border-t-2`)** — the closing rule under an arithmetic total, and the frame of anything laid *over* the book: dialog, menu, toast.

### Named Rules

**The Flat Book Rule.** No `box-shadow`, ever, in any state. Something that needs to read as "on top" gets `border-ink`; something that needs to read as "different ground" gets `--sheet-alt`.

**The Total Rule.** A figure that closes an arithmetic is separated by `border-t-2 border-ink`. That heavier rule is reserved for totals (and, in red, for the irreversible block); it must not be used for ordinary emphasis.

*Known gap, recorded honestly: every `Sheet` on every route currently carries identical weight, so the account summary and the six-period chart sit at the same level of ground. Future work may introduce a second sheet weight — but it must come from the rule-weight ladder above, not from a shadow.*

## Shapes

Radius is zero. Every sheet, button, field, tag, bar, dialog and menu has square corners; the only curved objects in the entire build are the loading spinner and the scrollbar thumb (both fully round, `9999px`). Borders are 1px hairlines by default, with 2px reserved for totals and the active tab-bar marker.

The system's one texture is **hatching**: a repeating 45° linear gradient used with a single consistent meaning — *this is not solid*. It appears as the overspend region past the end of a pace bar, as the fill of an in-progress period in the trend chart, and as the perforation gradient of the stub edge. Bars, marks and tags are rectangles; icons are Lucide strokes at 1.75 weight in ink, never in a tinted rounded square.

### Named Rules

**The Square Corner Rule.** Radius 0 on everything. If a component needs to look softer, it is the wrong component for this world.

**The Hatch Rule.** 45° hatching means "incomplete or past the boundary" and nothing else. A partial period is hatched rather than drawn solid, because a partial bar flush beside complete ones is the most misleading mark this app could print.

*Known gap, recorded honestly: `.stub-edge` — the perforated bound edge — is declared in the stylesheet and referenced by zero components. It is a world device written and not deployed; either use it as the left edge of a sheet or remove it, but do not invent a second perforation treatment beside it.*

## Components

### Buttons
- **Shape:** square (0 radius), 36px tall at `md`, 28px at `sm`, 32px square for icon-only. Label is Archivo Narrow 600, uppercase, tracking 0.07em, 12–13px.
- **Primary:** a solid block of carbon ink with sheet-coloured text; hover lightens to `--carbon-2`. One per surface, and on every page it is "Enter transaction" in the statement head.
- **Secondary (the default variant):** a ruled outline — `--rule-strong` border on `--sheet`; hover fills `--sheet-alt` and darkens the border to `--ink-3`.
- **Ghost:** no border, `--ink-2` text; hover fills `--sheet-alt`.
- **Danger:** red hairline on `--red-tint` with red text, inverting to solid red on hover.
- **States:** colour transitions run 100ms. Disabled drops to 40% opacity and loses pointer events. A loading button swaps its icon for the spinner and sets `aria-busy`.

### Cards / Containers
There are no cards. The container primitive is the **Sheet**: `border border-rule` on `--sheet`, square, no shadow, no radius, and **never nested inside another sheet**. Its head (`SheetHead`) is a ruled bar with a Narrow uppercase title on the left, an optional `.stamp` meta note, and an optional action pushed right. Content inside a sheet is rows separated by hairlines, edge-to-edge — the sheet supplies the horizontal padding (16px, 20px at `sm`), the rows supply the vertical rhythm.

### Inputs / Fields
- **Style:** ruled boxes, not rounded inputs — `border border-rule` on `--sheet`, square, 13px ink text, 10px horizontal padding, 36px tall.
- **Hover / Focus:** the hairline darkens to `--rule-strong` on hover and turns carbon on focus. The global focus ring is `2px solid var(--carbon)` at 1px offset.
- **Error:** border and text go red and the field fills `--red-tint`, driven off `aria-invalid`; the message prints at 11px semibold red with `role="alert"`.
- **Field wrapper:** a `.col-head` label above the control, an optional 11px hint below, and a "required" marker that is visual only — the control itself carries `required`.
- **Select:** the same ruled box with a chevron in `--ink-3`; native `appearance` removed.

### Segmented Controls
`TypePicker` and `ThemeToggle` are ruled tab strips: one shared outline, 1px dividers between segments, square. The selected segment fills solid — carbon for a data choice (income/expense/transfer), ink for the theme choice — with sheet-coloured text; unselected segments are `--ink-3` on sheet and hover to `--sheet-alt`. Both use radio semantics so arrow keys work.

### Navigation
- **Sidebar (`lg`+):** a 208px ruled column on `--sheet`, the wordmark ruled off at the top, a `.stamp` section numeral in a 16px gutter beside each Narrow uppercase label, and a data-honesty footnote ruled off at the bottom. The active item is marked by a 1px carbon left border plus a `--carbon-tint` fill.
- **Tab bar (below `lg`):** the same index along the foot, sticky, five equal cells 48px tall; the active item is marked by a 2px carbon top border plus the same tint.
- **Statement head:** sticky, `--paper` at 95% with a 2px backdrop blur, ruled off at the bottom. Title, page actions, theme toggle and the primary action live in one wrapping row — a single instance reordered by CSS, never duplicated per breakpoint.

### Modals & Toasts
A **Modal** is a slip laid over the book: `border border-ink` on `--sheet`, square, bottom-anchored on phones and centred from `sm`, with a ruled header and an optional ruled footer. It enters with `animate-in` over the fading scrim; focus is trapped, Escape closes, and focus returns to the trigger. A **ConfirmDialog** always focuses Cancel, and reserves a type-to-confirm word for losses that cannot be undone. A **Toast** is a receipt slip at the foot of the page — `border-ink` (or `border-red` for trouble) on sheet, Narrow uppercase message, 12px description, an underlined carbon undo action; no icon set and no colour coding beyond the ledger's one rule.

### Empty & Loading States
An **EmptyState** is an unused page of the book: a `.stamp` slug ("No entries"), a 15px Narrow uppercase title, a short 13px description, and the action. No illustration, no icon in a tinted square. **Skeletons** are `shimmer` bars laid out in the exact ruled-row shape the content will take, wrapped in a labelled `role="status"` region.

### The Elapsed Rule (signature)
The app's one global instrument, printed in the statement head under the title on every period-bearing page: a `.stamp` line reading `Day n of n` (or `Period closed` / `Period not started`), a percentage on the right, and a 4px ruled trough filled in solid ink to today and left hollow for the days still to come. A closed period fills in `--ink-3` instead of `--ink`. It exists so that no figure beneath it can be misread as a finished month.

### The Pace Bar (signature)
A 12px ruled trough on `--sheet-alt` with a solid carbon fill for the proportion spent — and a 1px ink **scheduled tick**, over-hanging the bar by 3px top and bottom, at the point the elapsed rule says the month has reached. That tick is what turns "27% spent" into a judgement. Overspend hatches back over the fill rather than vanishing at 100%, the fill turns red only when actually over, and the verdict is always written out in words beneath ("£40 within pace", "Nothing paid yet, 60% of the period gone") so the meaning never depends on the bar.

### The Register Entry (signature)
One line of the account book: a Courier date printed only on the first entry of each day (that row taking the heavier `--rule-strong` top border), particulars with the category name and ink icon beneath, then the money columns — Paid out, Paid in, Transfer, Balance — each a separate right-aligned tabular column from `sm` up, collapsing to a single "Amount · balance" column below it. Every figure goes through `Amount`, which prints a negative in red with a trailing `DR` and renders a blank cell as an em dash. Row hover fills `--sheet-alt`; a newly recorded entry plays `entry-strike` once.

### Charts
Recharts is the only charting surface and it is dressed entirely in tokens: `--rule` gridlines (horizontal only), `--rule-strong` axis, 10px `--ink-3` ticks, an ink zero reference line, no legend of its own (a separate ruled `TrendKey` states what the marks mean, including the hatching), and a tooltip that is a bordered ink-framed sheet with a ruled net row. Paid-in bars are carbon, paid-out bars are ink, and any in-progress period is drawn as an SVG hatch pattern instead of a solid bar. Bar animation is off.

### Motion
- `animate-in` (`sheet-in`, 260ms, 6px rise + fade, `cubic-bezier(0.16, 1, 0.3, 1)`) — the generic entrance for a page's content, a dialog, a menu, a toast.
- `animate-entry` (`entry-strike`, 420ms) — **the one authored moment**: a new entry arrives from the left the way a printer's carriage lays a line down, opening on a `--carbon-tint` ground that clears as it settles.
- `animate-fade-in` (160ms) — the scrim only.
- `shimmer` (1.5s, infinite) — skeletons only.
- State transitions are 100ms for colour, 500ms `ease-out` for the width of a bar or rule.
- `prefers-reduced-motion: reduce` collapses every animation and transition to 0.01ms globally.

**The One Authored Moment Rule.** `entry-strike` is the system's only expressive animation, and it belongs to recording an entry — the product's hot path. Everything else either fades in or does not move. A second authored moment would make the first one ordinary.

*Known gap, recorded honestly: `animate-in` is applied at roughly ten call sites with one identical entrance. It is a utility, not a composition; a page that needs its parts to arrive in an order does not yet have a way to say so.*

## Do's and Don'ts

### Do:
- **Do** put every money figure through `Amount`, and every table under `tabular-nums lining-nums`. Right-align on a shared decimal.
- **Do** encode direction with column position, and give a collapsed mobile column a ruled `.stamp` tag (`TFR`, `IN`) instead of a colour.
- **Do** build new surfaces from `Sheet` + ruled rows: one hairline between rows, edge-to-edge, the sheet supplying horizontal padding.
- **Do** reserve `--red` for money you do not have or a limit already passed, and pair it with a written word or the `DR` marker so meaning never rests on hue.
- **Do** write the verdict out in words next to any bar or gauge ("£40 within pace"), so the reader never has to compute a judgement from a colour.
- **Do** hatch anything that is incomplete or past its boundary, at 45°.
- **Do** keep one display figure per page, and let the elapsed rule in the statement head be the only global instrument.
- **Do** state the period's honesty in plain 11px prose under a summary when a comparison has been cut to a like-for-like day range.
- **Do** frame anything laid over the book with `border-ink`, and let hover change ground (`--sheet-alt`) or border weight.

### Don't:
- **Don't** add a shadow, a radius, or a gradient. Not on hover, not on a dialog, not "just a subtle one".
- **Don't** nest a `Sheet` inside a `Sheet`, or reintroduce the card — a row of stat tiles is the specific thing the summary block exists to replace.
- **Don't** use green-for-income / red-for-expense, or any second accent colour. Colour means trouble; that is its whole job.
- **Don't** print category colour in the register, the analysis table, or a budget bar. Its only homes are the categories index and a chart where colour is the sole encoding.
- **Don't** put a kicker or eyebrow above a heading in a navigation surface. (A `.col-head` above a figure is a column head, and is correct.)
- **Don't** set a heading, button or nav label in body case or body weight — those are always Archivo Narrow, uppercase, letterspaced.
- **Don't** introduce a second display size, or a second big figure on a page.
- **Don't** author a second signature animation; extend `entry-strike`'s meaning instead, or use `animate-in`.
- **Don't** draw a partial period flush beside complete ones, or clamp an overspent bar at 100%. Both flatter the user with an artefact of timing.
- **Don't** reveal controls only on hover — a touch device has no hover to reveal them with.
