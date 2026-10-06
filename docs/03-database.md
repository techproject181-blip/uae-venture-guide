# Database

MongoDB stores data as documents in collections. Each collection has a Mongoose model in `src/models`.

## Collections

- **users**: every account, with role, status and `passwordChangedAt`
- **plans**: a plan and its roadmap (phases, tasks, budget, documents, risks, shared flag)
- **sources**: official government websites
- **feereferences**: official fees, each tied to a source
- **mentorprofiles**: mentor details, including `acceptingRequests`
- **funderprofiles**: funder details and ticket size
- **mentorrequests**: an entrepreneur asking a mentor for help
- **requestmessages**: messages inside a mentor request
- **fundinginterests**: a funder's interest in a shared plan
- **interestmessages**: messages between plan owner and funder
- **posts**: mentor experience posts
- **chatmessages**: questions and answers in a plan's assistant chat
- **aiusages**: roadmaps and chat messages per user per day
- **loginattempts**: failed sign-ins per email

## How they link

Collections store the id of another document. A plan has `ownerId`. Profiles have `userId`. A fee has `sourceId`. A mentor request links an entrepreneur, a mentor and an optional plan. A funding interest links a plan and a funder. Messages point to their request or interest. Phases, tasks and budget items are stored inside the plan.

## Indexes

- Unique email on users
- Text index on sources, for assistant search
- Unique: one interest per plan and funder, one usage record per user per day, one pending request per pair
- Login attempts delete themselves after 15 minutes, usage records after 180 days

## Seed data

`npm run seed` is safe to run again. It adds 9 demo accounts (password `Demo2026pass`), 13 sources, 15 fee references (demo amounts), profiles, two plans, two posts, two mentor requests and two funding interests. It also deletes `@e2e.test` accounts left by browser tests.
