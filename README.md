# UAE Venture Guide

A website that helps students and first-time founders plan a small business in the UAE. You enter your idea, emirate and budget. The app builds a step-by-step roadmap with costs, a budget, a document list and a plan assistant. Mentors and funders can help too.

## Run it

You need Node.js 24 and a MongoDB Atlas database (free cluster is fine).

1. Copy `.env.example` to `.env.local`. Fill in `MONGODB_URI` and `JWT_SECRET`. Add `OPENAI_API_KEY` if you want ChatGPT to write the roadmaps and answers; without it the app runs in sample mode.
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
- `npm run seed` adds demo data and removes old demo accounts
- `npm run lint` checks the code
- `npm run build` builds for production

## Stack

Next.js 16 (JavaScript), Tailwind CSS v4, shadcn/ui, Motion, MongoDB Atlas with Mongoose, bcrypt and JWT cookies, Zod, Nodemailer, Recharts, react-pdf, the OpenAI API (optional) and Vitest.
