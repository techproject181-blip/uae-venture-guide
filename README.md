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
| `npm run seed` | Adds the starting data (and removes old demo accounts) |
| `npm run lint` | Checks the code |
| `npm run build` | Builds the app for going live |

## Stack

Next.js 16 (JavaScript), Tailwind CSS v4, shadcn/ui, Motion, MongoDB Atlas with Mongoose, bcrypt and JWT cookies, Zod, Nodemailer, Recharts and react-pdf.
