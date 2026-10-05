# Architecture

One Next.js app on Vercel, one MongoDB database (MongoDB 7 in Docker for development, a free MongoDB Atlas cluster for the live site), and Nodemailer sending notification and password-reset emails through an SMTP account. Sign-in is the app's own code. An AI provider is not chosen yet; until one is connected, a built-in sample assistant answers. There is no separate backend service.

Everything starts on free tiers. The AI provider is the only likely cost, and it is chosen later (A5). See [Free tiers](#free-tiers).

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, JavaScript (ES modules, JSDoc comments) | Confirmed by the project owner (A7). Pages and API route handlers in one repo. Server Components by default |
| UI | Tailwind CSS v4, shadcn-style components built on Base UI, Motion for animations, lucide-react icons, Sonner toasts | Forms, tables, dialogs and dashboards without building primitives |
| Charts | Recharts | Budget charts and post charts |
| Database | MongoDB through Mongoose 9 (`src/models`) | Chosen by the project owner. A plan and its whole roadmap fit in one document, so saving a roadmap is a single write |
| Data validation | Zod 4 on both sides: the same schemas (`src/lib/schemas`) check forms in the browser and every input on the server. Mongoose schemas check the stored shape | One definition per input, so the browser and the server never disagree. The Mongoose schema catches anything that slips past Zod |
| Search | A MongoDB text index on `sources` | Ranked source lookup for chat and the sources directory. Works the same in Docker and on Atlas |
| Sign-in | The app's own: bcryptjs password hashes, a signed JWT session (jose) in an HTTP-only cookie, a 15-minute lockout after five wrong passwords | Small, free and fully under our control. Roles and account approval live on the `User` model |
| Authorization | Shared server helpers in `src/lib` (`requireUser`, `requireApiUser`, `canReadPlan`, `getConversation`) | MongoDB has no row-level security, so every access rule lives in tested code. See [Authorization](#authorization) |
| Post pictures | A picture's web address, pasted into the post with its alt text | Nothing to upload or store, so no storage service is needed |
| Mentor conversations | Messages saved in MongoDB (`requestmessages`); the page asks for new ones every 4 seconds | Vercel functions cannot keep a connection open, so the page checks often instead of using WebSockets |
| AI | A built-in sample assistant in `src/lib/roadmap/generate.js` and `src/lib/chat/answer.js`. The provider (Anthropic, OpenAI or Google) is not chosen yet (A5) | When a provider is chosen, only those two files change. Requirements and candidates in [04-ai.md](04-ai.md) |
| PDF | `@react-pdf/renderer` | Server-side reports. Charts in the PDF are drawn as plain SVG because Recharts does not render inside react-pdf |
| Posts | `react-markdown` | Experience posts are written in Markdown and shown without raw HTML |
| Email | Nodemailer over SMTP | Only notifications (a request sent, accepted, declined or completed; a funding interest sent, accepted or declined; an account approved) and password-reset links. Works with any SMTP account, for example a Gmail account with an app password. In development, emails are printed in the terminal |
| Tests | Vitest, Playwright, `@axe-core/playwright` | Unit and database tests, and browser tests in Chrome, Firefox, WebKit and two phones, with an accessibility check on each page |
| Tooling | ESLint (`eslint-config-next`), GitHub Actions | `npm run lint`, the tests, the build and the browser tests run on every push |

## System

```text
Browser
  │  Server Components (reads), client components (forms, charts, chat, conversation)
  ▼
Next.js on Vercel
  ├─ src/proxy.js ───────────────────► checks the session cookie, redirects only
  ├─ Server Components ──────────────► src/lib helpers ─► Mongoose ─► MongoDB
  ├─ /api/auth/* ────────────────────► bcrypt check, JWT cookie, lockout records
  ├─ POST /api/plans ────────────────► sample planner ─► one new plan document
  ├─ POST /api/plans/[id]/chat ──────► sample assistant (streamed back as text)
  ├─ GET  /api/plans/[id]/report ────► PDF built from the plan document
  ├─ /api/requests/[id]/messages ────► the conversation of an accepted request
  └─ SMTP server through Nodemailer (notification and password-reset emails)
```

## Repository layout

```text
src/
  app/
    (public)/               mentor directory, experience posts, sources directory
    (auth)/                 sign-in, sign-up (role picker), forgot and reset password
    (app)/
      dashboard/            the dashboard for the user's role
      plans/new/            intake form
      plans/[id]/           overview, tasks, budget, documents, risks, sources, chat, sharing
      requests/             guidance requests and funding interests, both directions
      requests/[id]/        the conversation of an accepted guidance request
      my-posts/             a mentor's experience posts and editor
      discover/             funder feed of pitch cards
      interests/            a funder's interests
      profile/  pending/
      admin/                users, sources and fee references, content, AI usage
    api/                    route handlers (route.js), one folder per resource
  components/               interface parts, grouped by feature (plans/, requests/, posts/ ...);
                            ui/ holds the shadcn-style components, form/ the shared form fields
  lib/                      shared rules and server helpers: db.js, session.js, jwt.js, api.js,
                            guards.js, plans.js, messages.js, quota.js, email.js, budget.js,
                            schemas/ (Zod), roadmap/, chat/, report/
  models/                   Mongoose models, one file per collection
  proxy.js                  route guards (the Next.js 16 replacement for middleware)
tests/
  integration/              database tests against the Docker MongoDB
  e2e/                      Playwright browser tests
scripts/                    demo data, the administrator command, backups
docs/
```

## Request paths

- **Reads** happen in Server Components. Each private page calls `requireUser()` (`src/lib/guards.js`) first, then reads through the `src/lib` helpers and the Mongoose models.
- **Changes** go from the browser to API route handlers in `src/app/api`. Each one is wrapped in `route()` from `src/lib/api.js`, checks the body with a Zod schema (`readBody`) and the user with `requireApiUser()`, and turns errors into clear JSON answers.
- **Sign-in** is `POST /api/auth/sign-in`. It compares the password with its bcrypt hash, counts failures in `loginattempts`, and on success sets the session cookie. Every private page loads the user from the database, so an approval or a suspension takes effect at once.
- **Roadmap generation** is `POST /api/plans`. It counts one roadmap against the daily limit, makes the roadmap with the sample planner, and saves the plan with its roadmap in one write.
- **Chat** is a route handler that streams the answer back as text and stores both messages.
- **Reports** are a route handler that reads the plan and returns `application/pdf`.
- **Guidance requests.** `POST /api/requests` sends a request and emails the mentor. `PATCH /api/requests/[id]` lets the mentor accept, decline or complete it and emails the entrepreneur. Accepting opens the conversation at `/requests/[id]`; a reply sent with "accept" becomes its first message.
- **Conversation messages.** `GET /api/requests/[id]/messages?after=…` returns the messages newer than the page's last one; the page asks every 4 seconds. `POST /api/requests/[id]/messages` sends one (at most 2,000 characters, and 30 a minute per person). Sending to a completed request is refused, and anyone who is not the request's entrepreneur or mentor gets "not found".
- **Post pictures** are web addresses. The post stores each address with its alt text; the app never receives the file.

## Authorization

MongoDB cannot enforce access rules for app users, so a bug in app code could leak data. The design keeps the rules in a few shared places and tests them:

1. **Every private page and API route loads the user first.** `requireUser()` for pages and `requireApiUser()` for API routes read the user from the database, refuse suspended and (unless allowed) pending accounts, and check the role.
2. **Ownership is part of the query.** Helpers such as `findOwnPlan()` look for `{ _id, ownerId: user.id }`, so other people's documents never match, and the answer is 404, not 403, so ids reveal nothing.
3. **Plan reading is decided in one place**, `canReadPlan()` in `src/lib/plans.js`. See the access rules in [03-schema.md](03-schema.md#access-rules).
4. **Conversations are decided in one place**, `getConversation()` in `src/lib/messages.js`: only the request's entrepreneur and mentor, only while their accounts are active, and only once the request is accepted or completed.
5. **Accounts.** Sign-up accepts only the entrepreneur, mentor and funder roles. The server sets the account status, users cannot change their own role or status, and only administrator routes change them.
6. **`src/proxy.js` redirects** are for convenience only: it checks that the session cookie is valid and sends signed-out visitors to `/sign-in`. Pages and API routes check again.
7. **Tests.** `tests/integration/access.test.js` checks who may read a plan for every role, and the browser tests in `tests/e2e/security.spec.js` try the rules from outside.

The Atlas database user the app connects with has read and write access only. The Atlas free tier cannot use private networking, so the cluster must accept connections from anywhere (`0.0.0.0/0`) for Vercel to reach it; a long random password is the protection.

## Database connection

- One Mongoose connection per server process, cached on `globalThis` in `src/lib/db.js` so reloads in development do not open new ones.
- Indexes are declared in the model files in `src/models`, and Mongoose creates them. There are no migration files; a change to a collection is a change to its model.

## Source search

Sources have a text index named `sources_text` over `title`, `publisher` and `summary` (`src/models/Source.js`). The public sources page and the chat assistant (`searchSources` in `src/lib/chat/answer.js`) search it with `$text` and sort by text score. A text index works on any MongoDB, so search behaves the same in Docker, in the tests and on Atlas.

## Free tiers

Checked against the providers' own docs and pricing pages on 2026-09-23. Re-check before relying on a number; providers change them.

| Service | Free tier used | Limits that matter |
| --- | --- | --- |
| MongoDB Atlas | Free (M0) cluster, 3-node replica set | 0.5 GB of data plus indexes. 500 connections. 100 operations per second and 10 GB transfer each way per 7 days, throttled above that. **No backups.** One free cluster per Atlas project. Paused (not deleted) after 30 days with no connections. **Not available in any UAE or Bahrain region**; the nearest free regions are Mumbai (`ap-south-1`) and Frankfurt (`eu-central-1`) |
| Vercel | Hobby | **Personal, non-commercial use only.** Functions run up to 300 seconds and cannot hold a connection open for live updates. 1M invocations, 4 active CPU-hours and 100 GB transfer a month. Cron jobs at most once a day |
| Nodemailer and SMTP | Nodemailer is a free library; the SMTP account is the owner's choice | Daily sending limits come from the SMTP account, so check them when it is set up. A Gmail account needs 2-step verification and an app password. Mail from a personal address is more likely to land in spam than mail from your own domain |
| AI provider | Not chosen yet (A5) | Usually pay as you go; some providers offer a free tier with low rate limits. Whichever is chosen, set a monthly spend limit in its console |

What these limits change in the design:

- **Region.** The cluster runs in Mumbai (`ap-south-1`), the nearest free region to the UAE, and the Vercel function region is set to Mumbai (`bom1`), so each database call stays inside one AWS region. Vercel has no Middle East region either.
- **Backups** do not exist on the free tier. `npm run db:backup` saves a copy before any risky change, and a paid tier with backups comes before real users do.
- **Storage.** Post pictures are web addresses, so no picture files go into MongoDB. At 0.5 GB, plan documents, chat history and conversation messages have plenty of room for a first release.
- **No Atlas-only features.** Atlas Triggers, Functions and Atlas Search cannot run in the local Docker database or the tests, so the app uses none of them. Emails are sent by the API route that made the change.
- **No domain name is needed.** SMTP sends from the account's own address, and the site runs on the free `*.vercel.app` address. A domain is optional, for a nicer address and better email delivery.
- **No WebSockets.** Plan chat is one user asking the assistant, so the answer streams back over an ordinary HTTP response. Mentors and entrepreneurs do message each other in an accepted request's conversation, but Vercel functions cannot hold WebSocket connections, so the conversation page asks for new messages every 4 seconds instead. That is a small, cheap request, and it works on any host.
- **Commercial use** is not allowed on Vercel Hobby. That is fine while building and demoing. Moving to Vercel Pro comes before charging anyone or launching commercially.

## Environments

| Env | App | Database | AI |
| --- | --- | --- | --- |
| Development | `npm run dev` on your machine | MongoDB 7 in Docker (`npm run db:up`, port 27018) | Sample assistant |
| Automated tests | Vitest and Playwright, locally and in GitHub Actions | The Docker MongoDB locally; a MongoDB 7 service container in GitHub Actions. Each database test file uses its own database, deleted at the end | Sample assistant |
| Production | Vercel | Its own Atlas project and free cluster in Mumbai, database `uae_venture_guide` | Sample assistant until a provider is connected |

Environment variables: `MONGODB_URI`, `JWT_SECRET`, `APP_URL`, and for email `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `MAIL_FROM` (the AI provider's key is added once one is chosen). None of them is public; the browser never talks to the database or the mail server. `.env.development` works only with the local Docker database, and `.env.production.example` lists the production ones; real values never enter git. See [07-deployment.md](07-deployment.md).

## Error handling

| Failure | What the user sees | What the system does |
| --- | --- | --- |
| Invalid form input | Field-level messages | Zod errors mapped to fields, nothing written |
| Not allowed | The page they were redirected to, or "not found" for someone else's plan or conversation | The API route answers 404, so the existence of the item does not leak |
| Daily AI limit reached | Message saying to try again tomorrow | The route answers 429 before making a roadmap or an answer |
| Too many conversation messages in a minute | Message asking to wait a minute | The route answers 429 and saves nothing |
| Message sent to a completed request | Message that the conversation is closed | The route answers 409 and saves nothing |
| Too many wrong passwords | Message that the account is locked for 15 minutes | The sign-in route stops checking passwords for that email until the lock ends |
| Database unreachable | A clear error message | `route()` answers with a JSON error, and the error is logged on the server (Vercel logs) |

## Testing

- **Unit** (Vitest, `src/**/*.test.js`, next to the code): budget and progress sums, the UAE day for daily limits, form rules.
- **Database** (Vitest, `tests/integration`, the Docker MongoDB): who may read a plan, for every role; daily limits, even with many requests at once; official fees in roadmaps; chat sources. Each test file gets its own database, deleted afterwards.
- **Browser** (Playwright, `tests/e2e`): sign-up and sign-in, the lockout, a full plan, the mentor and funder flow (including messages in a guidance request's conversation), security checks, keyboard-only use, every page for every role, and an axe accessibility check on each page. Runs in Chrome, Firefox and WebKit on a laptop screen, and on a Chrome phone and an iPhone.
- **CI** (GitHub Actions, `.github/workflows/check.yml`): lint, the unit and database tests, the build, demo data, then the browser tests, on every push and pull request.

The full list of test cases, including the ones checked by hand, is in [08-test-cases.md](08-test-cases.md).
