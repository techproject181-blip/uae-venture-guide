# Product

UAE Venture Guide helps students and first-time founders turn a business idea into a startup plan they can act on in the UAE. A user enters the idea, the emirate, a budget and the target customers. The site generates a roadmap grounded in official UAE sources, then gives the user a workspace to edit costs, tick off tasks, ask questions about the plan, and reach mentors and funders.

## Roles

| Role | Can do | Account status on signup |
| --- | --- | --- |
| Entrepreneur | Create plans, edit budgets and tasks, chat with the AI about their own plans, request mentor guidance, share a plan with funders, download reports | Active |
| Mentor | Publish a profile, answer guidance requests, read a plan attached to a request they accepted, write experience posts with pictures and charts | Pending until an admin approves |
| Funder | Browse shared plans as pitch cards, send funding-interest requests, read the full plan once the owner accepts | Pending until an admin approves |
| Admin | Approve and suspend users, hide posts and shared plans, maintain official sources and fee references, view AI usage | Created by seed script, never through signup |

The AI assistant is a system actor, not a user account. It generates roadmaps and answers questions about one plan at a time, and it only sees that plan plus admin-curated sources.

## Features

### In scope

1. **Accounts and dashboards.** Email and password signup with a role picker. Each role lands on its own dashboard. Mentors and funders fill in their profile while pending, and the admin reads it before approving or rejecting them. Password reset by email arrives with email sending in Phase 4.
2. **AI roadmap.** From the intake form, generate phases, tasks, estimated costs in AED, a document checklist, and risks. Every cost is marked either as backed by a fee reference or as an unverified estimate. Regenerating creates a new plan and keeps the old one, and plans can be deleted.
3. **Budget workspace.** Editable line items grouped by category, one-time and recurring costs, automatic first-year totals, remaining budget, and charts.
4. **Progress tracking.** Task status (to do, in progress, done) and plan progress as a percentage of tasks done.
5. **Plan chat.** Streaming chat that answers from the saved plan and matching official sources, and cites them.
6. **Official sources.** Admin-curated government and free-zone sources, tagged by emirate and category, shown on each plan and in a public directory.
7. **Mentors.** Mentor directory, guidance requests with an optional attached plan, and experience posts with up to five pictures and one simple chart.
8. **Funders.** Owners opt in to sharing and write a short pitch summary. Funders browse pitch cards and send interest requests. The full plan opens to a funder only after the owner accepts, and turning sharing off closes it again.
9. **Reports.** Downloadable PDF of a plan: summary, phases and tasks with status, budget table and chart, documents, risks, sources, disclaimer.
10. **Admin console.** User approval and suspension, moderation, sources and fee references, AI usage.

### Out of scope for the first release

- Direct messaging between users. An accepted request shows both parties' email addresses, and follow-up happens by email.
- Payments, subscriptions, or investment transactions of any kind.
- The AI editing a plan. Chat is read-only; the user edits.
- Real-time collaboration on a plan.
- Native mobile apps. The web app is responsive.
- Email address verification and account deletion.
- An Arabic interface and right-to-left layout. The layout is built so they can be added later without rework (A2).

## Decisions and assumptions

A1, A2, A7, A9, A10 and A11 were confirmed by the project owner. A5 is open. The rest are working assumptions; each one changes scope or cost if it turns out wrong.

| # | Decision or assumption | Status | If wrong |
| --- | --- | --- | --- |
| A1 | Only the idea was handed over; everything else is ours to decide. The project owner and Claude build it together. The owner's target is 1 to 1.5 months of full-time work (set on 2026-09-25); there is no outside deadline. No mandated technology. Deliverables: the working product, these docs, and the undergraduate project report, whose chapters follow the university's templates (Chapter 3 covers planning and requirements). The development method is Agile, based on Scrum, with one-week sprints ([05-roadmap.md](05-roadmap.md#way-of-working)) | Confirmed | Not applicable |
| A2 | English only for the first release (MVP). Arabic and RTL may come later, after the first release. Layout uses logical CSS properties (`ms-*`, `pe-*`, `text-start`) from day one so adding RTL stays cheap | Confirmed | Not applicable |
| A3 | No UAE data-residency requirement for the first release. The Atlas free tier is not offered in any UAE or Bahrain region, so data sits in Mumbai | Assumed | Move to a paid Atlas cluster (M10 or larger) in `me-central-1` (UAE) |
| A4 | AED is the only currency | Assumed | Add a currency field to budget items |
| A5 | The AI provider and model are not chosen yet. The owner decides after a short trial at the end of Week 1, using the requirements in [04-ai.md](04-ai.md) (including data-use terms), and the full quality check confirms it at the end of Sprint 2. Until then AI features are built in fixture mode, behind one module, so the choice does not change the rest of the app | Open | Not applicable |
| A6 | Not legal or financial advice. Every roadmap, chat answer and report carries a disclaimer and links to the authority | Required | Not applicable |
| A7 | The app is one Next.js project, pages and server code together, and the database is MongoDB (Atlas). Both are final. Start on free tiers (Atlas, Vercel, Cloudinary) and rely on the features they include, such as Atlas Search, instead of adding paid services. Email goes through Nodemailer and an SMTP account. The AI provider is the only likely cost (A5) | Confirmed | Move to paid tiers when a limit in [02-architecture.md](02-architecture.md#free-tiers) is reached |
| A8 | The first release is for building and demoing, not commercial use. Vercel Hobby forbids commercial use, and the Atlas free tier has no backups | Assumed | Move to Vercel Pro and a paid Atlas tier with backups before launching commercially or taking on real users' data |
| A9 | Zod validates on both sides, with one schema per shape shared by the browser and the server. The app uses the official MongoDB driver, not Mongoose. Images are stored on Cloudinary, not in MongoDB | Confirmed | Not applicable |
| A10 | Reuse first, in browser and server code alike: search for existing code before writing, use what the stack already provides, and put shared logic in helpers instead of repeating it. Rules and the helper catalogue are in [06-conventions.md](06-conventions.md); a copy-paste check in `npm run check` enforces it | Confirmed | Not applicable |
| A11 | Code is simple, strictly typed TypeScript that someone new to the repo can follow. It is fast by default (Server Components, React Compiler memoization, indexed queries), and comments say only what the code cannot, in plain words, without AI-style filler. Rules are in [06-conventions.md](06-conventions.md#writing-code) | Confirmed | Not applicable |

## Open questions

1. Which AI provider and model (A5)? Trial at the end of Week 1, confirmed in Sprint 2.
2. Is there a monthly AI budget ceiling? Until answered, the daily quotas in [04-ai.md](04-ai.md) apply.
