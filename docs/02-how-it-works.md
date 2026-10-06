# How it works

## Tech

- **Next.js 16 / React 19**: pages and API routes in one project
- **JavaScript**: all the code
- **MongoDB Atlas + Mongoose**: the database and models
- **bcryptjs**: password hashing
- **jose**: making and checking JWTs
- **Zod**: input checks, shared by browser and server
- **Tailwind CSS v4, Motion**: styling and animation
- **Recharts, @react-pdf/renderer, Nodemailer**: charts, PDF report, email

## Folders

- `src/app/` pages, and `src/app/api/` API routes
- `src/lib/` shared logic (`roadmap/`, `chat/`, `schemas/`)
- `src/models/` Mongoose models
- `src/components/` UI parts
- `src/proxy.js` checks the login cookie before private pages
- `scripts/` seed and create-admin

## A request, step by step

1. The browser opens a page or calls an API route.
2. For private pages, `src/proxy.js` checks the cookie.
3. The page or route loads the user, checks role and status, and checks input with Zod.
4. Mongoose reads or writes MongoDB and the result goes back.

## Sign-in and sessions

- Passwords are hashed with bcrypt (cost 10). Only the hash is saved.
- On sign-in the server makes a JWT with the user id and role, signed with HS256, valid for 7 days.
- It's stored in a `session` cookie: `httpOnly`, `secure` in production, `sameSite: lax`.
- Every page and route loads the user from the database again, so a suspension works on the next request.
- A token made before the user's `passwordChangedAt` is refused. So changing a password signs out other devices.
- No refresh tokens. After 7 days you sign in again.
- Five wrong passwords lock that email for 15 minutes.

## Roadmap (`src/lib/roadmap/generate.js`)

It uses rules, not AI. It loads fees and sources for the emirate, picks mainland or free zone (walk-in sectors like food and retail lean mainland), builds tasks from templates, and adds costs. A matching fee reference gives a real cost; otherwise it's an estimate. It returns the same shape an AI planner would.

## Plan assistant (`src/lib/chat/answer.js`)

It looks for topic words like "cost", "visa" or "documents" and answers from the saved plan. It finds up to 3 sources with a MongoDB text search. If nothing matches, it points to the emirate's licensing authority. Limits: 40 messages and 5 roadmaps per user per day (`src/lib/quota.js`).

## Conversations

A mentor chat opens when the mentor accepts a request. Only those two people can read it, and only while their accounts are active. After the request is completed it's read-only. Messages are saved in MongoDB. The page polls every 4 seconds because Vercel doesn't keep live connections open. Max 30 messages a minute per person.

Funder chats work the same way. They open when the owner accepts the funder's interest and close when the plan stops being shared. Emails are never shown to the other person.

## Other bits

- Everyone can change their name and password on the Profile page (`/account`), from the avatar menu.
- Founders can withdraw a mentor request, and funders their interest, before it's answered.
- Mentors can turn off "Taking new requests".
- The admin has a separate console with Overview, Users, Sources and fees, Content and AI usage.
