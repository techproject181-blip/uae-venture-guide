# UAE Venture Guide

A web app that helps students and first-time founders plan a new business in the UAE. You describe your idea, emirate and budget, and the app gives you a step-by-step roadmap with costs, a budget, a document checklist, a question assistant, and help from mentors and funders.

## Run the app

You need Node.js 24 and a MongoDB Atlas database (the free cluster is enough).

1. Copy `.env.example` to `.env.local` and fill in `MONGODB_URI` and `JWT_SECRET`
2. `npm install`
3. `npm run seed` to add the starting data
4. `npm run dev`, then open <http://localhost:3000>

Demo accounts, all with the password `Demo2026pass`:

| Role | Email |
| --- | --- |
| Administrator | `admin@demo.test` |
| Entrepreneur | `aisha@demo.test`, `yousef@demo.test` |
| Mentor | `omar@demo.test`, `fatima@demo.test`, `daniel@demo.test` (and `rahul@demo.test`, waiting for approval) |
| Funder | `layla@demo.test` (and `khalid@demo.test`, waiting for approval) |

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app |
| `npm run seed` | Adds the starting data (and removes leftover test accounts) |
| `npm run create-admin -- email "password" "Name"` | Creates an administrator |
| `npm run lint` | Checks the code |
| `npm test` | Runs the unit and database tests |
| `npm run test:e2e` | Runs the browser tests |
| `npm run build` | Builds the app for going live |

## Docs

| Doc | What it covers |
| --- | --- |
| [01-overview.md](docs/01-overview.md) | What the app does, the four roles, the features |
| [02-how-it-works.md](docs/02-how-it-works.md) | Technologies, folders, sign-in, roadmap, chat, security |
| [03-database.md](docs/03-database.md) | The collections and how they link |
| [04-testing.md](docs/04-testing.md) | The tests and the main test cases |
| [05-setup-and-deploy.md](docs/05-setup-and-deploy.md) | Running it locally and putting it online |
| [06-viva-questions.md](docs/06-viva-questions.md) | Likely defence questions, with short answers |

## Stack

Next.js 16 (JavaScript), Tailwind CSS v4, shadcn/ui, Motion, MongoDB Atlas with Mongoose, bcrypt and JWT cookies, Zod, Nodemailer, Recharts, react-pdf, Vitest and Playwright.
