# UAE Venture Guide

A web app that helps students and first-time founders turn a business idea into a startup plan for the UAE. Users enter an idea, an emirate, a budget and their target customers. The app builds a roadmap grounded in official sources and gives them a workspace for costs, tasks, questions, mentors and funders.

## What works

| Area | Features |
| --- | --- |
| Accounts | Sign-up with a role (entrepreneur, mentor, funder), sign-in, sign-out, password reset by email, a limit of 5 failed sign-ins per 15 minutes. Mentors and funders wait for an administrator's approval |
| Plans | Intake form, startup roadmap (phases, tasks, costs, documents, risks), task status and editing, document checklist, a new version or delete, 5 roadmaps a day per user |
| Budget | Costs with estimate and actual amounts, first-year totals, an over-budget warning, two charts |
| Chat | Questions about a plan, answered from the plan and the official sources, 40 messages a day |
| Mentors | Profiles, a public directory with filters, guidance requests with an attached plan, a conversation on the website once the mentor accepts (saved messages, new ones appear within a few seconds, read-only after the request is completed), experience posts with pictures and a chart |
| Funders | Plan sharing with a pitch card, a discover feed, interest requests; the full plan opens only when the owner accepts |
| Reports | The plan as a PDF |
| Administration | Approve and suspend users, official sources and fee references, hide posts and shared plans, AI usage |

The roadmap planner and the chat assistant run in **sample mode**: they use rules and the official fee references, and every answer says so. When an AI provider is chosen, only `src/lib/roadmap/generate.js` and `src/lib/chat/answer.js` change.

## Run the app

You need Node.js 24 and Docker Desktop.

1. Start the local database: `npm run db:up` (MongoDB 7 in Docker, on port 27018)
2. Install the packages: `npm install`
3. Fill the database with starting data: `npm run seed` (two founders, three mentors, funders, two plans and three posts).
4. Start the app: `npm run dev`, then open <http://localhost:3000>

Demo accounts, all with the password `Demo2026pass`:

| Role | Email |
| --- | --- |
| Administrator | `admin@demo.test` |
| Entrepreneur | `aisha@demo.test`, `yousef@demo.test` |
| Mentor | `omar@demo.test`, `fatima@demo.test`, `daniel@demo.test` (and `rahul@demo.test`, waiting for approval) |
| Funder | `layla@demo.test`, `hamad@demo.test` (and `khalid@demo.test`, waiting for approval) |

The demo sources are real official websites, but their summaries and every fee amount are **demo values**, labelled "Demo" in the app. In plans these costs show a grey DEMO FEE mark. A cost gets the amber OFFICIAL seal only from a fee an administrator has checked: on a source's page, add a fee reference with "This is demo data that has not been checked" left unticked, then make a new plan (or a new version) for that emirate. An administrator must check every demo value before real users rely on it.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run lint` | Checks the code with ESLint |
| `npm run build` | Builds the production version |
| `npm run db:down` | Stops the database (the data stays in a Docker volume) |

In development, emails are printed in the terminal instead of being sent.

## Settings for development and production

| File | Used by | In git? |
| --- | --- | --- |
| `.env.development` | `npm run dev`. Points at the local Docker database | Yes, it has no real secrets |
| `.env.production` | `npm run build` and `npm run start`. Copy it from `.env.production.example` and add the hosted MongoDB address, a long random `JWT_SECRET`, the site address and the SMTP email settings | No, never |

On Vercel, add the same variables in the project settings instead of using a file.

## How the code is organised

| Folder | What it holds |
| --- | --- |
| `src/app` | Pages and API routes. `(app)` holds signed-in pages, `(public)` pages anyone can open, `(auth)` sign-in and sign-up, `api` the backend |
| `src/components` | Interface parts, grouped by feature. `ui/` holds the shadcn/ui components, `form/` the shared form fields |
| `src/lib` | Shared code: database connection, sessions, access rules (`plans.js`), validation (`schemas/`), the planner (`roadmap/`), the chat assistant (`chat/`), the PDF report (`report/`) |
| `src/models` | Mongoose models, one file per collection |
| `src/proxy.js` | Sends signed-out visitors away from private pages, and signed-in users away from the sign-in pages |
| `scripts` | Demo data |

How a request is checked: every API route uses `route()` from `src/lib/api.js`, which turns errors into clear JSON answers. It checks the body with a Zod schema and the user with `requireApiUser()`. Who may read a plan is decided in one place, `canReadPlan()` in `src/lib/plans.js`.

How pages are laid out: every page is built from the layout kit in `src/components/layout.jsx` (`PageHeader`, `Panel`, `Stack`, `Split`, `CardGrid`, `ListPanel`, `TablePanel`, `StatGrid`, `FormActions`). There are three shapes: list pages (header, filter bar, cards or a table), detail and form pages (main content with a help column on the right) and dashboards (numbers, then lists).

How colours work: all colours live in one place, the `:root` block of `src/app/globals.css`. It has four scales (`ink` greys, `brand` emerald, `gold` amber, `danger` red), named roles built from them (`--primary`, `--border`, `--accent`, `--seal` …), chart colours and shadows. Components use them through Tailwind classes such as `bg-primary`, `text-ink-600`, `border-border-strong` or `shadow-panel`, or `var(--…)` in SVG and charts. Never write a hex value or one of Tailwind's own colours (`slate-300`, `emerald-500`) in a component: `src/lib/theme-colors.test.js` fails if you do. The only copies of the values are `src/lib/theme-colors.js`, for the PDF report (it is drawn on the server and cannot read CSS; the same test checks it matches), and the favicon files in `src/app/`.

How sign-in works: the password is checked against its bcrypt hash, then the server sets a signed session cookie (a JWT) that browser JavaScript cannot read. Every private page loads the user from the database, so an approval or a suspension takes effect at once.

## Stack

Next.js 16 with JavaScript, Tailwind CSS v4 (colours as tokens in `globals.css`), shadcn/ui, Motion for animations, Geist and Bricolage Grotesque fonts, MongoDB with Mongoose (Docker for development, a hosted database for production), bcrypt and JWT session cookies, Zod, Nodemailer over SMTP (notification and password-reset emails only), Recharts and react-pdf. Mentors and entrepreneurs talk in conversations saved in MongoDB; the page checks for new messages every few seconds. Deployed on Vercel. The AI provider is not chosen yet.
