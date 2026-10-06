# UAE Venture Guide

A website that helps students and first-time founders plan a small business in the UAE. You enter your idea, emirate and budget. The app builds a step-by-step roadmap with costs, a budget, a document list and a plan assistant. Mentors and funders can help too.

## Run it

You need Node.js 24 and a MongoDB Atlas database (free cluster is fine).

1. Copy `.env.example` to `.env.local`. Fill in `MONGODB_URI` and `JWT_SECRET`.
2. `npm install`
3. `npm run seed` (adds demo data)
4. `npm run dev`, then open http://localhost:3000

All demo accounts use the password `Demo2026pass`:

- Admin: `admin@demo.test`
- Entrepreneurs: `aisha@demo.test`, `yousef@demo.test`
- Mentors: `omar@demo.test`, `fatima@demo.test`, `daniel@demo.test` (`rahul@demo.test` is pending)
- Funders: `layla@demo.test` (`khalid@demo.test` is pending)

## Commands

- `npm run dev` starts the app
- `npm run seed` adds demo data and removes leftover test accounts
- `npm run create-admin -- email "password" "Name"` makes an admin
- `npm run lint` checks the code
- `npm test` runs unit and database tests
- `npm run test:e2e` runs browser tests
- `npm run build` builds for production

## Docs

| Doc                                                   | What it covers                                  |
| ----------------------------------------------------- | ----------------------------------------------- |
| [01-overview.md](docs/01-overview.md)                 | What the app does and the four roles            |
| [02-how-it-works.md](docs/02-how-it-works.md)         | Tech, folders, sign-in, roadmap, chat, security |
| [03-database.md](docs/03-database.md)                 | The collections and how they link               |
| [04-testing.md](docs/04-testing.md)                   | The tests and how to run them                   |
| [05-setup-and-deploy.md](docs/05-setup-and-deploy.md) | Running locally and putting it online           |

## Stack

Next.js 16 (JavaScript), Tailwind CSS v4, shadcn/ui, Motion, MongoDB Atlas with Mongoose, bcrypt and JWT cookies, Zod, Nodemailer, Recharts, react-pdf, Vitest and Playwright.
