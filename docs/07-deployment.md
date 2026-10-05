# Deployment checklist

How to put UAE Venture Guide online with MongoDB Atlas and Vercel, and what to check afterwards. Do the steps in order.

## 1. Database: MongoDB Atlas

- [ ] Create a free M0 cluster in **Mumbai (`ap-south-1`)**, the nearest free region to the UAE.
- [ ] Under **Database Access**, add a user with a long generated password and the role "Read and write to any database".
- [ ] Under **Network Access**, allow `0.0.0.0/0`. Vercel has no fixed IP address, so the long password is what protects the database.
- [ ] Copy the connection string (Connect, then Drivers) and add the database name, `uae_venture_guide`, after `.mongodb.net/`.

## 2. Settings

The same variables as [.env.production.example](../.env.production.example):

| Variable | What to put |
| --- | --- |
| `MONGODB_URI` | The connection string from step 1 |
| `JWT_SECRET` | A new random value. Create one with `openssl rand -base64 48`. Never reuse the development value |
| `APP_URL` | The site's address, such as `https://uae-venture-guide.vercel.app`. Email links use it |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | The email account. Gmail needs 2-step verification and an app password, not the normal password |
| `MAIL_FROM` | The sender, such as `"UAE Venture Guide <you@gmail.com>"` |

To run commands against production from your computer (steps 4 and 7), copy `.env.production.example` to `.env.production` and fill it in. Git ignores that file; never commit it or paste its values anywhere.

## 3. Hosting: Vercel

- [ ] Import the GitHub repository. Vercel detects Next.js by itself.
- [ ] Add every variable from step 2 under Settings, Environment Variables, for Production.
- [ ] Set Settings, Functions, Function Region to **Mumbai (`bom1`)**, next to the database. Every page loads data, so this makes each page faster.
- [ ] Deploy.

The free Hobby plan is for personal, non-commercial use only. A paid plan is needed before the site earns money.

## 4. The first administrator

Run this on your computer, with `.env.production` filled in:

```sh
node --env-file=.env.production scripts/create-admin.mjs you@example.com "a long password" "Your Name"
```

Never add the seed data to a public server: its accounts share a published password. `npm run seed` refuses any database that is not on the computer it runs on.

## 5. Official sources and fees

- [ ] Sign in as the administrator and open Official sources.
- [ ] Add each official page the roadmap should use, then the fees from that page.

The planner marks a cost as "official" only when it comes from one of these fee references. With none, every cost is an estimate.

## 6. Check the live site

- [ ] Sign up as an entrepreneur. You land on the dashboard.
- [ ] Use "Forgot password". The email arrives, and its link opens the live site, not `localhost`.
- [ ] Create a plan. The roadmap shows the official fees from step 5.
- [ ] Open the PDF report.
- [ ] In a private window, sign up as a mentor. Approve the account as the administrator, then check the mentor can use the app.
- [ ] In the browser's developer tools (Application, Cookies), the `session` cookie is marked HttpOnly and Secure.

## 7. Backups

The free Atlas cluster has **no backups**. Make one before any risky change and once a week:

```sh
npm run db:up                      # mongodump runs inside the local Docker container
npm run db:backup -- production    # saves backups/production-<date>.archive.gz
```

Backups hold every user's email and plans. Keep them private, for example on an encrypted drive, and never in git (the `backups` folder is ignored).

## 8. When something goes wrong

| Problem | What to do |
| --- | --- |
| A new deployment breaks the site | In Vercel, open Deployments and roll back to the last working one |
| `JWT_SECRET` leaked | Set a new value in Vercel and redeploy. Everyone is signed out |
| The database password leaked | Change it in Atlas (Database Access), update `MONGODB_URI` in Vercel, and redeploy |
| Data was lost or damaged | Restore the latest backup with `mongorestore` into a new database first, check it, then switch `MONGODB_URI` to it |
