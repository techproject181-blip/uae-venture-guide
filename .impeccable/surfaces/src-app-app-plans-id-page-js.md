---
version: 1
slug: "src-app-app-plans-id-page-js"
primary_target: "src/app/(app)/plans/[id]/page.js"
related_targets: ["src/app/page.js","src/components/app-shell.jsx","src/app/globals.css"]
---

# Surface brief: the whole app, led by the plan page

Scope: every page of UAE Venture Guide. Mode: Operate (the landing page is Persuade but lives in the same world). Redesign of the incumbent look, which the owner rejected as AI-tool styled (purple, gradient logo, pill badges, icon cards) and too complex.

Audience and job: student and first-time founders (often on a phone) find the next step and its cost; examiners at the capstone defense follow each screen on a laptop or projector. Both matter equally. Phone and laptop are designed together.

Constraints: every feature and route stays; screens get simpler. Form labels, button names and copy keep their meaning (the browser tests read them). No government emblems, falcons or claims of being official: the footer says the site is not a government service.

## Direction contract

THESIS: Each plan reads as a clean official UAE document: fields, ruled tables, numbered steps, and a gold seal only on fees checked against an official page. It refuses the SaaS dashboard: stat tiles, icon cards, eyebrow labels, gradients, purple.

OWN-WORLD: White paper. AE Black ink #232528, hairline rules #e1e3e5, AE Gold #7c5e24 for the one primary action, gold underlines under ink links, and a double-ruled #b68a35 seal for OFFICIAL; AE Green #2f663c for done, AE Red #b52520 for errors only (UAE Government Design System scales). Charts in grey and ink. Roboto throughout with tabular figures; small uppercase field labels. Sections divided by rules, not cards; 6px corners; no shadows.

STORY: A founder opens a plan, sees the next step and its fee, can tell an official fee (checked by an administrator) from a demo amount or an estimate, and ticks steps off. An examiner follows every screen as one document.

FIRST VIEWPORT: Plan page. Title at 32px bold, then a field row (Emirate, Sector, Licence, Budget, Reference) and "4 of 15 steps done" with a thin green bar. Six plain text tabs. Then the Next step block: step title, fee with its mark, and a link to all steps. The mark is the OFFICIAL seal only when an administrator has checked that fee against a cited official page; the demo data has no checked fees, so demo plans show DEMO FEE or Estimate, and the legend names only marks that appear. Header actions: Download PDF and Share with funders only; New version and Delete move to a Plan settings block at the end of the overview.

FORM: Licence Paper (UAE trade licences and certificates) fused with the UAE Government Design System tokens. Position 3 of 7 on the ordered list; seed key ec9af6a0. Raises: no shadows, gradients or icon tiles (Metro Tiles); step details fold until opened (Streaming Wall); one legend for Official, Estimate and Done (Orienteering Map); strict step numbering 1.1, 1.2 (Catalog Sleeve); aligned figures on one grey scale (Darkroom Record). Signature interaction: ticking a step's box presses a green DONE stamp onto it; unticking undoes it.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- The OFFICIAL seal appears on a plan only after an administrator enters a checked fee; the demo data cannot show it truthfully.
- Arabic and right-to-left layout come later (Noto Kufi Arabic is the UAE Design System's Arabic face).
