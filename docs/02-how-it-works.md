# How it works

## Tech stack

| Technology | What it does | Why chosen |
| --- | --- | --- |
| Next.js 16 | Runs the pages and the server code (API routes) in one project. | One project is simpler to build and host. |
| React 19 | Builds the screens from components. | Comes with Next.js. |
| JavaScript | The language of all the code. | Easy to read; no extra type setup. |
| MongoDB (Atlas) | The database. Stores users, plans, messages and sources. | Free tier, and plans fit well as documents. |
| Mongoose | Defines the shape of each kind of data (a "model") and talks to MongoDB. | Checks data before saving it. |
| bcryptjs | Turns passwords into a hash (a scrambled form that cannot be turned back). | Standard safe way to store passwords. |
| jose | Makes and checks JWTs (signed login tokens). | Small and works in `proxy.js`. |
| Zod | Checks that form and API input has the right shape. | One rule set used by browser and server. |
| Tailwind CSS v4 | Styling with small class names. | Fast to style, consistent spacing. |
| Motion | Animations. | Respects the user's reduced-motion setting. |
| Recharts | Budget and post charts. | Simple React charts. |
| @react-pdf/renderer | Makes the PDF report. | Builds PDFs from React components. |
| Nodemailer | Sends emails (notices, password reset). | Works with any email account (SMTP). |

## Folder map

- `src/app/` - pages and API routes. Folders in brackets group pages: `(public)`, `(auth)`, `(app)`.
- `src/app/api/` - API routes: auth, plans, requests, posts, interests, profile, admin.
- `src/lib/` - shared logic: login, database connection, budget sums, rules.
- `src/lib/roadmap/` - the sample roadmap planner.
- `src/lib/chat/` - the sample chat assistant.
- `src/lib/schemas/` - Zod rules for input.
- `src/models/` - Mongoose models (User, Plan, Source, FeeReference, MentorRequest, RequestMessage and others).
- `src/components/` - reusable parts of the screens.
- `src/proxy.js` - runs before private pages and checks the login cookie.
- `scripts/` - seed demo data and create the admin.

## Request flow

1. The browser opens a page or sends a form to an API route (for example `POST /api/plans`).
2. For private pages, `src/proxy.js` checks the login cookie first.
3. The page or route calls a helper in `src/lib/` (it checks the user's role and the input with Zod).
4. The helper uses a Mongoose model from `src/models/` to read or write data.
5. MongoDB returns the data, and the page or route sends the answer back to the browser.

## How sign-in works

- **Sign-up:** the password is hashed with bcrypt (cost 10) and only the hash is saved.
- **Sign-in:** bcrypt compares the typed password with the hash. If it matches, the server makes a JWT that holds the user id and role. It is signed with HS256 and lasts 7 days. There are no refresh tokens; after 7 days the user signs in again.
- **Cookie:** the JWT goes into a cookie named `session`. It is `httpOnly` (page JavaScript cannot read it), `secure` in production (HTTPS only) and `sameSite: lax` (not sent from other sites' forms).
- **proxy.js:** before private pages (dashboard, plans, requests, admin and others) it checks the token. No valid token means a redirect to `/sign-in`. A signed-in user who opens the home or sign-in page goes to the dashboard.
- **Password change:** the user has a `passwordChangedAt` date. A token made before that date is refused, so a password change signs out other devices.
- **Loading:** sign-in and sign-up show a full-screen loading overlay while the server answers (`src/components/loaders/loading-overlay.jsx`).
- **Roles:** each page and route then loads the user and checks the role and account status. For example, only an admin can open `/admin`, and a pending mentor sees the pending page.

## How the roadmap is made

The file is `src/lib/roadmap/generate.js`. It uses rules, not AI.

1. It loads the active fee references and sources for the chosen emirate.
2. It picks mainland or free zone. Sectors with walk-in customers (food, retail, health, tourism, education) lean to mainland.
3. It builds phases and tasks from templates in `src/lib/roadmap/templates.js`, plus extra steps for the sector.
4. It adds a cost to each task. If a fee reference matches, the cost uses it. If not, it is marked as an estimate.
5. It adds the document list, risks, a total and a time estimate in weeks.

It returns the same shape an AI planner would, so adding AI later only changes this one function.

## How the chat assistant works (sample mode)

The file is `src/lib/chat/answer.js`.

1. It looks for topic words in the question, such as "cost", "visa", "documents", "tax" or "risk".
2. For each topic found, it writes a part of the answer from the saved plan (for example the budget totals).
3. It finds sources with a MongoDB text search on the question's words, and shows up to 3.
4. If no topic matches, it looks for matching roadmap tasks. If none, it points to the emirate's licensing authority.

Each user can send 40 chat messages and make 5 roadmaps per day (`src/lib/quota.js`).

## How mentor conversations work

The rules are in `src/lib/messages.js`.

- A conversation opens when the mentor **accepts** a request. Pending or declined requests have none.
- Messages are saved in MongoDB with the `RequestMessage` model.
- Only the entrepreneur and the mentor of that request can read it, and only if their accounts are active. Anyone else gets "not found".
- Both can send while the request is accepted. After it is **completed**, it stays readable but closed.
- The page asks the server for new messages every 4 seconds (polling). It does not keep a live connection, because the host (Vercel) does not allow that.
- One person can send at most 30 messages a minute.

Funders and plan owners talk the same way, with the same chat box (`src/lib/interest-messages.js`, model `InterestMessage`). Their conversation opens when the owner **accepts** the funder's interest, and closes when the plan stops being shared. Nobody's email address is shown to the other person.

## Accounts and the admin console

- Every role can change their name and password on the **Profile** page (`/account`), opened from the avatar menu in the top bar. The current password is checked first, with the same 5-try limit as sign-in. Changing or resetting a password signs out every other device.
- A founder can **withdraw** a request a mentor has not answered yet, and a funder can withdraw interest the same way.
- A mentor can pause new requests with the **Taking new requests** switch on their dashboard.
- When the administrator rejects a waiting mentor or funder, that person gets an email saying so, and sign-in tells them the account was not approved. A mentor or funder can only be approved after filling in their profile.
- List pages and dashboards show grey placeholder shapes while their data loads (`src/components/loaders/page-skeleton.jsx`). Each loading file sits in a folder of its own, such as `plans/(list)/`, so it never covers a page that can answer "not found".
- The administrator gets a separate console (`src/components/admin/admin-shell.jsx`): a sidebar with Overview, Users, Sources and fees, Content and AI usage, and the number of accounts waiting for approval next to Users. At the bottom of the sidebar are a Profile card, View public pages and Sign out. The top bar shows an ADMIN tag on desktop and the section name in the middle on tablets and phones. The users list can be searched by name or email.

## Security

- Passwords are stored only as bcrypt hashes.
- The login cookie is `httpOnly`, `secure` in production and `sameSite: lax`.
- After 5 wrong passwords, sign-in for that email is locked for 15 minutes.
- Daily limits on roadmaps and chat, and a per-minute limit on messages.
- All input is checked with Zod schemas before use.
- Every page and route checks the user's role and status, not only `proxy.js`.

## The look

- Main colours are emerald (green, for main actions) and ink (dark grey for text). They are CSS variables in `src/app/globals.css`.
- Page layout parts are in one kit: `src/components/layout.jsx`.
- Status badges (such as Pending, Accepted, Done) come from one component: `src/components/stamp.jsx`. Buttons that delete or reject are solid red.
- `.vscode/settings.json` tells the editor to read CSS files as Tailwind CSS, so `@theme` and similar rules show no warnings.
- Animations use Motion. `src/components/motion-provider.jsx` sets `reducedMotion="user"`, so animations are reduced if the user's device asks for less motion.
