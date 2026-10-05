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
  emerald-glow: "#34d399"
  emerald-wash: "#ecfdf5"
  emerald-selection: "#d1fae5"
  night-emerald: "#053d30"
  chart-estimated: "#45c093"
  seal-amber: "#d97706"
  seal-ink: "#b45309"
  seal-wash: "#fffbeb"
  logo-amber: "#fbbf24"
  error-red: "#b91c1c"
  error-wash: "#fef2f2"
typography:
  hero:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  number:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"tnum\""
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.04em"
  stamp:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
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
  2xl: "18px"
  3xl: "22px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  panel: "20px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
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
  panel-header:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    padding: "16px 24px"
  stat:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.number}"
    rounded: "{rounded.xl}"
    padding: "24px"
  next-step-number:
    backgroundColor: "{colors.emerald-wash}"
    textColor: "{colors.emerald}"
    rounded: "{rounded.lg}"
    size: "40px"
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
    padding: "12px 24px"
  header:
    backgroundColor: "{colors.panel}"
    height: "64px"
  nav-link-active:
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    padding: "0 12px"
  nav-pill-active:
    backgroundColor: "{colors.emerald-wash}"
    textColor: "{colors.emerald-deep}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  plan-tab-active:
    textColor: "{colors.emerald}"
    typography: "{typography.body-small}"
    padding: "12px 12px"
  role-tab-active:
    backgroundColor: "{colors.emerald}"
    textColor: "{colors.panel}"
    rounded: "{rounded.full}"
    height: "44px"
  chat-bubble-mine:
    backgroundColor: "{colors.emerald}"
    textColor: "{colors.panel}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "10px 16px"
  chat-bubble-theirs:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "10px 16px"
  brand-surface:
    backgroundColor: "{colors.night-emerald}"
    textColor: "{colors.panel}"
    rounded: "{rounded.3xl}"
    padding: "64px 48px"
  logo-mark:
    backgroundColor: "{colors.emerald}"
    rounded: "9px"
    size: "32px"
  progress-bar:
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.full}"
    height: "8px"
---

# Design System: UAE Venture Guide

## Overview

**Creative North Star: "Emerald and Ink"**

Every page is a clean licence file laid on a soft grey desk. The page is light grey. Content sits in white panels with a thin edge and a very soft shadow; the panel is the one container of the app. Text is near-black ink. One emerald colour, the green of the UAE flag, marks the main button, links, the current section and anything that is done. A small amber seal is kept for one job, the OFFICIAL mark on a fee that was checked; the only other amber is the stop on the logo.

The document feel stays inside the panels. A plan opens with its title and a row of labelled fields (Emirate, Sector, Licence, Budget, Reference, Issued). Steps are numbered (1, 1.1, 1.2), money lines up in tabular columns, tables are ruled, and status is shown by small rubber stamps whose words carry the meaning. The site never claims to be a government service.

The brand has a road in it. The logo is a winding white road on an emerald tile, running from a dark start stop to an amber end stop. The same road is drawn by the page loader and by the empty-state picture.

The mood is calm, modern and friendly. Two typefaces share the work: Geist for all text, Bricolage Grotesque for the logo, page titles and big numbers. Motion is quick and soft: pages slide up a few pixels, cards rise in one after another, the nav highlight slides between links, and home page sections fade up as you scroll. Everything turns off with the "reduce motion" setting.

**Key Characteristics:**
- Soft grey page, white panels with a hairline edge and a barely-there shadow.
- Near-black ink for text; slate grey for secondary text.
- Emerald for the one main action, links, the current section, progress and done.
- Amber only in the OFFICIAL seal and the logo's end stop; red only for errors and stopped states.
- Geist for text, Bricolage Grotesque for titles and big numbers, tabular figures for every amount.
- Every page built from one layout kit: page header, panels, a right-hand column, card grids, stat rows.
- Night Emerald brand surfaces only on the sign-in side panel and the home page's closing band.
- Short, soft motion (150 to 420ms, one ease-out curve) that turns off with reduced motion.

## Colors

A cool, near-neutral palette: ink on white over a soft grey page, with emerald as the single voice for action and progress.

### Primary
- **UAE Emerald** (emerald): the main button on a page, link underlines, the active nav line, the current plan tab, the role-tab pill, my chat bubbles, checkbox and caret colour, the progress fill, the DONE stamp, the "actual" chart bar, the logo tile and the loading bar. 5.5:1 on white. Darkens to **Deep Emerald** (emerald-deep) on button hover; Deep Emerald is also the text colour on Emerald Wash.
- **Focus Emerald** (emerald-focus): keyboard focus, shown as the field edge plus a 3px ring at 50% opacity, and as the glow under the loading bar. Never used for text on white.
- **Glow Emerald** (emerald-glow): decoration on the home and sign-in pages only: the soft blurred glow on Night Emerald, the live dot beside it, and the dots between emirate names. Never text on white.
- **Emerald Wash** (emerald-wash): the active pill in the phone nav row, the next-step number tile, plan-card icon tiles, avatars, tick circles, the chosen role card and the DONE stamp fill.
- **Emerald Selection** (emerald-selection): text selection only.
- **Light Emerald** (chart-estimated): the "estimated" bar in plan and post charts. Never text.
- **Night Emerald** (night-emerald): the brand surface. Used for the left half of the sign-in and sign-up pages and the closing call-to-action band on the home page. White text on it; secondary text is pale emerald at 60 to 80% opacity.

### Secondary
- **Seal Amber** (seal-amber): the double-ruled border of the OFFICIAL seal.
- **Seal Ink** (seal-ink): the word OFFICIAL inside the seal. 5.0:1 on white. **Seal Wash** (seal-wash) is the seal's fill.
- **Logo Amber** (logo-amber): the end stop of the road in the logo and favicon. Nowhere else.

### Tertiary
- **Error Red** (error-red): error messages, invalid field edges, declined or stopped stamps, the Delete button, an over-budget figure (including a red Stat) and a "High" risk level. 6.5:1 on white. **Error Wash** (error-wash) is its hover and alert surface.

### Neutral
- **Page Grey** (page): the background of every signed-in and public page.
- **Panel White** (panel): panels, the header (at 85% with a blur), inputs, outline buttons, the auth form side and the home page's banded sections.
- **Ink** (ink): all text, headings and values. 17.9:1 on white.
- **Muted Slate** (ink-muted): descriptions, field labels, step numbers, hints, inactive nav links, chart labels and legends. 7.6:1 on white.
- **Quiet Fill** (quiet-fill): table header rows, ghost-button hover, panel footers (at 70%), the chat log background.
- **Hairline** (hairline): panel edges, panel header and footer rules, list and table row rules, chart gridlines, the progress track.
- **Soft Edge** (soft-edge): the outline-button border, the dashed empty-state border and the hover edge of link panels.
- **Field Edge** (field-edge): form-control borders (3.2:1, enough for a control edge).

### Named Rules
**The One Emerald Action Rule.** A view has at most one solid emerald button in its main content. Every other action is a white outline button, a ghost button or a link. The header's "Create account" and the active role tab are the standing exceptions.

**The Earned Seal Rule.** The amber OFFICIAL seal appears only on a fee an administrator checked against a cited official page. Demo amounts carry DEMO FEE; everything else says Estimate. The fee legend names only the marks shown on the page.

**The State Colours Rule.** Emerald means action or done, red means error or stopped, amber means checked-official. Inside the app none of them is used for decoration; decorative emerald glow lives only on the home and sign-in pages.

**The Emerald Chart Rule.** Plan charts use Light Emerald for estimated and UAE Emerald for actual. The two differ in lightness, so every kind of colour vision can tell them apart. Labels, legends and axis text are Muted Slate, never the bar colour, and gridlines are Hairline.

## Typography

**Display Font:** Bricolage Grotesque (600, 700, 800; served by next/font as `--font-display`)
**Body Font:** Geist (served by next/font as `--font-sans`)
**Label/Mono Font:** Geist, uppercase and tracked for labels; a system monospace is set but not part of the look.

**Character:** Geist is plain and clear at small sizes, with even figures for money. Bricolage Grotesque is friendly and a little quirky; it gives the logo, titles and big numbers their character. Bricolage is never used for running text, buttons or labels.

### Hierarchy
- **Hero** (Bricolage 700, 2.5rem on phones, 3.75rem from 640px, 4.5rem from 1280px, line-height 1.02, -0.04em): the home page headline only, with its last phrase in emerald.
- **Display** (Bricolage 700, 1.875rem on phones, 2.25rem from 640px, line-height 1.15, -0.03em): the page title in every PageHeader, once per page. The plan title uses the same face at 1.75rem to 2.125rem. Home section headings use it at 2rem to 2.5rem, and the brand surfaces at 2rem to 3rem.
- **Number** (Bricolage 700, 1.375rem on phones, 1.875rem from 640px, -0.02em, tabular): the figure in a Stat, plus big figures in home and auth pictures.
- **Headline** (Geist 600, 1.0625rem, -0.01em): panel titles in the panel header row.
- **Title** (Geist 600, 1.125rem): the next step's title, card titles, empty-state headings and form-part legends.
- **Body** (Geist 400, 1rem): prose and chat messages; descriptions stay within about 42rem. Field values at 500 with tabular figures.
- **Body small** (Geist 400, 0.875rem, tabular figures): tables, costs, navigation, hints, legends and panel descriptions.
- **Label** (Geist 500, 0.75rem, 0.04em, uppercase, Muted Slate): field labels above a value. Table column headers use the same at 0.06em.
- **Stamp** (Geist 700, 0.6875rem, 0.08em, uppercase): text inside stamps only.

### Named Rules
**The Two Faces Rule.** Bricolage Grotesque is for the wordmark, h1 titles, home and brand headings and big numbers. Everything you read in a sentence, click or fill in is Geist.

**The Tabular Figures Rule.** Every amount, percentage, step number and reference uses tabular figures so columns line up.

**The Label Names A Value Rule.** The uppercase field label always sits directly above the value, control or message it names. It is never a decorative line above a heading.

## Layout

Every page uses one shared width: up to 90rem (1440px), centred, with side padding of 16px on phones, 24px from 640px, 32px from 1024px and 40px from 1536px. Main content has 32px top and bottom padding, 40px from 640px and 48px from 1024px.

### The layout kit
Pages are built only from the layout kit (`src/components/layout.jsx`); spacing lives in the kit, not on the pages.
- **PageHeader:** an optional back link, the Display title, a muted line under it (max about 42rem), and the page's buttons on the right from 768px (below the title on phones). 32px below it, 40px from 1024px.
- **Panel:** the one container. An optional header row (Headline title, small description, buttons) above a hairline; a body with 20px padding (24px from 640px); an optional footer on Quiet Fill. `flush` drops the body padding for lists and tables.
- **Stack:** panels stacked 24px apart, 32px from 1024px.
- **Split:** from 1024px, the main column and a right column of 20rem (23rem from 1280px), 24px apart (32px from 1024px). On phones the right column comes after the main one. The right column does not stick while scrolling.
- **CardGrid:** one column on phones, two from 640px, three from 1280px (or two at most); 16px gaps, 24px from 1024px. Cards rise in one after another.
- **ListPanel / TablePanel:** rows or a table edge to edge inside a flush panel. Tables scroll sideways inside their panel on small screens.
- **StatGrid / Stat:** two numbers side by side on phones, four in a row from 1024px.
- **FormActions:** the buttons at the end of a form, in one row, 12px apart.

### Three page shapes
- **List pages:** PageHeader, an optional filter bar, then a CardGrid, ListPanel or TablePanel.
- **Detail and form pages:** PageHeader, then Split: main panels on the left, help or facts on the right.
- **Dashboards:** PageHeader, then StatGrid, then Split or a two-column grid of panels.

### Header and navigation
The header sticks to the top at every size. It is 64px tall, white at 85% with a background blur, with a hairline under it. From 1024px the nav links sit inline beside the logo. Below 1024px the links move to their own row under a hairline, a single line of pills that scrolls sideways with no scrollbar. The signed-in user's name and role show from 1280px.

### Auth and home
Sign-in, sign-up and password pages are a split screen from 1024px: the Night Emerald showcase on the left, the white form side on the right, the form at most 28rem wide. Below 1024px only the form side shows, with the logo on top.

The home page is a run of full-width sections, alternating Page Grey and white bands split by hairlines, each 80px tall in padding (112px from 640px), with centred section headings. The hero is two columns from 1024px (text left, an example plan picture right) over a faint dot grid that fades down.

### Named Rules
**The Kit Not The Page Rule.** A page never sets its own gaps or panel padding. If a page needs a new shape, the kit gets a new piece.

**The 44px Rule.** Every interactive target is at least 44px tall, including nav pills, tabs and the chat Send button.

## Elevation & Depth

Mostly flat, with a very soft lift. The grey page and white panels give the main sense of depth. Inside the app, shadows are faint and cool (ink-tinted), never hard or offset. The home page and the sign-in showcase may go deeper, to make their pictures of the app float.

### Shadow Vocabulary
- **Panel rest** (`box-shadow: 0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.04)`): every white panel, stat and other-person chat bubble.
- **Panel lift** (`box-shadow: 0 4px 12px rgb(15 23 42 / 0.08)`): a panel that is a link, on hover, with a 1px rise and a Soft Edge border.
- **Emerald button** (`box-shadow: 0 1px 2px rgb(4 120 87 / 0.25)`, `0 4px 12px rgb(4 120 87 / 0.25)` on hover): the main button only.
- **Control hint** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.05)`): outline buttons, role cards, the role tab bar.
- **Toast and tooltip** (`box-shadow: 0 8px 24px rgb(15 23 42 / 0.12)`): toasts; chart tooltips use the same at 10%.
- **Showcase window** (`box-shadow: 0 24px 60px -12px rgb(15 23 42 / 0.18)`): the example plan window on the home page, with the floating cards beside it on a large soft shadow.
- **Header blur:** the sticky header is see-through white with a large background blur; no shadow.

### Named Rules
**The Panel Is The Container Rule.** Content lives in panels. A panel holds one topic with its own header row; inside it, rows and sections are split by hairlines, not by more panels.

**The Soft Lift Rule.** Inside the app, shadows stay at or below 12% opacity and lift at most 1px on hover. The deeper showcase shadows belong to the home and sign-in pictures only. Nothing gets a hard or offset shadow.

## Shapes

Gently rounded corners on a 10px base. Buttons, inputs, alerts and the next-step number tile use 10px; panels, stats, cards, empty states and role cards use 14px; chat bubbles, the home example window and the FAQ box use 18px, with the corner nearest the speaker cut to 8px; the home call-to-action band uses 22px. Stamps use 4px; skeleton bars 8px; the logo tile has 9px corners on a 32px square. Fully round shapes are kept for pills (phone nav, role tabs), avatars, the progress bar, tick circles and numbered circles.

Borders are 1px hairlines, with 1.5px for stamps, a 3px double rule for the OFFICIAL seal, a 2px line for the active nav link and plan tab, and a dashed Soft Edge border for empty states and the closed-chat note.

## Components

### Logo
- **Mark:** a 32px emerald tile with 9px corners and a faint lighter top-left corner. A white winding road runs from a Deep Emerald stop with a white ring (bottom left) to a Logo Amber stop (top right). It tilts -6 degrees on hover.
- **Wordmark:** "UAE" in emerald and "Venture Guide" in ink, Bricolage Grotesque 700 at 16px (18px from 640px), -0.03em, beside the mark with 8 to 10px between. On Night Emerald the wordmark is white and "UAE" is pale emerald.
- **Favicons:** `icon.svg`, `apple-icon.png` and `favicon.ico` carry the same road drawing.

### Header and Navigation
- **Wide screens:** text links 14px in Muted Slate, ink on hover. The current link is ink at 500 with a 2px emerald line under it that slides from link to link when you move.
- **Phones and tablets:** the same links as a sideways-scrolling row of pills. The current link sits on an Emerald Wash pill with a faint emerald ring and Deep Emerald text; the pill slides the same way.
- **Plan tabs** (Overview, Steps, Budget, Documents, Risks, Chat): real links with a 2px bottom line; the current tab is emerald text on an emerald line, others Muted Slate with a Soft Edge line on hover. On phones the row scrolls sideways and centres the current tab.

### Page Header
The Display title, a muted description and the page's buttons. An optional back link sits above the title: a small muted arrow and label that slides left on hover.

### Buttons
Calm and solid: white or emerald, gently rounded.
- **Shape:** 10px corners; the standard size is 44px tall with 20px side padding and 16px text at 500. Home page calls to action are 48px tall with 24px padding.
- **Primary:** UAE Emerald with white text and a soft emerald shadow; Deep Emerald and a larger soft shadow on hover. A trailing arrow nudges right on hover.
- **Outline:** white with a Soft Edge border, ink text and a hint of shadow; the border darkens (#94a3b8) and the fill goes to #f8fafc on hover. The default for secondary actions.
- **Ghost:** no border or fill; Quiet Fill on hover (Sign in).
- **Destructive:** white with an Error Red border and text; Error Wash on hover.
- **Link:** ink text with an emerald underline 4px below; the underline thickens to 2px on hover.
- **Press and focus:** buttons shrink to 97% while pressed (150ms). Focus shows the Focus Emerald edge plus a 3px ring at 50%. Busy buttons show the spinner. Icons are 16px line icons.

### Panels
- **Corner Style:** 14px.
- **Background:** Panel White on Page Grey.
- **Shadow Strategy:** Panel rest; Panel lift for a panel that is a link.
- **Border:** 1px Hairline. The Next step panel has an emerald edge at 20 to 25%.
- **Header row:** Headline title, optional small description and buttons, 16px by 20px padding (24px sides from 640px), a hairline below.
- **Internal Padding:** 20px, 24px from 640px.
- **Footer:** Quiet Fill at 70% above a hairline.

### Stats
A panel with a Muted Slate label and a big Bricolage number below, with an optional muted hint. A stat can be a link (the whole card lifts) and can turn red for an amount over budget. Stats are numbers only, with no icons.

### Next Step
A panel titled "Next step" with a faint emerald edge. On the plan it shows the step number in a 40px Emerald Wash tile, the step title, a muted description and the cost with its mark; on dashboards it is the first panel of the right column, and a dashboard shows at most one.

### Stamps (status and fee marks)
Small rubber stamps, the system's only status chips.
- **Style:** 1.5px border in the tone colour, a light fill of the same family, uppercase bold 11px text, 4px corners, 3px by 6px padding.
- **Tones:** OFFICIAL (3px double Seal Amber rule, Seal Wash fill, Seal Ink text), DONE (emerald on Emerald Wash), waiting (slate #94a3b8 edge, #f8fafc fill, #334155 text), stopped (red on Error Wash), quiet (Hairline edge, Muted Slate text; DEMO FEE, To do, Example). "Estimate" is plain small muted text, not a stamp.
- **Done:** a DONE stamp is tilted -2 degrees; when a step is just ticked it is pressed on.

### Fee Legend
The key to the marks on a page of fees. It shows each mark in the same form as on the page, followed by a short meaning. It lists only the marks present.

### Field Rows
Uppercase label above a medium-weight tabular value. They measure their own width: a two-column grid when narrow, one line when there is room. Used in the plan header (on a Quiet Fill strip at the foot of the plan's title panel, beside the progress bar), money summaries, step details and profiles.

### Ruled Tables
Full-width, 14px tabular text. Header row on Quiet Fill (70%) with uppercase labels; body rows split by hairlines with 12px by 16px cells; footer totals bold in ink above a rule. The first and last columns line up with the panel header's padding (20px, 24px from 640px). The last row has no rule.

### Inputs / Fields
- **Style:** white, 1px Field Edge border, 10px corners, 44px tall, 16px text, a visible 14px medium label above and an optional muted hint below.
- **Focus:** Focus Emerald edge plus a 3px ring at 50%.
- **Error:** red edge and a 3px red ring at 20%, with a red message and alert icon below. Form alerts are Error Wash boxes with a light red edge. Checkboxes are native, 20px, coloured emerald.
- **Choice cards (role picker):** white 14px-corner cards; the chosen card gets an emerald edge, Emerald Wash fill and an emerald ring.

### Mentor Conversation
A chat between a founder and a mentor, inside a flush panel.
- **Log:** a Quiet Fill area at most 60% of the screen tall, scrolling, newest at the bottom, 20px between messages.
- **My messages:** on the right, emerald bubbles with white text, 18px corners with the bottom-right corner cut to 8px.
- **Their messages:** on the left, white panel bubbles with the bottom-left corner cut to 8px.
- **Bubbles:** at most 85% wide (75% from 640px), 16px text, relaxed line height. The first bubble is the original request, with a small uppercase "Original request" label inside it.
- **Under each bubble:** the sender's name in 500 and the time, in 12px Muted Slate.
- **Write box:** a labelled textarea and an emerald Send button below a hairline. Enter sends, Shift+Enter adds a line. A closed chat shows a dashed note with a lock icon instead.

### Empty State
A dashed Soft Edge box on 70% white with 14px corners, a small dotted road drawing from an emerald stop to an open one, a Title, a muted line and an optional button.

### Progress Bar
An 8px fully rounded Hairline track with an emerald fill, labelled with a tabular percentage. The fill grows from empty when the page opens.

### Loaders
- **Spinner:** a 16px arc that runs round and stretches (1.4s), for busy buttons.
- **Road loader:** a road is drawn through four stops, each turning emerald and popping as the line reaches it (2.6s loop).
- **Skeleton:** grey bars (#eef1f5) with a soft light passing over them (1.6s), 8px corners.
- **Late start:** loaders wait 180ms before fading in.
- **Page loading bar:** a 3px emerald bar with a soft glow along the top of the window while the next page loads.

### Auth Showcase
The Night Emerald half of the sign-in pages: the logo in white, a Bricolage promise ("Your UAE business, one clear step at a time.") at 2.5rem to 3rem, a pale emerald line under it, and a small frosted-glass plan (white at 7% with a blur and a 15% white edge) whose first two steps tick themselves off. Behind it are a soft emerald glow and a faint 40px grid that fades at the edges. The disclaimer sits at the bottom.

### Home Page Pieces
- **Hero picture:** an example plan in an app window (window bar, title, progress, numbered steps with fees and stamps), with two small floating cards (budget bars, a mentor message) that bob gently.
- **Emirates strip:** the seven emirate names in Bricolage, slate, split by emerald dots, sliding past in a loop that pauses on hover, faded at both ends.
- **Feature cards:** link panels in a zigzag grid (wide and narrow); each has a 40px Emerald Wash icon tile, a Title, a muted line and a small real picture of the feature.
- **How it works:** three numbered emerald tiles (48px, 18px corners, Bricolage numbers) joined by a dashed line.
- **Role tabs:** a white pill bar with an emerald pill that slides to the chosen role; the panel below fades across.
- **Questions:** a bordered 18px-corner box of folding questions with a chevron that turns.
- **Closing band:** a Night Emerald band with 22px corners, a glow and a faint grid, a Bricolage heading and a white button with Night Emerald text.

### Motion
All UI motion uses one ease-out curve, cubic-bezier(0.16, 1, 0.3, 1), unless it is a spring.
- **Colour and border changes:** 150 to 200ms.
- **Page enter:** each page fades in and rises 6px (320ms).
- **Card entrance:** cards in a CardGrid or StatGrid rise 10px one after another (420ms, 40ms apart, up to 280ms).
- **Panel-link hover:** a 1px rise, a darker edge and a larger soft shadow (200ms).
- **Nav and tabs:** the active nav line, phone nav pill and role-tab pill slide with a spring (motion library, shared layout).
- **Home page:** the headline and buttons rise in turn (600ms, 80ms apart); the example window rises in (700ms); its first steps tick (360ms); budget bars grow (600ms); sections fade up as they scroll into view where the browser supports it; the emirates strip loops every 40s; floating cards bob 8px over 6s.
- **Sign-in:** the showcase plan bobs and its first two steps tick in (420ms each, half a second apart).
- **Details:** folded sections open and close smoothly (260ms).
- **Stamp press:** ticking a step presses the DONE stamp on (240ms).
- **Reduced motion:** the CSS media query cuts every animation and transition to almost nothing, scroll reveals simply show, and the motion library follows the same setting through MotionProvider.

## Do's and Don'ts

### Do:
- **Do** build every page from the layout kit and pick one of the three page shapes: list, detail or form with a right column, or dashboard.
- **Do** put content in white panels on the soft grey page, and split rows inside a panel with hairlines.
- **Do** use one solid emerald button in a view's main content; make every other action an outline, ghost or link.
- **Do** use Bricolage Grotesque only for the wordmark, page titles, home and brand headings and big numbers; Geist for everything else.
- **Do** show OFFICIAL only on administrator-checked fees, DEMO FEE on demo amounts, and Estimate otherwise, with a legend that names only the marks shown.
- **Do** put an uppercase field label directly above the value it names, and set every figure in tabular numerals.
- **Do** write status in words inside a stamp, so colour is never the only signal.
- **Do** keep touch targets at least 44px and show the emerald focus ring on every interactive element.
- **Do** use the shared ease-out curve, keep UI motion short, and make every new animation respect reduced motion.
- **Do** keep the line saying the site is not a government service in the footer and on the sign-in pages.

### Don't:
- **Don't** use gold or amber for buttons, links, tabs or decoration; amber is for the OFFICIAL seal and the logo's end stop only.
- **Don't** use purple or violet, and don't put gradient fills on buttons, text, panels or the logo mark.
- **Don't** use emerald glows, grids or Night Emerald inside the signed-in app; they belong to the home and sign-in pages.
- **Don't** use hard or offset shadows anywhere, and don't use the deep showcase shadows inside the app.
- **Don't** put icons in stats; a stat is a label and a number.
- **Don't** place an uppercase label or pill above a heading as an eyebrow or kicker; labels name values.
- **Don't** make the Split's right column sticky.
- **Don't** set page-level gaps or panel padding by hand; use the kit.
- **Don't** use government emblems, falcons or claims of being official.
- **Don't** colour chart labels in the bar colour.
