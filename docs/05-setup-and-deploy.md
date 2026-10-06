# Setup and deploy

## Run locally

1. Install Node.js 24.
2. Copy `.env.example` to `.env.local`.
3. Put your Atlas connection string in `MONGODB_URI`, with `/uae_venture_guide` after the host.
4. Set `JWT_SECRET` to a random string of 32+ characters (e.g. `openssl rand -base64 48`).
5. `npm install`, then `npm run seed`, then `npm run dev`.
6. Open http://localhost:3000.

Demo accounts all use `Demo2026pass`: `admin@demo.test`, `aisha@demo.test`, `yousef@demo.test`, `omar@demo.test`, `fatima@demo.test`, `daniel@demo.test`, `layla@demo.test`. `rahul@demo.test` (mentor) and `khalid@demo.test` (funder) are pending.

Other commands: `npm run build`, `npm start`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run create-admin` (makes an admin or resets its password).

## Deploy to Vercel

1. Push to GitHub and import the project in Vercel.
2. Add `MONGODB_URI`, `JWT_SECRET` and `APP_URL`. SMTP settings are optional.
3. In Atlas Network Access, allow `0.0.0.0/0`. Vercel has no fixed IP, so the strong database password protects it.
4. Deploy.
5. From your computer, pointing at the live database, run:
   `npm run create-admin -- admin@example.com "Passw0rd123" "Admin Name"`

## Backups

The free Atlas tier has no backups. Export each collection as JSON from MongoDB Compass and keep the files out of git.

Never run `npm run seed` on a database with real users. It adds accounts with a public password, including an admin.
