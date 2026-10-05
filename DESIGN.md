---
name: UAE Venture Guide
description: A business plan that reads like a clean licence file, in emerald and ink.
colors:
  page: "#f6f7f9"
  panel: "#ffffff"
  ink: "#0f172a"
  ink-muted: "#475569"
  quiet-fill: "#f1f5f9"
  hairline: "#e2e8f0"
  soft-edge: "#cbd5e1"
  field-edge: "#8590a2"
  emerald: "#047857"
  emerald-deep: "#065f46"
  emerald-focus: "#10b981"
  emerald-wash: "#ecfdf5"
  emerald-selection: "#d1fae5"
  chart-estimated: "#45c093"
  seal-amber: "#d97706"
  seal-ink: "#b45309"
  seal-wash: "#fffbeb"
  error-red: "#b91c1c"
  error-wash: "#fef2f2"
typography:
  display:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.55
  body:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"tnum\""
  label:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.06em"
  stamp:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  stamp: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.emerald}"
    textColor: "{colors.panel}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.emerald-deep}"
  button-outline:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "#f8fafc"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.quiet-fill}"
  button-destructive:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.error-red}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-destructive-hover:
    backgroundColor: "{colors.error-wash}"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "44px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px 24px"
  next-step-band:
    backgroundColor: "{colors.emerald-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px 24px"
  stamp-official:
    backgroundColor: "{colors.seal-wash}"
    textColor: "{colors.seal-ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  stamp-done:
    backgroundColor: "{colors.emerald-wash}"
    textColor: "{colors.emerald}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  stamp-stopped:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.error-red}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  stamp-quiet:
    textColor: "{colors.ink-muted}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  table-header:
    backgroundColor: "{colors.quiet-fill}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "12px 16px"
  nav-tab-active:
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    padding: "12px 12px"
  progress-bar:
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.full}"
    height: "8px"
---

# Design System: UAE Venture Guide

## Overview

**Creative North Star: "Emerald and Ink"**

Every page is a clean licence file laid on a soft grey desk. The page is light grey; content that is one bounded thing (a form, a table, a chat, a source being edited) sits on a white panel with a thin edge and a very soft shadow. Text is near-black ink. One emerald colour, the green of the UAE flag, marks the main button, links, the current tab and anything that is done. Gold is not part of the look any more: a small amber seal is kept for one job only, the OFFICIAL mark on a fee that was checked.

The document structure stays. A plan opens with a title and a row of labelled fields (Emirate, Sector, Licence, Budget, Reference, Issued), then sections split by thin rules. Steps are numbered (1, 1.1, 1.2), money lines up in tabular columns, tables are ruled, and status is shown by small rubber stamps whose words carry the meaning. The site never claims to be a government service.

The mood is calm, modern and light. Motion is quick and soft: pages slide up a few pixels when they open, details fold open smoothly, and a thin emerald bar runs along the top while the next page loads. Everything respects the "reduce motion" setting.

**Key Characteristics:**
- Soft grey page, white panels with a hairline edge and a barely-there shadow.
- Near-black ink for text; slate grey for secondary text.
- Emerald for the one main action, links, the current tab, progress and done.
- Amber only inside the OFFICIAL seal; red only for errors and stopped states.
- Small uppercase field labels above values, numbered steps and ruled tables.
- Roboto everywhere, with tabular figures for every amount and step number.
- Short, soft motion (150 to 320ms, ease-out) that turns off with reduced motion.

## Colors

A cool, near-neutral palette: ink on white over a soft grey page, with emerald as the single voice for action and progress.

### Primary
- **UAE Emerald** (emerald): the main button on a page, link underlines, the current nav link and plan tab, checkbox and caret colour, the progress-bar fill, the DONE stamp, the "actual" chart bar, the logo square and the loading bar. 5.5:1 on white. Darkens to **Deep Emerald** (emerald-deep) on button hover; Deep Emerald is also the text colour on Emerald Wash.
- **Focus Emerald** (emerald-focus): keyboard focus. Shown as the field edge plus a 3px ring at 50% opacity, and as the glow under the loading bar. Never used for text.
- **Emerald Wash** (emerald-wash): the "Next step" band, the dashboard and profile notice bands, the chosen role card, avatars and the DONE stamp fill.
- **Emerald Selection** (emerald-selection): text selection only.
- **Light Emerald** (chart-estimated): the "estimated" bar in plan and post charts. Never text.

### Secondary
- **Seal Amber** (seal-amber): the double-ruled border of the OFFICIAL seal, nothing else.
- **Seal Ink** (seal-ink): the word OFFICIAL inside the seal. 5.0:1 on white. **Seal Wash** (seal-wash) is the seal's fill.

### Tertiary
- **Error Red** (error-red): error messages, invalid field edges, declined or stopped stamps, the Delete button, an over-budget figure and a "High" risk level. 6.5:1 on white. **Error Wash** (error-wash) is its hover and alert surface.

### Neutral
- **Page Grey** (page): the background of every page.
- **Panel White** (panel): panels, the header, inputs, outline buttons.
- **Ink** (ink): all text, headings and values. 17.9:1 on white.
- **Muted Slate** (ink-muted): descriptions, field labels, step numbers, hints, chart labels and legends. 7.6:1 on white.
- **Quiet Fill** (quiet-fill): table header rows, ghost-button hover, chart hover band.
- **Hairline** (hairline): every rule between sections, rows and table cells; panel edges; chart gridlines; the progress track.
- **Soft Edge** (soft-edge): the outline-button border, the dashed empty-state border and the hover edge of panels and nav links.
- **Field Edge** (field-edge): form-control borders (3.2:1, enough for a control edge).

### Named Rules
**The One Emerald Action Rule.** A page has at most one solid emerald button. Every other action is a white outline button, a ghost button or a link.

**The Earned Seal Rule.** The amber OFFICIAL seal appears only on a fee an administrator checked against a cited official page. Demo amounts carry DEMO FEE; everything else says Estimate. The fee legend names only the marks shown on the page.

**The State Colours Rule.** Emerald means action or done, red means error or stopped, amber means checked-official. None of them is used for decoration.

**The Emerald Chart Rule.** Plan charts use Light Emerald for estimated and UAE Emerald for actual. The two differ in lightness, so every kind of colour vision can tell them apart (checked with the dataviz palette validator). Labels, legends and axis text are Muted Slate, never the bar colour, and gridlines are Hairline.

## Typography

**Display Font:** Roboto (served by next/font, with system sans fallback)
**Body Font:** Roboto
**Label/Mono Font:** Roboto, uppercase and tracked for labels; no separate mono face in use.

**Character:** one plain, easy-to-read face doing every job by weight and size, like a typeset form.

### Hierarchy
- **Display** (700, 1.75rem on phones, 2rem from 640px, line-height 1.25, -0.01em): the page or plan title, once per page.
- **Headline** (700, 1.25rem, -0.01em): section headings such as Money, Licence, Roadmap, Next step.
- **Title** (500, 1.125rem): the next step's title; form-part legends and empty-state headings use the same size at 700.
- **Body** (400, 1rem): prose, capped at about 42rem; field values at 500 with tabular figures.
- **Body small** (400, 0.875rem, tabular figures): tables, costs, navigation, hints, legends, field labels on forms (at 500).
- **Label** (500, 0.75rem, 0.06em, uppercase, Muted Slate): field labels above a value and table column headers.
- **Stamp** (700, 0.6875rem, 0.08em, uppercase): text inside stamps only.

### Named Rules
**The Tabular Figures Rule.** Every amount, percentage, step number and reference uses tabular figures so columns line up.

**The Label Names A Value Rule.** The uppercase field label always sits directly above the value or control it names. It is never a decorative line above a heading.

## Layout

Every page uses one shared width: up to 90rem (1440px), centred, with side padding of 16px on phones, 24px from 640px, 32px from 1024px and 40px from 1536px. Main content has 32px top and bottom padding, 40px from 640px and 48px from 1024px. Prose, descriptions and simple lists stay within about 42 to 48rem even on wide screens.

Pages are a stack of sections 40px apart. Each section opens with a hairline rule, 24px of space and its heading, then content 16px below. The page title is closed by its own rule, 24px below it.

Field rows measure their own width (container queries). In narrow space they sit in a two-column grid with 24px gaps; when there is room they run on one line, each field after the first split off by a vertical hairline and 20px padding. Short rows join the line sooner than long ones.

The header is white with a bottom rule. From 1024px it sticks to the top, at 90% white with a background blur, and the nav links sit inline beside the logo; below 1024px the links drop to their own ruled row with tighter padding and wrap if needed. Plan tabs scroll sideways on phones and centre the current tab. Step rows put the cost under the title on phones and move it into a fixed 240px right-aligned column from 1024px. Every interactive target is at least 44px tall.

## Elevation & Depth

Mostly flat, with a very soft lift. The grey page and white panels give the main sense of depth. Shadows are faint and cool (ink-tinted), never hard or offset. Sections inside a page are still split by rules, not wrapped in panels.

### Shadow Vocabulary
- **Panel rest** (`box-shadow: 0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.04)`): every white panel.
- **Panel lift** (`box-shadow: 0 4px 12px rgb(15 23 42 / 0.08)`): a panel that is a link, on hover, with a 1px rise and a Soft Edge border.
- **Emerald button** (`box-shadow: 0 1px 2px rgb(4 120 87 / 0.25)`, `0 4px 12px rgb(4 120 87 / 0.25)` on hover): the main button only.
- **Control hint** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.05)`): outline buttons and role cards.
- **Tooltip** (`box-shadow: 0 8px 24px rgb(15 23 42 / 0.10)`): chart tooltips.

### Named Rules
**The Rules Inside, Panels Around Rule.** A panel holds one bounded thing: a form, a table, a chat, a preview, a loader. Sections within a page are divided by hairline rules, not by more panels.

**The Soft Lift Rule.** Shadows stay at or below 10% opacity and lift at most 1px on hover. Nothing gets a hard or offset shadow.

## Shapes

Gently rounded corners on a 10px base. Buttons, inputs, notices and alerts use 10px; panels, the next-step band, role cards and empty states use 14px; skeleton bars use 8px; stamps use 4px; chart bars round their ends at 4px. Fully round shapes are kept for the progress bar, avatars, radio marks and numbered circles. Borders are 1px hairlines, with 1.5px for stamps, a 3px double rule for the OFFICIAL seal, a 2px underline for the current nav link or tab, and a dashed Soft Edge border for empty states.

## Components

### Buttons
Calm and solid: white or emerald, gently rounded.
- **Shape:** 10px corners; the standard size is 44px tall with 20px side padding and 16px text at 500.
- **Primary:** UAE Emerald with white text and a soft emerald shadow; Deep Emerald and a larger soft shadow on hover. One per page.
- **Outline:** white with a Soft Edge border, ink text and a hint of shadow; the border darkens (#94a3b8) and the fill goes to #f8fafc on hover. The default for secondary actions (Download PDF, Edit, Create account).
- **Ghost:** no border or fill; Quiet Fill on hover (Sign in).
- **Destructive:** white with an Error Red border and text; Error Wash on hover.
- **Link:** ink text with an emerald underline 4px below; the underline thickens to 2px on hover.
- **Press and focus:** buttons shrink to 97% while pressed (150ms ease-out). Focus shows the Focus Emerald edge plus a 3px ring at 50%. Busy buttons show the spinner. Icons are 16px line icons before the label.

### Stamps (status and fee marks)
Small rubber stamps, the system's only status chips.
- **Style:** 1.5px border in the tone colour, a light fill of the same family, uppercase bold 11px text, 4px corners, 3px by 6px padding.
- **Tones:** OFFICIAL (3px double Seal Amber rule, Seal Wash fill, Seal Ink text), DONE (emerald on Emerald Wash), waiting (slate #94a3b8 edge, #f8fafc fill, #334155 text), stopped (red on Error Wash), quiet (Hairline edge, Muted Slate text; used for DEMO FEE and To do). "Estimate" is plain small muted text, not a stamp.
- **Done:** a DONE stamp is tilted -2 degrees; when a step is just ticked it is pressed on (see Motion).

### Fee Legend
The key to the marks on a page of fees. It shows each mark in the same form as on the page, followed by a short meaning: OFFICIAL "checked against an official page", DEMO FEE "sample amount, not checked", Estimate "our guess", DONE "finished". It lists only the marks present.

### Field Rows
The licence header: uppercase label above a medium-weight tabular value, split by vertical hairlines when on one line. Used for the plan header, money summaries, step details and profiles.

### Ruled Tables
Full-width, 14px tabular text. Header row on Quiet Fill (70%) with uppercase labels; body rows split by hairlines with 12px by 16px cells; footer totals bold in ink above a rule. Tables sit in a bordered box or panel, so the last row has no rule.

### Panels
- **Corner Style:** 14px.
- **Background:** Panel White on Page Grey.
- **Shadow Strategy:** Panel rest; Panel lift for a panel that is a link.
- **Border:** 1px Hairline.
- **Internal Padding:** 20px, 24px from 640px.

### Inputs / Fields
- **Style:** white, 1px Field Edge border, 10px corners, 44px tall, 16px text, a visible 14px medium label above and an optional muted hint below.
- **Focus:** Focus Emerald edge plus a 3px ring at 50%.
- **Error:** red edge and a 3px red ring at 20%, with a red message and alert icon below. Form alerts are Error Wash boxes with a light red edge. Checkboxes are native, 20px, coloured emerald.
- **Long forms:** split into parts by hairline rules, each with a bold 18px legend.
- **Choice cards (role picker):** white 14px-corner cards with a custom radio; the chosen card gets an emerald edge, Emerald Wash fill and an emerald ring.

### Navigation
Text links with a 2px bottom rule: emerald rule and ink at 500 for the current section; transparent rule and Muted Slate otherwise; Soft Edge rule and ink on hover (200ms). The same grammar runs the main header and the plan tabs (Overview, Steps, Budget, Documents, Risks, Chat), which are real links. The logo is a 32px emerald square with "VG" in white beside the app name in bold.

### Next Step Band
The plan overview's lead block: Emerald Wash with a faint emerald edge (15%), 14px corners, 20 to 24px padding, a Headline, the numbered step title with its muted number, the cost with its mark, and an emerald-underlined link to all steps. The same band shape is used for the dashboard and profile notices.

### Step Row
A numbered roadmap step: a 44px checkbox target, the muted step number (1.1), the title as a button that unfolds the details, and the cost right-aligned. Rows are split by hairlines.

### Progress Bar
An 8px fully rounded Hairline track with an emerald fill, labelled with a tabular percentage. The fill grows from empty when the page opens (900ms).

### Loaders
- **Spinner:** a 16px arc in the text colour that runs round and stretches (1.4s), for busy buttons.
- **Road loader:** for long waits such as building a roadmap. A dotted road is drawn through four stops in emerald and each stop turns emerald and pops as the line reaches it, like steps of a plan (2.6s loop), with a muted label below.
- **Skeleton:** grey bars (#eef1f5) with a soft light passing over them (1.6s), 8px corners.
- **Late start:** loaders wait 180ms before fading in, so fast pages never flash one.
- **Page loading bar:** a 3px emerald bar with a soft emerald glow along the top of the window; it creeps towards 90% while the next page loads, then fades out.

### Motion
All UI motion uses one ease-out curve, cubic-bezier(0.16, 1, 0.3, 1), and short times:
- Colour and border changes: 150 to 200ms.
- Page enter: each page fades in and rises 6px (320ms).
- Details: folded sections open and close smoothly (260ms) where the browser supports it.
- Stamp press: ticking a step presses the DONE stamp on (240ms, from 1.4 scale and -8 degrees with no opacity to rest at -2 degrees).
- Chart bars grow in (600ms).
- Reduced motion: every animation and transition is cut to almost nothing.

## Do's and Don'ts

### Do:
- **Do** put content on the soft grey page and use a white panel only for one bounded thing.
- **Do** divide sections with hairline rules and 40px of space.
- **Do** use exactly one solid emerald button per page; make every other action an outline, ghost or link.
- **Do** show OFFICIAL only on administrator-checked fees, DEMO FEE on demo amounts, and Estimate otherwise, with a legend that names only the marks shown.
- **Do** put an uppercase 12px field label directly above the value it names, and set every figure in tabular numerals.
- **Do** write status in words inside a stamp, so colour is never the only signal.
- **Do** keep touch targets at least 44px and show the emerald focus ring on every interactive element.
- **Do** use the shared ease-out curve and keep UI motion between 150 and 320ms, and respect reduced motion.
- **Do** keep the footer line saying the site is not a government service.

### Don't:
- **Don't** bring back the gold palette: gold or amber is for the OFFICIAL seal only, never for buttons, links or tabs.
- **Don't** use purple, violet, gradients or a gradient logo.
- **Don't** use hard, offset or strong shadows; keep them soft and cool.
- **Don't** build stat tiles or icon cards; status is a 4px-cornered stamp.
- **Don't** place an uppercase label above a heading as an eyebrow or kicker; labels name values.
- **Don't** use emerald, red or amber for decoration.
- **Don't** use government emblems, falcons or claims of being official.
- **Don't** colour chart labels in the bar colour.
