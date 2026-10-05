# Architecture

One Next.js app on Vercel, one MongoDB Atlas cluster, an AI provider that is not chosen yet, Nodemailer sending email through an SMTP account, and Cloudinary for post pictures. Accounts are handled inside the app by Better Auth, which stores its data in the same MongoDB database. There is no separate backend service.

Everything starts on free tiers. The AI provider is the only likely cost, and it is chosen later (A5). See [Free tiers](#free-tiers).

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, TypeScript strict, React Compiler | Confirmed by the project owner (A7). Pages, server actions and API routes in one repo. Server Components by default; React Compiler memoizes client components automatically. Same stack as the other projects in this workspace |
| UI | Tailwind CSS v4, shadcn/ui (Radix base) | Forms, tables, dialogs and dashboards without building primitives |
| Charts | Recharts through shadcn chart components | Budget donut, estimated vs actual bars, post charts |
| Database | MongoDB Atlas, official `mongodb` Node driver | Chosen by the project owner. A plan and its whole roadmap fit in one document, so the most important write is a single atomic update |
| Data validation | Zod on both sides: the same schemas validate forms in the browser and every input on the server. `$jsonSchema` validators on every collection | One definition per shape, so the browser and the server can never disagree. The collection validator catches anything that slips past Zod |
| Search | Atlas Search index on `sources` | Relevance-ranked source lookup for chat and the sources directory, built into Atlas |
| Auth | Better Auth, email and password, MongoDB adapter | Open source and runs inside the app, so it costs nothing. Sessions live in MongoDB. Hooks enforce the signup and suspension rules |
| Authorization | A server-only data layer plus pure policy functions | MongoDB has no row-level security, so every access rule lives in one tested place. See [Authorization](#authorization) |
| Image storage | Cloudinary, free plan | Resizes images and serves them from a CDN. Images are not stored in MongoDB: a few hundred photos would fill the free cluster's 0.5 GB, and every view would pass through our app and use up transfer limits. Needed from Phase 4 |
| AI | Provider and model not chosen yet (A5). Called only through `src/server/ai/` | Structured output for the roadmap, streaming for chat. Keeping every call in one module makes the provider a configuration detail. Requirements and candidates in [04-ai.md](04-ai.md) |
| PDF | `@react-pdf/renderer` | Server-side reports. Charts in the PDF are drawn as plain SVG because Recharts does not render inside react-pdf |
| Email | Nodemailer over SMTP | Request and approval notifications, and email verification once it is switched on. Works with any SMTP account, for example a Gmail account with an app password. In automated tests Nodemailer's JSON transport records messages instead of sending them |
| Tests | Vitest, Playwright, `@axe-core/playwright`, `mongodb-memory-server` | Same tools as the other projects here. Automated tests run against a throwaway in-memory MongoDB, so they never touch the cloud cluster |
| Tooling | ESLint (`eslint-config-next`), Prettier, `tsc --noEmit`, knip, markdownlint-cli2, one `npm run check` | Matches the workspace convention |

**Why the driver and not Mongoose.** Zod already defines every shape once, for forms, actions and AI output. Mongoose would add a second schema layer that has to agree with Zod, and Better Auth's adapter takes a plain driver `Db` anyway. Typed collections (`Collection<PlanDoc>`) give the same editor help without the extra layer.

## System

```text
Browser
  │  React Server Components (reads), client components (forms, charts, chat)
  ▼
Next.js on Vercel
  ├─ /api/auth/[...all] ─────────────► Better Auth ─► MongoDB (user, session, account)
  ├─ Server Components ──┐
  ├─ Server Actions ─────┼───────────► src/server/data  ─► MongoDB Atlas
  ├─ POST /api/plans/[id]/generate ──► AI provider ─► one updateOne on the plan
  ├─ POST /api/plans/[id]/chat ──────► AI provider (streamed back to the browser)
  ├─ GET  /api/plans/[id]/report ────► PDF built from the plan document
  └─ SMTP server through Nodemailer (emails), Cloudinary (post pictures)
```

## Repository layout

```text
src/
  app/
    (marketing)/            landing page, public sources directory, public mentor directory
    (auth)/                 login, signup (role picker), pending-approval screen
    (app)/
      dashboard/            redirects to the role's dashboard
      plans/new/            intake form
      plans/[id]/           overview, tasks, budget, documents, risks, chat, sharing
      mentors/              directory and profile pages
      posts/                experience posts, editor for mentors
      discover/             funder feed of pitch cards
      requests/             mentor requests and funding interests, both directions
      admin/                users, sources, fee references, posts, shared plans, AI usage
    api/
      auth/[...all]/route.ts
      plans/[id]/{generate,chat,report}/route.ts
  server/                   server-only; nothing outside src/server imports the driver
    db/                     MongoClient, typed collections, setup (validators and indexes)
    auth/                   Better Auth instance, getViewer, requireViewer
    policies/               pure access rules: (viewer, resource) → boolean
    data/                   every query and write, scoped to a viewer
    ai/                     client, prompts, roadmap schema, context builder, generation, chat, quotas
  lib/                      shared by browser and server: domain/ (enums, budget and progress math),
                            validation/ (Zod schemas), forms/ (parseForm, FormState), format.ts
  hooks/                    React hooks, such as useValidatedForm
  components/
    ui/                     shadcn components (vendor code)
    form/                   FormShell, Field, SubmitButton, FormAlert
    page-header.tsx         and other components used in more than one place
    charts/  plan/  budget/  posts/
  proxy.ts                  route guards (Next 16 replacement for middleware.ts)
tests/
  integration/              data layer against an in-memory MongoDB (mongodb-memory-server)
  e2e/                      Playwright
fixtures/ai/                recorded AI outputs for tests and fixture mode
scripts/
  db-setup.mts              collections, validators, indexes, search index; safe to re-run
  seed-users.mts            admin and demo accounts
  e2e-server.mts            throwaway in-memory database and dev server for Playwright
  eval-roadmap.mts          runs sample intakes against the live model for review
docs/
```

## Request paths

- **Reads** happen in Server Components, which call `src/server/data/*` with the current viewer.
- **Mutations** go through Server Actions. Each action parses its input with Zod, then calls a data function, which checks the policy and scopes the write.
- **Auth** requests go to `src/app/api/auth/[...all]/route.ts`, which hands them to Better Auth. Server Actions that sign users in or out call Better Auth's server API, with the `nextCookies` plugin setting the session cookie.
- **Roadmap generation** is a route handler with `maxDuration = 300`. It sets the plan to `generating`, calls the model, validates the output, and writes the roadmap into the plan document with one `updateOne`.
- **Chat** is a route handler that streams text back to the browser and stores both messages.
- **Reports** are a route handler that reads the plan and returns `application/pdf`.
- **Image uploads** go from the browser straight to Cloudinary, not through the app, because a Vercel function accepts at most 4.5 MB per request. A Server Action checks that the user may upload and returns a signed upload signature; the browser sends the file to Cloudinary with it; the post then stores the returned image id and URL.

## Authorization

With Postgres, the database enforced access rules. MongoDB cannot do that for app users, so a bug in app code could leak data. The design makes that bug hard to write and easy to catch:

1. **One door.** Only modules under `src/server/data/` touch collections. An ESLint `no-restricted-imports` rule fails the build if anything outside `src/server/` imports `mongodb` or `@/server/db`, and every server module starts with `import "server-only"` so it can never end up in a browser bundle.
2. **Every data function takes the viewer.** It either checks a policy and throws `ForbiddenError`, or puts the viewer into the query filter (`{ _id: planId, ownerId: viewer.id }`) so other users' documents never match. Functions that return data to less-trusted viewers use explicit projections, as `listPitchCards` does.
3. **Policies are pure functions** in `src/server/policies/`, such as `canReadPlan(viewer, plan, grants)`. Unit tests cover every role against every rule in the access table in [03-schema.md](03-schema.md).
4. **Integration tests** run the data layer against a real, in-memory MongoDB with one user per role and check what each can and cannot read and write.
5. **Accounts** are guarded in Better Auth: the `role` field only accepts the three signup roles, the `user.create.before` hook sets `status`, the `user.update.before` hook refuses role changes through Better Auth's endpoints, only admin data functions change `role` or `status`, and the `session.create.before` hook refuses sign-in for suspended users. Suspending a user also deletes their sessions.
6. **`proxy.ts` redirects** are for UX only: signed-out users to `/login`, pending users to `/pending`, non-admins away from `/admin`. Pages and data functions check again.

The Atlas database user the app connects with has `readWrite` on the app database only. The Atlas free tier cannot use private networking, so the cluster must accept connections from anywhere (`0.0.0.0/0`) for Vercel to reach it; a long random password is the protection.

## Database connection

- One `MongoClient` per server process, cached on `globalThis` so hot reloads in development do not open new pools. `maxPoolSize` stays small (10) to respect the free tier's connection limit.
- On Vercel, the client is registered with `attachDatabasePool` from `@vercel/functions`, which closes idle connections before a function instance is suspended.
- `npm run db:setup` creates collections with their validators, all indexes, and the Atlas Search index. It is idempotent: running it again updates validators and skips what exists. There are no migration files; a change to a collection is a change to `src/server/db/schema.ts`.

## Source search

`searchSources(query, emirate)` in `src/server/data/sources.ts` is the only code that searches sources. It has two modes, picked by the `SEARCH_MODE` environment variable:

- `atlas` (development, preview, production): a `$search` stage on the Atlas Search index `sources_text`, which ranks by relevance and tolerates typos.
- `text` (automated tests): a classic `$text` query on a text index over the same fields. The in-memory test database has no Atlas Search, and a text index works on any MongoDB.

Both modes return the same shape, and both indexes are created by `npm run db:setup`. Tests cover the `text` mode; the `atlas` mode is checked by hand on the development cluster and on every preview deploy.

## Free tiers

Checked against the providers' own docs and pricing pages on 2026-09-23. Re-check before relying on a number; providers change them.

| Service | Free tier used | Limits that matter |
| --- | --- | --- |
| MongoDB Atlas | Free (M0) cluster, MongoDB 8.0, 3-node replica set | 0.5 GB of data plus indexes. 500 connections. 100 operations per second and 10 GB transfer each way per 7 days, throttled above that. **No backups.** 3 Atlas Search or Vector Search indexes. One free cluster per Atlas project. Paused (not deleted) after 30 days with no connections. **Not available in any UAE or Bahrain region**; the nearest free regions are Mumbai (`ap-south-1`) and Frankfurt (`eu-central-1`) |
| Vercel | Hobby | **Personal, non-commercial use only.** Functions run up to 300 seconds. 1M invocations, 4 active CPU-hours and 100 GB transfer a month. Cron jobs at most once a day |
| Nodemailer and SMTP | Nodemailer is a free library; the SMTP account is the owner's choice | Daily sending limits come from the SMTP account, so check them when it is set up. A Gmail account needs 2-step verification and an app password. Mail from a personal address is more likely to land in spam than mail from your own domain |
| Cloudinary | Free | 25 credits a month, where one credit is 1 GB stored, 1 GB served or 1,000 transformations. Uploads are resized to at most 1600 px before storing, so a credit goes a long way |
| Better Auth | Open source library | No limits; it runs inside the app |
| AI provider | Not chosen yet (A5) | Usually pay as you go; some providers offer a free tier with low rate limits. Whichever is chosen, set a monthly spend limit in its console |

What these limits change in the design:

- **Region.** The cluster runs in Mumbai (`ap-south-1`), the nearest free region to the UAE, and Vercel functions are pinned to Mumbai with `"regions": ["bom1"]` in `vercel.json`, so each database call stays inside one AWS region. Vercel has no Middle East region either, and Hobby allows exactly one function region.
- **Development and previews share one free cluster** (separate databases). Production gets its own Atlas project later, because a project holds only one free cluster.
- **Backups** do not exist on the free tier. Run `mongodump` before any risky change. A scheduled backup job is part of Phase 7, and a paid tier with backups comes before real users do.
- **Storage.** Images never go into MongoDB; they live on Cloudinary. Old `aiUsage` documents expire through a TTL index. At 0.5 GB, plan documents and chat history have plenty of room for a first release.
- **Atlas Triggers and Functions** are included in the free tier (up to 5 triggers), and Atlas Search is too. The app uses Atlas Search. It does not use Triggers or Functions: code that runs inside Atlas cannot run in the automated tests, and everything a trigger would do here (sending an email when a request changes) is done in the Server Action that made the change.
- **No domain name is needed.** SMTP sends from the account's own address, and the site runs on the free `*.vercel.app` address. A domain is optional, for a nicer address and better email delivery.
- **No WebSockets.** Plan chat is one user asking the AI, so the answer streams back over an ordinary HTTP response. Users do not chat with each other (see out of scope in [01-product.md](01-product.md)), and Vercel functions cannot hold WebSocket connections anyway.
- **Commercial use** is not allowed on Vercel Hobby. That is fine while building and demoing. Moving to Vercel Pro comes before charging anyone or launching commercially.

## Environments

| Env | App | Database | AI |
| --- | --- | --- | --- |
| Development | `npm run dev` on your machine | Atlas development cluster (free, Mumbai), database `uae_venture_guide_dev` | `AI_MODE=fixture` by default, `live` when testing prompts |
| Automated tests | Vitest and Playwright, locally and in CI | In-memory MongoDB started by the test run (`mongodb-memory-server`, a replica set so transactions work). No Docker, no cloud credentials | `AI_MODE=fixture` |
| Preview | Vercel preview for every push to `main` and every pull request | Same development cluster, database `uae_venture_guide_preview` | live, low quota |
| Production | Vercel, from the `production` branch (created in Phase 7) | Its own Atlas project and free cluster in Mumbai, database `uae_venture_guide` | live |

Vercel treats `main` as the production branch unless told otherwise. Until Phase 7 the project's production branch is set to `production`, a branch that does not exist yet, so every push to `main` builds a preview with the Preview settings instead of a production deployment with none.

There is no MongoDB on your machine or in Docker. Development and previews use the cloud cluster; only automated tests use the in-memory one, which `mongodb-memory-server` downloads and starts by itself and throws away when the run ends.

Environment variables: `MONGODB_URI`, `MONGODB_DB`, `SEARCH_MODE`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AI_MODE`, the AI provider's API key (named once the provider is chosen), and from Phase 4 `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. None of them is public; the browser never talks to the database, the mail server or the AI provider. `.env.example` lists them all, and real values never enter git.

## Error handling

| Failure | What the user sees | What the system does |
| --- | --- | --- |
| Invalid form input | Field-level messages | Zod errors mapped to fields, nothing written |
| Not allowed | The page they were redirected to, or a 404 for someone else's plan | `ForbiddenError` from the data layer; a plan the viewer may not read is reported as not found, so its existence does not leak |
| AI rate limit or server error | "Generation failed, try again" with a retry button | SDK retries twice, then plan status becomes `failed` with the reason stored |
| AI output fails validation | Same as above | One automatic retry, then `failed` |
| AI refusal | Plain message that the request could not be completed | Stop reason checked before reading content; see [04-ai.md](04-ai.md) |
| Daily AI quota reached | Message with the reset time | Route returns 429 before calling the model |
| Upload too large or wrong type | Inline message | Checked in the browser and again on the server |
| Database unreachable or a free-tier limit hit | Segment `error.tsx` boundary with a retry | Logged server-side (Vercel logs) |

## Testing

- **Unit** (Vitest, Node environment, `src/**/*.test.ts`): policies for every role, budget and progress math, roadmap validation and sanitizing, the AI context builder, Zod schemas.
- **Integration** (Vitest, `tests/integration`, in-memory MongoDB): the data layer and the Better Auth hooks. Each test file gets its own database, dropped afterwards, so tests never see each other's data. These tests are what stands in for database-enforced security, so every access rule has one.
- **End to end** (Playwright, `tests/e2e`, `AI_MODE=fixture`): signup per role, create plan, tick tasks, edit budget, chat, download PDF, mentor request, funding interest. Axe accessibility checks on key pages.
- **AI quality** (`scripts/eval-roadmap.mts`): ten fixed intakes across emirates and sectors, run against the live model before merging any prompt or schema change, reviewed against the checklist in [04-ai.md](04-ai.md).
- **CI** (GitHub Actions): `npm run check` on every push; integration tests on every push; end-to-end tests on pushes to `main`. All of them use the in-memory MongoDB, so CI never needs the Atlas connection string.
