# Setup and deploy

## Run locally

1. Install Node.js 24.
2. Copy `.env.example` to `.env.local`.
3. In MongoDB Atlas, copy your connection string into `MONGODB_URI`. Put `/uae_venture_guide` after the host so the database has the right name.
4. Set `JWT_SECRET` to a long random string of at least 32 characters (for example `openssl rand -base64 48`). It signs the login token.
5. Run `npm install`.
6. Run `npm run seed` to add the demo data.
7. Run `npm run dev` and open http://localhost:3000.

## Demo accounts

All use the password `Demo2026pass`.

| Name | Email | Role | Status |
| --- | --- | --- | --- |
| Sara Al Mansoori | admin@demo.test | admin | active |
| Aisha Khan | aisha@demo.test | entrepreneur | active |
| Yousef Al Hammadi | yousef@demo.test | entrepreneur | active |
| Omar Saeed | omar@demo.test | mentor | active |
| Fatima Al Nuaimi | fatima@demo.test | mentor | active |
| Daniel Okafor | daniel@demo.test | mentor | active |
| Rahul Mehta | rahul@demo.test | mentor | pending |
| Layla Haddad | layla@demo.test | funder | active |
| Khalid Rahman | khalid@demo.test | funder | pending |

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app for development |
| `npm run build` | Builds the app for production |
| `npm start` | Runs the production build |
| `npm run lint` | Checks the code style with ESLint |
| `npm test` | Runs unit and database tests |
| `npm run test:e2e` | Runs browser tests |
| `npm run seed` | Adds demo data |
| `npm run create-admin` | Creates an admin account or resets its password |

## Deploy to Vercel

1. Push the code to GitHub.
2. In Vercel, import the GitHub project.
3. Add the environment variables `MONGODB_URI`, `JWT_SECRET` and `APP_URL` (the site address). SMTP settings are optional.
4. In Atlas, under Network Access, allow `0.0.0.0/0`. Vercel has no fixed IP address, so the strong database password protects it.
5. Deploy.
6. Create the first admin from your computer, with `MONGODB_URI` pointing at the live database:
   `npm run create-admin -- admin@example.com "Passw0rd123" "Admin Name"`

## Backups

The free Atlas cluster has no backups. In MongoDB Compass, connect with `MONGODB_URI`, open each collection and choose Export Data (JSON). Keep the files private and out of git.

## Warning

Never run `npm run seed` on a database with real users. It adds accounts with a published password, including an admin.
