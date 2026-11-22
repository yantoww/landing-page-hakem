---
name: Partai Simpul
description: Papan petunjuk transit untuk partai simulasi: tiga jalur (Aspirasi, Forum, Suara) bertemu di satu simpul tempat suara anggota menjadi keputusan.
colors:
  nila-900: "#141b4d"
  nila-800: "#1d2766"
  nila-700: "#2a3590"
  nila-100: "#e7eaf8"
  paper: "#f6f7fb"
  white: "#ffffff"
  ink: "#141b4d"
  ink-2: "#3a416f"
  on-dark-2: "#cbd2f4"
  kunyit: "#f6b21b"
  kunyit-hover: "#ffc641"
  langit: "#9db8f5"
  cabai: "#b42e12"
  cabai-wash: "#fbe9e4"
  cabai-ink: "#6f1d09"
  ctl: "#5a628f"
  hair: "rgba(20, 27, 77, 0.18)"
  hair-dark: "rgba(203, 210, 244, 0.28)"
typography:
  display:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.5rem, 1.1rem + 4.8vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2.5vw, 3.1rem)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.8vw, 1.6rem)"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 750
    lineHeight: 1.3
  lead:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.15
  caption:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  r-1: "6px"
  r-2: "10px"
  r-3: "16px"
  full: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  rail-w: "8px"
  rail-indent: "84px"
  section-y: "clamp(64px, 9vw, 120px)"
  wrap-max: "1200px"
  tap-min: "44px"
  control-h: "48px"
components:
  button-primary:
    backgroundColor: "{colors.kunyit}"
    textColor: "{colors.nila-900}"
    typography: "{typography.label}"
    rounded: "{rounded.r-2}"
    height: "48px"
    padding: "0 22px"
  button-primary-hover:
    backgroundColor: "{colors.kunyit-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.nila-900}"
    rounded: "{rounded.r-2}"
    height: "48px"
    padding: "0 22px"
  button-ghost-hover:
    backgroundColor: "{colors.nila-100}"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.r-2}"
  button-warn:
    backgroundColor: "{colors.cabai}"
    textColor: "{colors.white}"
    rounded: "{rounded.r-2}"
  button-done:
    backgroundColor: "{colors.nila-100}"
    textColor: "{colors.nila-900}"
    rounded: "{rounded.r-2}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-1}"
    height: "48px"
    padding: "10px 14px"
  option-row:
    textColor: "{colors.ink}"
    rounded: "{rounded.r-1}"
    height: "54px"
    padding: "9px 16px"
  line-badge-a:
    backgroundColor: "{colors.kunyit}"
    textColor: "{colors.nila-900}"
    size: "28px"
  line-badge-f:
    backgroundColor: "{colors.langit}"
    textColor: "{colors.nila-900}"
    size: "28px"
  line-badge-s:
    backgroundColor: "{colors.white}"
    textColor: "{colors.nila-900}"
    size: "28px"
  station-bullet:
    backgroundColor: "{colors.white}"
    textColor: "{colors.nila-900}"
    rounded: "{rounded.full}"
    size: "52px"
  station-bullet-dark:
    backgroundColor: "{colors.nila-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    size: "52px"
  member-pass:
    backgroundColor: "{colors.nila-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.r-3}"
    width: "380px"
  ballot-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-3}"
  label-band:
    backgroundColor: "{colors.kunyit}"
    textColor: "{colors.nila-900}"
  stamp:
    textColor: "{colors.cabai}"
    rounded: "{rounded.r-1}"
  notice:
    backgroundColor: "{colors.nila-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-1}"
  notice-warn:
    backgroundColor: "{colors.cabai-wash}"
    textColor: "{colors.cabai-ink}"
    rounded: "{rounded.r-1}"
---

# Design System: Partai Simpul

## Overview

**Creative North Star: "Jalur Simpul" (the transit-signage map)**

The page is a route map. Three lines, A (Aspirasi), F (Forum) and S (Suara), converge on one interchange where member input becomes a decided outcome, and the conversion rule is printed on the board like a station notice. Every surface borrows from way-finding signage: heavy rail strokes, ringed stations, lettered line badges, a commuter-card membership pass, a service-disruption table for risks, and a rubber stamp for the simulation disclaimer. The system is flat, saturated and legible from across a room or off a projector.

Grounds alternate between a pale blue-white paper and full-bleed deep indigo (nila). Indigo carries the hero, the participation zone, the rules/risks section and the footer; paper and white carry reading areas. One warm color, kunyit (turmeric yellow), is reserved for the single primary action and for the "you are here" signal on the map. Type is Overpass only, a descendant of Highway Gothic, set heavy for headings and plain for reading.

PRODUCT.md commitment kept here: this is a fictional, academic simulation. The mandatory label ("Simulasi Akademik — Bukan Partai Politik Resmi") is a permanent kunyit band at the top of every page and the only place an em dash appears.

**Key Characteristics:**
- Flat, outlined, signage-like: depth comes from tone, thick strokes and one soft lift shadow, never hard offsets.
- Two grounds in rhythm: light reading areas (paper, white, nila-100) and full indigo fields.
- One action color (kunyit); line identity colors (kunyit/langit/white) appear only as line badges, map strokes and tab underlines.
- Motion is a signal travelling the line: strokes draw, stations are visited in order, tokens ride a route to the interchange.

## Colors

A deep indigo and board-white palette with one turmeric accent; every pairing is verified for contrast.

### Primary
- **Nila Pekat** (nila-900, #141b4d): text ink, dark grounds, rail, line outlines, station ring strokes, borders of ghost buttons and the quorum meter.
- **Nila Tua** (nila-800, #1d2766): `accent-color` for native controls only.
- **Nila Terang** (nila-700, #2a3590): links, light-ground focus ring, caret.
- **Kunyit** (kunyit, #f6b21b): the single action color. Primary button, label band, A-line badge, current station dot, quorum fill, decided-state station, selection highlight, focus ring on dark grounds, `.hl` emphasis on dark. Hover is a lighter #ffc641 (kunyit-hover).

### Secondary
- **Langit** (langit, #9db8f5): line F tint only: F badge, F tab underline, F stripe on the pass.

### Tertiary
- **Cabai** (cabai, #b42e12): error and the stamp only: field errors, invalid borders, the rotated stamp, the destructive/warn button. Companion wash #fbe9e4 with text #6f1d09 for `notice--warn`.

### Neutral
- **Kertas Papan** (paper, #f6f7fb): default page ground.
- **Putih Papan** (white, #ffffff): panels, cards, inputs, header, white-section ground, S-line badge.
- **Nila Pucat** (nila-100, #e7eaf8): tint ground, hover fill, track fill, notices, outcome strips.
- **Tinta 2** (ink-2, #3a416f): secondary text on light grounds.
- **Tinta Terang** (on-dark-2, #cbd2f4): body text on indigo.
- **Kontrol** (ctl, #5a628f): control borders (inputs, options), inactive station dots, bar-fill resting color.
- **Garis Halus** (hair rgba(20,27,77,0.18)) and **Garis Halus Gelap** (hair-dark rgba(203,210,244,0.28)): hairline dividers on light and dark.

Verified contrast (WCAG ratio, computed from the shipped hex values): ink on paper 15.2, ink on white 16.2, ink-2 on white 9.7, ink-2 on paper 9.1, ink-2 on nila-100 8.1, white on nila-900 16.2, on-dark-2 on nila-900 10.9, kunyit on nila-900 8.7 (and nila-900 on kunyit, the button), nila-700 link on white 10.5, nila-900 on langit 8.2, cabai on white 6.3, cabai on nila-100 5.3, white on cabai 6.3, ctl control border on white 5.9 and on nila-100 4.9, cabai-ink on cabai-wash 9.6. Kunyit is never used as text or a border on white (about 1.9).

### Named Rules
**The One Action Rule.** Kunyit marks the primary action and the "you are here" signal. A screen has one kunyit button; line identity colors are never reused as buttons.

**The Cabai Reserve Rule.** Cabai appears only for error and the stamp. It never decorates, never marks a line, never fills a section.

**The Two Grounds Rule.** Reading areas are paper/white/nila-100; hero, participation, rules/risks and footer are full nila-900. White panels sitting inside an indigo field flip focus back to nila-700.

## Typography

**Display Font:** Overpass Variable (self-hosted, @fontsource-variable/overpass) with Segoe UI, system-ui fallback
**Body Font:** Overpass Variable, same stack
**Label/Mono Font:** none; numerals use `font-variant-numeric: tabular-nums` (`.num`)

**Character:** Highway-Gothic-descended road-sign letters: broad, even, very legible at distance and on a projector. One family throughout; hierarchy comes from weight and size alone.

### Hierarchy
- **Display** (800, clamp(2.5rem, 1.1rem + 4.8vw, 4.75rem), 1.02, -0.025em): hero h1 only, max 11ch, one "board" per line. On laptops under 820px tall it drops to clamp(2.5rem, 4.2vw, 4rem).
- **Headline** (800, clamp(1.9rem, 1.2rem + 2.5vw, 3.1rem), 1.06, -0.02em): section titles beside the station bullet.
- **Title** (750, clamp(1.25rem, 1.05rem + 0.8vw, 1.6rem), 1.2): h3 panels and sub-blocks.
- **Subtitle** (750, 1.0625rem, 1.3): h4 and row titles.
- **Lead** (400, clamp(1.0625rem, 1rem + 0.35vw, 1.25rem), 1.6, on-dark-2, max 36rem): hero paragraph.
- **Body** (400, 1.0625rem, 1.65, max 68ch): all running text.
- **Label** (700, 1rem, 1.15): buttons; menu items 600-700; small row text 0.875-0.9375rem; tiny labels 0.8125rem.
- **Caption** (400, 0.875rem): hints, notes, rules footnote.

Headings use `text-wrap: balance`. Weights in use: 400, 600, 650, 700, 750, 800, 900 (stamp only).

### Named Rules
**The Sign Face Rule.** Overpass only. No second family, no system display face, no italic voice.

**The Weight-Not-Case Rule.** Hierarchy is made with weight and size. Uppercase is reserved for the stamp (and the decorative watermark on the pass); it is never a label style.

## Layout

A single 1200px centered wrap with a fluid gutter (`clamp(16px, 4vw, 40px)`). Sections breathe with `clamp(64px, 9vw, 120px)` vertical padding and alternate paper / white / nila-100 / nila-900 grounds.

From 900px up, a main rail (8px wide, nila-900, or kunyit inside dark sections) runs the full height of each section at the wrap's left edge; content is indented 84px (`wrap--rail`) and each section title hangs a station bullet on the rail (the title shifts -84px to dock). The interchange section uses a larger bullet (68px, 11px ring). Below 900px the rail disappears and multi-column grids collapse to one column.

Hero: two columns 1.05fr / 0.95fr (headline, lead, action on the left; the working vote card "Peron Suara" on the right) with the horizontal three-line map beneath, so the first viewport carries the label band, the nav strip, the title, a working vote and the map.

Spacing rhythm is utility-driven rather than a named scale: 6/8/10/12/14/16/20/24/28 inside components, 36-64px between title and content (`clamp(36px, 5vw, 64px)`), 56-96px between blocks. Tap targets: 44px minimum, 48px controls, 54px option rows.

### Responsive rules
- **1260px up:** the station strip (seven stations, inline) replaces the "menu" button and dropdown route.
- **Below 1260px:** a menu button opens a vertical route list under the header (stations as a rail with numbered dots).
- **1040px (max 1039):** hero/ballot rearrangement tier.
- **960px (max 960 / min 961):** hero collapses to one column; above it, the short-height rule applies.
- **900px:** rail and indentation on/off; most two-column grids go single.
- **760px:** rules table row headers lose fixed width.
- **560px:** tab sublabels hidden, tabs center their line badge, news/social rows stack, outcome row stacks.
- **Short-height rule:** min-width 961px and max-height 820px compacts the hero (top padding 14px, hides the ballot hint, ballot min-height 440px, option rows 42px, map margin 14px) so the map stays inside the first viewport.
- Also present: 1000px (agenda grid) and 639px (header CTA hidden).

## Elevation & Depth

Flat by default; hierarchy is tone and stroke weight. There is exactly one shadow token, a soft downward lift (`--lift`: `0 1px 0 rgba(20,27,77,0.08), 0 14px 26px -14px rgba(20,27,77,0.5)`), used on the stuck header, the mobile route menu, the hero ballot card and the member pass. There are no hard offset shadows, no glows, no blurred text shadows. Line badges carry an inset 2px nila ring (`inset 0 0 0 2px`) which is an outline, not depth.

### Named Rules
**The One Lift Rule.** Only floating or physical objects (stuck header, menu, vote card, pass) take `--lift`. Everything else stays flat and is separated by a 2px nila rule, a hairline, or a ground change.

## Shapes

Circles for stations, rounded rectangles for tickets and controls, thick strokes everywhere. Radius scale: 6px (`r-1`: inputs, options, notices, checks, stamp), 10px (`r-2`: buttons, menu button), 16px (`r-3`: ballot card, pass, panel bottom corners), 50% (stations, bullets, dots). Line badges are 28px squares with 7px corners.

Stations are ringed circles: a white (or nila on dark) disc with a 5-8px nila ring (kunyit ring on dark grounds); bullets 52px with an 8px ring; route dots 24px with a 5px ring; option dots 24px with a 5px ring. Rail legs are 4px solid lines joining dots; main rail 8px. Borders are 2px on controls and 3px on the stamp and kunyit table rule; tab underline is 6px. The pass has a skewed (-14deg) tri-stripe in kunyit, white and langit on its right edge (hard stops, not a blended gradient).

## Components

### Buttons
- **Shape:** 10px radius, 2px border, min-height 48px (sm 44px, lg 56px), padding 0 22px, weight 700.
- **Primary:** kunyit fill, nila-900 text; hover #ffc641. The one action color.
- **Ghost:** transparent, 2px nila-900 border, nila text; hover fills nila-100. **Ghost-light** for dark grounds: on-dark-2 border, white text, 10% white hover.
- **Warn:** cabai fill, white text (destructive/reset). **Done:** nila-100 fill, nila border, no pointer.
- **States:** `:active` nudges 1px down; disabled drops to 55% opacity, `not-allowed`; focus is the 3px ring below.
- **Link button:** text-style, nila-700 (kunyit on dark member bar), underlined, weight 700.

### Inputs / Fields
- 48px high, 2px ctl border, 6px radius, white fill; textarea min 96px.
- Focus: 3px nila-700 outline at 2px offset plus nila-900 border. Error: cabai border (`aria-invalid`) with a cabai message in weight 650 below the field. Labels sit above the field (weight 700, 0.9375rem) with an optional hint line; placeholders are never the only label (the `.ph` marker with a dashed underline is how unresolved placeholder copy is shown).
- Checks and option rows are full-width bordered tiles (2px, 6px radius), min 44px/54px, with a native-sized 22px box or a ringed dot; hover fills nila-100.

### Navigation
- **Header:** sticky white bar, 2px nila bottom rule, kunyit label band on top. Brand left, station strip center, one primary CTA right (hidden under 640px).
- **Station strip (1260px+):** seven stations on a 4px line. Past stations are filled nila with a filled segment grown left to right; the current station is a kunyit dot scaled 1.3 with a heavier label; future dots are ctl-ringed white.
- **Menu (below 1260px):** a bordered button with a drawn SVG chevron (rotates when open) opening a vertical rail list; current station dot is kunyit.
- **Skip link** appears on focus in kunyit.

### Line badge and route
- Lettered 28px badges A (kunyit), F (langit), S (white) with an inset nila ring, used in tabs, table headers, the pass and map labels.
- Vertical route: dot-and-leg list (24px ringed dots, 4px legs); the final dot is kunyit (terminus).

### Station sign (section heading)
- A bullet (52px ringed disc with the section number, tabular) beside an h2 and an optional sub line. Dark sections invert (nila disc, kunyit ring, white number).

### Tabs and panel (Ruang Partisipasi)
- Tabs sit on the indigo ground with a 6px underline bar that slides to the selected tab and takes that line's color (A kunyit, F langit, S white). The panel is a white sheet with 0 0 16px 16px corners. Tab sublabels hide at 560px.

### Ballot and results (Peron Suara)
- White ticket card, 16px radius, `--lift`. Option rows with ringed dots; results as 14px bars (resting ctl, leader nila-900 with a bordered "unggul" tag); quorum meter is a 14px white track with a 2px nila border and a kunyit fill; outcome strip on nila-100 with the cabai **Stamp** (3px border, 6px radius, rotated -6deg, weight 900, uppercase) when the simulation disclaimer applies.

### Member pass (commuter card)
- Aspect 1.586, nila-900, 16px radius, `--lift`, max 380px; brand and kind top-left, name large (weight 800), kunyit number with 0.08em tracking, line badges bottom, tri-stripe on the right edge, faint rotated "SIMULASI" watermark at 7% white (decorative only, aria-hidden).

### Disruption table (Informasi gangguan)
- On indigo: a 3px kunyit top rule, rows separated by dark hairlines, a title column (white, 1.125rem) and a two-column definition list whose terms are kunyit weight 800. Rules table headers carry a line badge and a kunyit bottom rule.

### Map (hero)
- SVG with three thick 45-degree-turning lines converging on the Simpul interchange and ending at the terminus "Keputusan ditetapkan"; stations are ringed circles; on decision the terminus fills kunyit.

## Motion

**Grammar: a signal travelling the line.** Strokes are drawn, stations are visited in order, tokens ride the route to the interchange. Only transform, opacity, clip-path and stroke-dashoffset animate. Easing is `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease`); durations 0.15-0.4s for state, 0.35-1s for reveals.

- **Load (hero):** headline unveils per line (clip-path, 90ms stagger), lead and actions unveil, the vote card drops out like a ticket, map badges pop, lines draw, stations are visited in order, the interchange ripples once.
- **Scroll (IntersectionObserver only, no scroll listeners):** section bullets settle and ripple once; route and tree lines draw downward with staggered dots; the main rail lights up (scaleY) in passed sections at 900px+; the station strip fills and the current dot lands.
- **Action feedback:** a signal token travels the member's line (A, F, S) to the interchange; a vote that completes quorum carries the token to the terminus and lights "Keputusan ditetapkan". Result bars and the quorum meter grow (width, 0.9s), the support count ticks, the pass is issued with a stripe sweep, the tab line sweeps once.
- **Hover:** hovering or focusing a map line label dims the other two lines to 28% opacity; poster art lifts 6px.
- **Gating:** all animation lives inside `@media (prefers-reduced-motion: no-preference)`, or its starting state applies only under `.js`. Under `reduce`, animation and transition are forced off, smooth scroll is off, and the tab sweep is hidden, but state remains (lit rail, decided station, results).
- **Text is never hidden** by motion; unveils clip but the final state is the default. No infinite loops.

### Named Rules
**The Signal Rule.** Motion shows cause: something travels a line to where it matters. Decorative drift, parallax and idle loops are out.

**The Gated Start Rule.** A hidden "from" state exists only under `.js` and `no-preference`; without JS or with reduced motion the page is complete and visible.

## Do's and Don'ts

### Do:
- **Do** use kunyit for exactly one primary action per view and for the current-station signal.
- **Do** keep every control at 44px minimum height (48px default) with a visible 3px focus ring (nila-700 on light, kunyit on dark).
- **Do** build new sections as stations: a ringed bullet, a heavy title, rail on the left at 900px+.
- **Do** express line identity with the A/F/S badge and its fixed color (kunyit, langit, white).
- **Do** keep placeholders labelled: every input has a visible label, and unresolved copy uses the dashed `.ph` marker.
- **Do** pair text and ground only from the verified contrast list; use ink-2 for secondary text on light, on-dark-2 on indigo.
- **Do** write motion as transform/opacity/clip-path/stroke-dashoffset, inside `prefers-reduced-motion: no-preference` or gated by `.js`, with IntersectionObserver instead of scroll listeners.
- **Do** keep the mandatory label band, with its single em dash, at the top of every page.

### Don't:
- **Don't** add kickers, eyebrows or small uppercase label lines above headings.
- **Don't** use icon glyphs or icon fonts; arrows and chevrons are drawn SVG (see `--chev`), and signs are circles, letters and strokes.
- **Don't** use hard offset shadows, glows or any shadow other than `--lift`.
- **Don't** use gradient text or decorative gradients; the only gradient is the pass's hard-stop tri-stripe.
- **Don't** use more than one em dash on the site: the mandatory label is the only one.
- **Don't** put kunyit on white as text or a border, or use cabai for anything but error and the stamp.
- **Don't** use a second typeface or a system display face.
- **Don't** hide text with motion, run infinite loops, or attach scroll listeners.
- **Don't** fall back to the generic party site: a photo hero, three pillar cards, headline statistics.
