# UAE Venture Guide

A website that helps students and first-time founders plan a small business in the UAE. You enter your idea, emirate and budget. The app builds a step-by-step roadmap with costs, a budget, a document list and a plan assistant. Mentors and funders can help too.

## Run it

You need Node.js 24 and a MongoDB Atlas database (free cluster is fine).

1. Copy `.env.example` to `.env.local`. Fill in `MONGODB_URI` and `JWT_SECRET`. Add `OPENAI_API_KEY` if you want ChatGPT to write the roadmaps and answers; without it the app runs in sample mode.
2. `npm install`
3. `npm run seed` (adds demo data)
4. `npm run dev`, then open <http://localhost:3000>

The demo accounts use the password `Demo2026pass`:

- Admin: the email in `scripts/seed.mjs` (or `ADMIN_EMAIL`), with the password from `ADMIN_PASSWORD` in `.env.local` (`Demo2026pass` when it is empty)
- Entrepreneurs: `aisha@demo.test`, `yousef@demo.test`
- Mentors: `omar@demo.test`, `fatima@demo.test`, `daniel@demo.test` (`rahul@demo.test` is pending)
- Funders: `layla@demo.test` (`khalid@demo.test` is pending)

## Commands

- `npm run dev` starts the app
- `npm run seed` adds demo data and removes old demo accounts
- `npm run lint` checks the code
- `npx vitest run` runs the tests (the database tests use the MongoDB in `.env.local`)
- `npm run build` builds for production

## Docs

The full project report is in [docs/Project-Documentation.docx](docs/Project-Documentation.docx).

## Stack

Next.js 16 (JavaScript), TanStack Query, Tailwind CSS v4, shadcn/ui, Motion, MongoDB Atlas with Mongoose, bcrypt and JWT cookies, Zod, Nodemailer, Recharts, @react-pdf/renderer and the OpenAI API (optional).

In the browser, every API call goes through one helper, `src/lib/query.js`, built on TanStack Query. On the server, public data (official sources, mentors and published posts) is cached through `src/lib/cache.js` with Next's `use cache`: sources for a few hours, mentors and posts for a few minutes, and each is cleared as soon as an admin or the author changes it.
