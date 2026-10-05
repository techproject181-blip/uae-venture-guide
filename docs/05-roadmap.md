# Roadmap

Each phase ends in something that works on its own and is deployed to preview, and carries a relative size: S, M or L. The owner's target is 1 to 1.5 months of full-time work with Claude Code (A1 in [01-product.md](01-product.md)):

| Week | Phases |
| --- | --- |
| 0 | Planning: product, architecture, schema, AI design, this roadmap and the Phase 0 plan. Done |
| 1 | 0. Foundation. Pick the visual design. Start collecting fee data. AI provider trial (A5) |
| 2 | Confirm the AI provider (A5). Request ethical approval for testing with real users. 1. Core plan loop |
| 3 | Finish 1. Then 2. Budget workspace and 3. Plan chat |
| 4 | 4. Mentors |
| 5 | 5. Funders and 6. Reports and admin |
| 6 | 7. Hardening, and buffer for anything that ran late |

Without the buffer week the target is one month; with it, one and a half.

Every phase gets its own implementation plan in `docs/plans/` before work starts. Phase 0 has one already.

## Way of working

Agile, based on Scrum and kept light for a small team. Chapter 3 of the project report describes the same process.

- **Sprints.** One week each, six in total, after the planning week. Each sprint covers the phases in its row of the table above.
- **Backlog.** The features in [01-product.md](01-product.md), written as user stories on a GitHub Projects board, Must items first.
- **Each week.** Plan on the first day: pick the stories and split them into tasks, and at the start of a phase write its plan in `docs/plans/`. Build and test every day. On the last day, demo the preview deploy and write a short retrospective note.
- **Done** means the story works as written, a Playwright test with an axe check covers its main path, lint, the tests and the build pass, the code follows [06-conventions.md](06-conventions.md), the change is deployed to preview and checked in a browser, and any doc it affects is updated. Writing the browser tests with each feature keeps Phase 7 small.
- **Cut order.** If a sprint runs late, these move to later work first: the AI usage page, the public sources directory, the over-budget warning, regenerate and delete plan, then password reset. Everything else in [01-product.md](01-product.md) is required for the first release.

The lifecycle around the sprints:

| Stage | What happens | Output |
| --- | --- | --- |
| Initiation | The idea and feature list arrive; the scope is agreed | The brief |
| Planning | Requirements, stack, architecture, schema, schedule | These docs and the Phase 0 plan |
| Iterative development | Six one-week sprints, each deployed to preview | A working increment every week |
| Testing | Automated checks in every sprint; a user acceptance test in Weeks 5 and 6; the full end-to-end and accessibility pass in Phase 7 | Green CI, test reports and user test results |
| Deployment | A preview for every change pushed to GitHub; production, from its own branch, at the end of Phase 7 | The live site |
| Maintenance and future work | Fixes after release, then Arabic, and paid tiers with built-in backups | Later versions |

## Phase 0. Foundation (M)

- Next.js 16 App Router in JavaScript (ES modules, JSDoc comments), Tailwind v4, shadcn-style components on Base UI, `@/` alias
- ESLint (`npm run lint`)
- MongoDB 7 in Docker for development (`npm run db:up`), used through Mongoose 9 models in `src/models`. Mongoose creates the indexes declared in each model
- The app's own sign-in: bcryptjs password hashes, a signed JWT session (jose) in an HTTP-only cookie, `role` and `status` on the user, the status set by the server at sign-up, and a sign-in block for suspended users
- Shared server helpers in `src/lib` (`requireUser`, `requireApiUser`, `canReadPlan`) that every page and API route calls. Route guards in `src/proxy.js`
- Signup with role picker, login, logout, pending-approval screen
- One dashboard shell per role. Admin users page with approve and suspend
- Seed: one admin and one demo account per role
- Vitest for unit tests and database tests against the Docker MongoDB, Playwright with axe
- GitHub Actions CI, with a MongoDB 7 service container. Vercel project with functions in Mumbai

Exit: each role signs up and lands on its own dashboard. A new mentor sees the pending screen until an admin approves them. Tests prove that no user can change their own role or status. CI is green and a preview deploy works.

## Phase 1. Core plan loop (L)

- `sources` and `feeReferences` with admin CRUD, a MongoDB text index, and a public sources directory
- `plans` and `chatMessages` collections, `canReadPlan`, the single-write roadmap save, `aiUsage` and `consumeAiQuota`
- Intake form
- AI module: roadmap schema, context builder, sanitizer and generation route, running in sample mode (`src/lib/roadmap/`) until a provider is connected; the eval script waits for the provider
- Plan pages: overview (summary, jurisdiction, progress), tasks (status, add, edit, delete), documents (obtained checkbox), risks, sources. Regenerate (creates a new plan) and delete plan
- Entrepreneur dashboard listing plans with progress

Exit: an entrepreneur creates a plan for any emirate and gets a roadmap in which every cost marked `reference` survived the sanitizer with a real fee row behind it. Ticking tasks updates progress. Once a provider is connected, the eval report for all ten intakes is reviewed. End-to-end tests pass in sample mode.

## Phase 2. Budget workspace (S)

- `src/lib/budget.js` with unit tests
- Editor: add, edit and delete items, actual amounts, recurrence
- First-year totals, remaining budget, over-budget warning
- Charts: donut by category, estimated vs actual bars

Exit: every total on screen matches the unit-tested functions, edits persist, and charts update after saving.

## Phase 3. Plan chat (S)

- Chat route, context builder, source ranking through `searchSources`, message storage, quota check
- Chat UI with streaming, Markdown rendering and source links

Exit: answers use plan data and supplied sources only. The quota returns 429 at the limit. History survives a reload.

## Phase 4. Mentors (M)

- Mentor profile editor, including the "accepting requests" switch. Public directory filtered by expertise and emirate
- Pending mentors can reach their profile page and fill it in. The admin users page shows a pending mentor's profile, with Approve and Reject (reject sets the account to `suspended`)
- Guidance requests: create with an optional attached plan, inbox on both sides, accept, decline, complete, email notifications through Nodemailer, including the account-approved email. The accepted mentor reads the attached plan, read-only
- A conversation on the website for each accepted request: the entrepreneur and the mentor send each other messages, saved in MongoDB (`requestMessages`). The page checks for new messages every few seconds (no WebSockets, because Vercel does not keep connections open). Once the request is completed, the conversation stays readable but is closed, and only those two people can open it
- Mentor dashboard: their requests and posts
- Password reset by email (the app's own reset link, with only a hash of the token stored), now that email sending works
- Experience posts: Markdown editor, up to five pictures added by pasting a picture's web address (each with alt text), optional chart built from a small labels-and-values table, public feed and post pages

Exit: a request goes round trip, with an email at each status change. After acceptance, the entrepreneur and the mentor exchange messages in the request's conversation, and new messages appear on the other side within a few seconds. Once the request is completed, the conversation is read-only and the mentor loses access to the attached plan. Posts show their pictures and charts.

## Phase 5. Funders (S)

- Plan sharing settings: toggle and pitch summary, with a preview of the pitch card. Turning sharing off also ends accepted funders' access
- Funder profile editor. Pending funders fill it in, and the admin reviews it the same way as a mentor's
- Discover feed through `listPitchCards`, with filters
- Interest requests, owner inbox, accept and decline, emails. Full plan opens to the funder on accept
- Funder dashboard: new pitch cards and their interest requests

Exit: a funder sees only pitch-card fields until the owner accepts. Policy and integration tests cover every rule in this phase.

## Phase 6. Reports and admin (M)

- PDF report route and download button
- Admin: hide posts, hide shared plans, AI usage page
- Admin users list: paging. Phase 0's list already reads through the `status_createdAt` index but returns every account at once, which is fine while there are only a few

Exit: the PDF for a sample-mode plan contains every section and opens cleanly in common PDF readers. A post hidden by an admin disappears from public pages.

## Phase 7. Hardening (M)

- User acceptance test: about five students or first-time founders plus the invited mentors complete the main tasks on demo or non-sensitive ideas (testers recruited in Week 5, once ethical approval is in place)
- Accessibility pass: axe clean on key pages, every flow usable by keyboard
- Performance pass with Lighthouse on the landing and plan pages, target score 90 or more
- End-to-end coverage for every role, in Chrome, Firefox and WebKit (Safari's engine) and on two phone screens
- A limit on failed sign-ins per email in the sign-in route: five wrong passwords lock sign-in for that email for 15 minutes. The count is kept in MongoDB (`loginAttempts`), because serverless functions share no memory
- Demo data: three mentors, two funders, four plans, several posts
- Weekly scheduled `mongodump` backup of production, since the free tier has none
- README setup guide and a deployment checklist

Exit: production is deployed with real, verified sources and fees entered by an admin, and all checks are green.

## After the first release

- Arabic and RTL with next-intl (A2). Logical CSS properties from Phase 0 onward mean the layout already mirrors; the work is translating text and switching direction.

## Parallel track: reference data

The roadmap is only as good as `feeReferences` and `sources`. Collecting them is research, not code, and it takes time: licence fees, free-zone packages, visa costs and required documents, per emirate, from official sites. Start in Phase 0, enter the data through the admin screens in Phase 1, and record a `verifiedAt` date on every row. Stale rows are the main way this product can mislead people.

The first release covers a fixed list, in this order: federal fees (visas, tax registration), mainland licences in Dubai, Abu Dhabi and Sharjah, then three or four free zones popular with small startups. Anything outside the list stays an estimate. In Phase 7 every row is checked again and entered into the production database.

## Risks

| Risk | Mitigation |
| --- | --- |
| The model invents fees or legal steps | Fee references, the sanitizer, the eval checklist and a disclaimer on every output. See [04-ai.md](04-ai.md) |
| Fee data is slow to collect or goes stale | The parallel track above starts on day one. `verifiedAt` is shown to users |
| The marketplace looks empty (no mentors or funders) | Demo accounts for demos. Invite a few real mentors during Phase 4 |
| Shared business ideas leak | Pitch cards only until the owner accepts, and only the two people in a guidance request can read its conversation. Access tests cover it |
| AI cost grows with chat use, or nobody has agreed to pay for it | Agree a monthly ceiling and who pays before Sprint 2, and set it as the provider's spending limit. Daily quotas, the usage page, the sample assistant for demos, and the cheaper-chat-model option |
| Business ideas sent to the AI provider are kept or used for training | Data-use terms are part of the provider decision (A5); send only the fields the model needs; the intake form says an outside AI service processes the idea |
| Code written with Claude Code has mistakes, or cannot be explained at assessment | Every change is reviewed and must pass lint, the tests and CI. Confirm the university's rules on AI coding tools before Sprint 1, declare Claude Code in the report, and walk through each new module before its sprint review |
| A team member is unavailable or part-time | Must items first and the cut order above. Docs and board kept current so work restarts quickly |
| Ethical approval for testing with real users arrives late | Request it in Sprint 2, two weeks before invited mentors test in Phase 4. Until it arrives, only the team tests, with demo accounts. The approval is attached to the report as an appendix |
| Scope creep across five roles | The out-of-scope list in [01-product.md](01-product.md). Each phase ships on its own |
| Generation takes 30 to 120 seconds, or runs into the 300-second function limit | Progress events, status-driven UI, no abort on disconnect. Generation time is measured in the provider trial, and a plan still generating after five minutes shows as failed with a retry button |
| Access rules live in app code, because MongoDB cannot enforce them per user | Shared helpers in `src/lib` that every page and API route calls, and database and browser tests for the rules |
| The Atlas free tier has no backups | `mongodump` before risky changes, a scheduled backup job in Phase 7, and a paid tier with backups before real users (A8) |
| A free-tier limit is hit (0.5 GB, 100 operations per second, 100 emails a day) or the cluster pauses after 30 idle days | Post pictures are web addresses, so no files go into MongoDB, `aiUsage` expires, the admin usage page shows growth, and a paused cluster is resumed from the Atlas UI |
| Vercel Hobby forbids commercial use | Fine for building and demoing. Vercel Pro before any commercial launch (A8) |
