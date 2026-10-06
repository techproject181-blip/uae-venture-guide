# Database

The app stores its data in MongoDB. MongoDB keeps data as documents (records) inside collections (like tables).
We use Mongoose, a library that lets us describe each collection in a model file in `src/models`.

## Collections

| Collection | What it stores | Key fields |
| --- | --- | --- |
| users | Every account | name, email, passwordHash, role (entrepreneur, mentor, funder, admin), status (active, pending, suspended), rejected, passwordChangedAt |
| plans | A business plan and its roadmap | ownerId, idea, emirate, sector, budgetAed, phases, tasks, budgetItems, documents, risks, shared, pitchSummary |
| sources | Official government websites | title, publisher, url, emirate, categories, summary, active |
| feereferences | Official fees, each tied to a source | sourceId, kind, item, emirate, amountMinAed, amountMaxAed, recurrence |
| mentorprofiles | Extra details for a mentor | userId, headline, expertise, emirates, acceptingRequests |
| funderprofiles | Extra details for a funder | userId, organization, ticketMinAed, ticketMaxAed, sectors |
| mentorrequests | An entrepreneur asking a mentor for guidance | entrepreneurId, mentorId, planId, topic, status |
| requestmessages | Chat messages inside a mentor request | requestId, authorId, body |
| fundinginterests | A funder showing interest in a shared plan | planId, funderId, message, status |
| interestmessages | Chat messages between a plan's owner and a funder, after the owner accepts | interestId, authorId, body |
| posts | Experience posts written by mentors | authorId, title, body, images, chart, status |
| chatmessages | Questions and answers in a plan's AI chat | planId, role, content, sourceIds |
| aiusages | How many roadmaps and chat messages a user made in a day | userId, day, generations, chatMessages |
| loginattempts | Failed sign-ins per email | email, failures, createdAt |

## How they link

Collections link by storing the id of another document (a reference).

- A plan belongs to one user (`ownerId`).
- A mentor profile and a funder profile each belong to one user (`userId`).
- A fee reference belongs to one source (`sourceId`). A plan step can point to a fee reference and to sources.
- A mentor request links an entrepreneur, a mentor and an optional plan.
- Request messages belong to a mentor request (`requestId`) and have an author (`authorId`).
- A funding interest links one plan and one funder. Interest messages belong to a funding interest (`interestId`).
- Chat messages belong to a plan. A post belongs to its author.
- AI usage belongs to a user, one document per user per day.

## Indexes

An index is a lookup list that makes searches fast or forces a rule.

- `email` in users is unique, so two accounts can never share an email.
- Sources have a text index on title, publisher and summary, used for search.
- Other unique rules: one funding interest per plan and funder, one AI usage record per user per day, and only one waiting (pending) request between the same pair.
- Login attempts delete themselves after 15 minutes. AI usage records delete themselves after 180 days.

## Seed data

`npm run seed` fills the database with demo data. It is safe to run again.

- It makes 9 demo accounts (see `docs/05-setup-and-deploy.md`). All use the password `Demo2026pass`.
- It adds 13 official sources and 15 fee references. The fee amounts are demo values.
- It adds mentor and funder profiles, two plans, two posts, two mentor requests (one with a saved conversation), two funding interests (one accepted, with a saved conversation).
- It also deletes accounts ending in `@e2e.test`, which the browser tests leave behind.
