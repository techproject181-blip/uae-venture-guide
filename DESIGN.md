---
name: UAE Venture Guide
description: A business plan that reads like a clean official UAE document.
colors:
  paper: "#ffffff"
  ink: "#232528"
  ink-muted: "#5f646d"
  quiet-fill: "#f7f7f7"
  hairline: "#e1e3e5"
  field-edge: "#797e86"
  gold: "#7c5e24"
  gold-hover: "#6a5020"
  gold-focus: "#92722a"
  seal-gold: "#b68a35"
  gold-wash: "#f9f7ed"
  gold-selection: "#f2eccf"
  done-green: "#2f663c"
  done-wash: "#f3faf4"
  error-red: "#b52520"
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
    lineHeight: 1.625
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
  hairline: "2px"
  stamp: "3px"
  md: "4.8px"
  lg: "6px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.gold-hover}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.quiet-fill}"
  button-destructive:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.error-red}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-destructive-hover:
    backgroundColor: "{colors.error-wash}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "44px"
  stamp-official:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.gold}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  stamp-done:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.done-green}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  stamp-quiet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
  next-step-band:
    backgroundColor: "{colors.gold-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px 24px"
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
    rounded: "{rounded.hairline}"
    height: "6px"
---

# Design System: UAE Venture Guide

## Overview

**Creative North Star: "The Licence Paper"**

Every screen is a page of an official UAE document: a trade licence or certificate printed on white paper in black ink. A plan opens with a title, a row of labelled fields (Emirate, Sector, Licence, Budget, Reference, Issued), then sections separated by thin rules. Steps are strictly numbered (1, 1.1, 1.2), figures line up in tabular columns, and the only marks of authority are small rubber stamps: a double-ruled gold OFFICIAL seal, a green DONE, a grey DEMO FEE.

The palette is taken from the UAE Government Design System scales (AE Black, AE Gold, AE Green, AE Red), but the site never claims to be official: no emblems, no falcons, and the footer says "Not a government service." Density is calm and document-like: one column, generous rules, few things per screen. The system is a deliberate rejection of the earlier SaaS look: no purple, no gradients, no stat tiles, no icon cards, no pill badges, no shadows.

**Key Characteristics:**
- White paper, AE Black ink, hairline rules between sections instead of cards.
- AE Gold reserved for the one main action, link underlines, the active-tab rule and the OFFICIAL seal.
- Small uppercase field labels above values, like the field names on a licence.
- Rubber-stamp status marks whose words always carry the meaning, never colour alone.
- Roboto throughout, with tabular figures for every amount and step number.
- Flat: no shadows anywhere; depth comes from rules and quiet fills.

## Colors

A near-monochrome document palette: ink on paper, with gold as the single voice of authority and action, and green and red reserved for state.

### Primary
- **Licence Gold** (#7c5e24, AE Gold 700): the main button on a page, link underlines, the active navigation and tab rule, the checkbox and caret accent, and the ink of the OFFICIAL seal. Darkens to **Pressed Gold** (#6a5020) on button hover. 6.0:1 on white.
- **Seal Gold** (#b68a35, AE Gold 500): only the double-ruled border of the OFFICIAL seal and the border of the VG logo mark. Never text.
- **Focus Gold** (#92722a, AE Gold 600): keyboard focus rings and focused field edges.
- **Gold Wash** (#f9f7ed, AE Gold 50): the background of the "Next step" band on the plan overview; the one tinted surface in the system.
- **Selection Gold** (#f2eccf, AE Gold 100): text selection only.

### Secondary
- **Done Green** (#2f663c, AE Green 700): finished, approved or accepted: the DONE stamp, the progress bar fill, the done-step checkbox, "3 of 3 done". 6.8:1 on white. **Done Wash** (#f3faf4) is its quiet surface.

### Tertiary
- **Error Red** (#b52520, AE Red 700): errors, declined or stopped states, the Delete button outline, and an over-budget figure. 6.5:1 on white. **Error Wash** (#fef2f2) is its hover and alert surface.

### Neutral
- **Paper** (#ffffff): page, header and every container.
- **AE Black Ink** (#232528, AE Black 800): all text, headings, values, and the "Actual" chart bar. 15.4:1 on white.
- **Muted Ink** (#5f646d, AE Black 500): descriptions, field labels, step numbers, chart axis labels. 6.0:1.
- **Field Edge** (#797e86, AE Black 400): form-control borders (4.1:1) and the "Estimated" chart bar.
- **Hairline** (#e1e3e5, AE Black 100): every rule between sections, rows and table cells; the progress-bar track.
- **Quiet Fill** (#f7f7f7, AE Black 50): table header rows, the guidance notice, button and tab hover.

### Named Rules
**The One Gold Action Rule.** A page has at most one solid gold button. Every other action is a black outline box, like a box on a printed form.

**The Earned Seal Rule.** The OFFICIAL seal appears only on a fee an administrator checked against a cited official page. Demo amounts carry DEMO FEE; everything else says Estimate. The fee legend names only the marks present on the page.

**The State Colours Rule.** Green means done and red means error or stopped, everywhere; neither is used for decoration.

**The Grey Chart Rule.** Plan charts are drawn in Field Edge grey (estimated) and AE Black ink (actual) on hairline gridlines, with labels in Muted Ink, never in the bar colour.

## Typography

**Display Font:** Roboto (via next/font, with system sans fallback)
**Body Font:** Roboto
**Label/Mono Font:** Roboto, uppercase and tracked for labels; no separate mono face in use.

**Character:** one plain, legible face, the UAE Government Design System's text face, doing every job by weight and size alone, like a typeset form.

### Hierarchy
- **Display** (700, 1.75rem on phones, 2rem from 640px, line-height 1.25, -0.01em): the page or plan title, once per page.
- **Headline** (700, 1.25rem, -0.01em): section headings such as Money, Licence, Roadmap, Next step.
- **Title** (500, 1.125rem): the next step's title; form part legends use the same size at 700.
- **Body** (400, 1rem, relaxed 1.625 in prose): prose capped at about 42rem (max-w-2xl); field values at 500 with tabular figures.
- **Body small** (400, 0.875rem, tabular figures): tables, costs, navigation, hints, legends.
- **Label** (500, 0.75rem, 0.06em, uppercase, Muted Ink): field labels above a value and table column headers.
- **Stamp** (700, 0.6875rem, 0.08em, uppercase): text inside stamps only.

### Named Rules
**The Tabular Figures Rule.** Every amount, percentage, step number and reference uses tabular figures so columns align from row to row.

**The Label Names A Value Rule.** The uppercase field label always sits directly above the value or control it names. It is never a decorative line above a heading.

## Layout

One centred column, max 72rem (1152px), with 16px side padding on phones and 24px from 640px; main content has 32px top and bottom padding (40px from 640px). Pages are a stack of sections 40px apart; each section opens with a hairline rule, 24px of space, its heading, then content 16px below. Prose and simple lists stay within about 42rem even on wide screens.

Field rows measure their own width (container queries): in narrow space they sit in a two-column grid with 24px gaps; when there is room they run on one line, each field after the first separated by a vertical hairline and 20px padding. Short rows join the line sooner than long ones.

Navigation lives in a header with a bottom rule. From 768px the links sit inline beside the logo; on phones they drop to their own ruled row with tighter padding, wrapping if needed. Plan tabs scroll sideways on phones and centre the current tab. Step rows stack the cost below the title on phones and move it into a fixed 240px right-aligned column from 1024px, so amounts line up. Every interactive target is at least 44px tall.

## Elevation & Depth

Flat. There are no shadows anywhere, including toasts and chart tooltips, which explicitly set none. Depth is conveyed by hairline rules, a 1px border around boxed content (tables, forms, the guidance notice), the Quiet Fill on header rows, and the single Gold Wash band for the next step.

### Named Rules
**The Rules Not Cards Rule.** Sections are divided by hairline rules, not wrapped in cards. A border box is used only where content is a bounded object: a table, a form being filled in, a notice, an empty state.

## Shapes

Restrained, slightly softened corners. Buttons, panels, notices and the next-step band use 4.8px; form controls use 6px; stamps and the logo mark use 3px; the progress bar and chart bars use 2px. Circles appear only for avatars and radio marks. Borders are 1px hairlines, with 1.5px for stamps, a 3px double rule for the OFFICIAL seal, a 2px underline for active navigation, and a dashed 1px ink border (30% opacity) for empty states.

## Components

### Buttons
Printed-form boxes: plain, bordered, firm.
- **Shape:** gently squared corners (4.8px); standard height 44px with 20px side padding and 16px text at 500 weight.
- **Primary:** solid Licence Gold with white text; darkens to Pressed Gold on hover. One per page.
- **Outline:** white with an AE Black border at 80% opacity and ink text; Quiet Fill on hover. The default for every secondary action, including Download PDF, Share with funders, Edit, Sign out.
- **Destructive:** white with an Error Red border and text; Error Wash on hover.
- **Link:** ink text with a gold underline offset 4px; the underline thickens to 2px on hover.
- **Focus:** Focus Gold border plus a 3px ring at 50% opacity. Icons are line icons, 16px, leading the label.

### Stamps (status and fee marks)
Small rubber stamps, the system's only chips.
- **Style:** white, 1.5px border in the tone colour, uppercase bold 11px text, 3px corners, 3px by 6px padding.
- **Tones:** OFFICIAL (3px double Seal Gold rule, Licence Gold text), DONE (green), waiting (ink at 70%), stopped (red), quiet (hairline border, Muted Ink; used for DEMO FEE and To do). "Estimate" is plain small muted text, not a stamp.
- **Done:** a DONE stamp is tilted -2 degrees.

### Field Rows
The licence header: uppercase label above a medium-weight tabular value, split by vertical hairlines when on one line. Used for the plan header, money summaries, step details and profiles.

### Ruled Tables
Full-width, 14px tabular text. Header row on Quiet Fill with uppercase labels and a darker rule (ink at 20%); body rows split by hairlines with 12px by 16px cells; footer totals bold in ink above a darker rule. Tables sit in a bordered box, so the last row has no rule.

### Inputs / Fields
- **Style:** white, 1px Field Edge border, 6px corners, 44px tall, 16px text, a visible 14px medium label above and an optional muted hint below.
- **Focus:** Focus Gold border plus a 3px Focus Gold ring at 50%.
- **Error:** red border and 3px red ring at 20%, with a red message and alert icon below. Checkboxes are native, 20px, accented in gold (green for step completion).
- **Long forms:** split into fieldset parts by hairline rules, each with a bold 18px legend.

### Navigation
Text links with a 2px bottom rule: Licence Gold and ink at 500 weight for the current section, transparent rule and Muted Ink otherwise, ink on hover. The same grammar runs the main header and the plan tabs (Overview, Steps, Budget, Documents, Risks, Chat), which are real links.

### Next Step Band
The plan overview's lead block: Gold Wash background, 4.8px corners, 20 to 24px padding, a Headline, the numbered step title with its muted number, the cost with its mark, and a gold-underlined link to all steps.

### Step Row
A numbered roadmap step: 44px checkbox target, muted step number (1.1), the title as a button that unfolds details (description, field row, official sources, status select, Edit), a chevron that turns, and the cost aligned right. Rows are split by hairlines.

### Progress Bar
A 6px hairline track with a Done Green fill and 2px corners, labelled "4 of 15 steps done" with a tabular percentage.

### Motion
One moving moment: ticking a step presses the DONE stamp on (240ms, cubic-bezier(0.16, 1, 0.3, 1), from 1.4 scale and -8 degrees with no opacity to rest at -2 degrees). Everything else is colour transitions only, and reduced motion removes all animation.

## Do's and Don'ts

### Do:
- **Do** divide sections with hairline rules (#e1e3e5) and 40px of space, not cards.
- **Do** use exactly one solid gold button per page; make every other action an outline box.
- **Do** show OFFICIAL only on administrator-checked fees, DEMO FEE on demo amounts, and Estimate otherwise, with a legend that names only the marks shown.
- **Do** put an uppercase 12px field label directly above the value it names, and set every figure in tabular numerals.
- **Do** write status in words inside a stamp, so colour is never the only signal.
- **Do** keep touch targets at least 44px and show the gold focus ring on every interactive element.
- **Do** keep the footer line saying the site is not a government service.

### Don't:
- **Don't** use purple, violet, gradients or a gradient logo.
- **Don't** add shadows to anything, including toasts, tooltips and menus.
- **Don't** build stat tiles, icon cards or pill-shaped badges; status is a 3px-cornered stamp.
- **Don't** place an uppercase label above a heading as an eyebrow or kicker; labels name values.
- **Don't** use green or red for decoration, or gold for anything but action, links, active navigation and the seal.
- **Don't** use government emblems, falcons or claims of being official.
- **Don't** colour chart labels in the bar colour; plan charts stay grey and ink.
