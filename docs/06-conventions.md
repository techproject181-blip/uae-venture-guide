# Conventions

How code is written in this project. The project owner set two rules: reuse first (A10 in [01-product.md](01-product.md)) and the style in [Writing code](#writing-code) (A11). Both cover browser code, server code, tests and scripts, except that the speed rules in [Fast by default](#fast-by-default) cover only code that runs while serving a request.

## Reuse first

Write each piece of logic once, and write it so the next caller can use it. Before writing anything, look for what already does the job.

### Before writing new code

Go down this list and stop at the first thing that does the job:

1. **This repo.** Search `src/lib`, `src/components` and `tests/helpers`, and check the [catalogue](#catalogue) below.
2. **What the stack already includes.** Zod parses, validates and formats errors. The shadcn-style components on Base UI give the UI primitives, and the [layout kit](#page-structure) gives the page structure. Mongoose does atomic updates and declares indexes, and MongoDB itself provides TTL indexes. bcryptjs hashes passwords and jose signs the session token. `Intl` formats dates, numbers and currency. Next.js handles redirects, caching and revalidation.
3. **A small, maintained library.** Only after checking that nothing above covers it. Record it in the stack table in [02-architecture.md](02-architecture.md).
4. **New code.** Write it as a helper from the start if a second caller is foreseeable.

### Where shared code lives

A helper sits in the most specific place that every caller can reach. When a component used by one feature gets a caller in another, it moves up to `src/components/`.

| Kind | Location | Runs in | Examples |
| --- | --- | --- | --- |
| Pages and API route handlers | `src/app` | Server (pages render on the server) | `(app)/plans/[id]/page.js`, `api/requests/[id]/messages/route.js` |
| Fixed lists (emirates, sectors, roles) | `src/lib/constants.js` | Browser and server | `EMIRATES`, `SECTORS`, `valuesOf`, `labelOf` |
| Zod schemas | `src/lib/schemas/` | Browser and server | `auth.js`, `plans.js`, `messages.js`, shared pieces in `helpers.js` |
| Pure rules and sums | `src/lib/` | Browser and server | `budget.js`, `format.js` |
| Sign-in and sessions | `src/lib/session.js`, `src/lib/jwt.js`, `src/lib/guards.js` | Server (`jwt.js` also in the proxy) | `createSession`, `getCurrentUser`, `verifySessionToken`, `requireUser` |
| API route plumbing | `src/lib/api.js` | Server | `route`, `readBody`, `requireApiUser`, `ApiError` |
| Access rules and data helpers | `src/lib/` | Server | `canReadPlan` (`plans.js`), `getConversation` (`messages.js`), `listPitchCards` (`funding.js`), `consumeQuota` (`quota.js`) |
| Database models | `src/models/` | Server | One Mongoose model per collection: `User`, `Plan`, `RequestMessage` |
| Route protection | `src/proxy.js` | Server, before matched pages | Sends signed-out visitors to `/sign-in` |
| Page structure | `src/components/layout.jsx` | Both | `PageHeader`, `Panel`, `Split`, `CardGrid` (see [Page structure](#page-structure)) |
| Form parts | `src/components/form/` | Browser | `TextField`, `SubmitButton`, `FormAlert`, `useApiForm` |
| UI primitives | `src/components/ui/` | Both | shadcn-style components on Base UI. Vendor code: change them through the shadcn CLI, not by hand |
| Components for one feature | `src/components/<feature>/` | Both | `requests/conversation.jsx`, `plans/task-row.jsx` |
| Test helpers | `tests/helpers/`, `tests/e2e/helpers.js` | Tests | `setupTestDatabase`, `signUp`, `createPlan`, `expectNotFound` |

There is no `src/server` or `src/hooks` folder. Server-only helpers sit in `src/lib` next to the shared ones, and the one form hook (`useApiForm`) sits with the form parts.

### When to extract

- **On the second use.** The second time the same logic appears, extract it before the change is merged. Copying now and cleaning up later does not happen in practice.
- **With the first use, when repetition is already planned.** Every form validates with Zod, every signed-in page has a header, every list shows dates. Those helpers are built with their first caller.
- **Not speculatively.** A helper for a use nobody has planned is also wasted code.
- **Same logic, not just similar-looking code.** Two pieces that look alike but change for different reasons stay separate. Mentor request statuses and funding interest statuses share some values but follow different rules, so they get separate code.

### What a helper looks like

- One job, and a name that says what it does: `formatDate`, not `utils.format`.
- Clear inputs and outputs, described in its JSDoc comment. Dependencies come in as arguments where practical, so tests and scripts can call it too.
- Pure when it can be. Side effects stay at the edges: API route handlers and the data helpers in `src/lib`.
- A doc comment saying what it is for (see [Comments](#comments)).
- Unit tests beside it (`*.test.js`), or database tests in `tests/integration` when it reads or writes MongoDB.
- Grouped by topic. No catch-all files. `src/lib/utils.js` holds only `cn`, which the UI components use, and nothing else.

### How the rule is checked

- **The catalogue.** The table below is updated in the same change that adds a shared helper.
- **Review.** The first review question is "does something already do this?", before "is this correct?"

## Writing code

Someone who has never seen the repo should be able to open any file and follow it.

### Keep it simple

- Plain functions and React components. Do not write classes, except `Error` subclasses such as `ApiError`, which callers tell apart with `instanceof`. Using a library's classes (`Intl.DateTimeFormat`, `mongoose.Schema`) is fine.
- One job per file, named for that job: `messages.js`, `budget.js`, `task-row.jsx`. When a file picks up a second job, split it.
- Early returns instead of nested `if` blocks, and no nested ternaries. When a value depends on more than one condition, work it out in a small function with early returns.
- API route handlers and data helpers read top to bottom in one order: check who is asking, parse the input, check access to the specific record, do the work, return. Nothing is written before the last check passes.
- Names say what a thing is or does: `canReadPlan`, `getConversation`, `formatDate`. A boolean reads as a yes-or-no statement (`canSend`, `isMentor`, `shared`), never as `flag` or `check`.
- Files are kebab-case and components PascalCase; Mongoose model files are named after the model (`RequestMessage.js`). Hard-coded lists and lookup tables, and hard-coded values that other files import, are UPPER_SNAKE (`EMIRATES`, `DAILY_LIMITS`, `MESSAGES_PER_MINUTE`). Everything else is camelCase.

### JavaScript

- All code is JavaScript, written as ES modules (`import` and `export`). Server and browser code share the `@/` alias for `src/`.
- Incoming data is never trusted. Every API route checks its body or query with a Zod schema from `src/lib/schemas/` (`readBody(request, schema)`), and forms run the same schema in the browser first (`useApiForm`). Mongoose schemas are the second check before anything is stored.
- A fixed set of allowed values (roles, statuses, emirates) is one exported array in `src/lib/constants.js` or the model, and Zod (`z.enum`) and Mongoose (`enum`) both read from it. It is never written out twice.
- Expected failures in an API route are thrown as `ApiError(status, message, fieldErrors)`; `route()` turns them into a JSON answer. A record the user may not see is "not found" (404), not "forbidden", so ids reveal nothing. Any other error becomes a 500 with a plain message and is logged on the server.
- Mongoose reads that only show data use `.lean()` and `.select()` the fields they need.

### Page structure

Every page is built from the layout kit in `src/components/layout.jsx`, so pages of the same kind line up the same way. Spacing lives in the kit, not on the pages.

| Piece | What it is for |
| --- | --- |
| `PageHeader` | The top of every page: an optional back link, the title, a short line under it, and the page's buttons |
| `Panel` | The one container of the app: a white panel, with an optional header row (title, description, buttons) and footer. `flush` drops the padding for tables and lists |
| `Stack` | Panels stacked with the standard gap |
| `Split` | Two columns from 1024px: the main content, and a narrower column on the right for help or facts. On phones the right column comes after |
| `CardGrid` | Cards in a grid: one column on phones, two from 640px, three from 1280px |
| `ListPanel` | Rows inside one panel, split by thin rules |
| `TablePanel` | A table inside a panel that scrolls sideways on its own on small screens |
| `StatGrid`, `Stat` | Numbers at the top of a dashboard, each with its label |
| `FormActions` | The buttons at the end of a form, in one row |

The usual shapes:

- **List pages:** `PageHeader`, then `CardGrid`, `ListPanel` or `TablePanel`.
- **Detail and form pages:** `PageHeader`, then `Split` (main panels on the left, help or facts on the right).
- **Dashboards:** `PageHeader`, then `StatGrid`, then `Split` or a two-column grid of panels.

`src/components/page-header.jsx` re-exports `PageHeader` so older imports keep working, and also holds `EmptyState`, which a list shows when it has nothing in it yet.

### Animation

Small interface animations use the `motion` library (`motion/react`): for example the moving highlight under the current navigation link and the role tabs on the landing page. `MotionProvider` (`src/components/motion-provider.jsx`) wraps the app with `MotionConfig reducedMotion="user"`, so every animation follows the computer's "reduce motion" setting. Simple effects that need no JavaScript, such as cards rising in one after another (the `.stagger` class), are plain CSS in `src/app/globals.css`, also switched off for reduced motion. Animations are short and never hide content or delay an action.

### Fast by default

These rules cover code that runs while serving a request. Scripts and tests may trade speed for simplicity.

- **Server first.** Pages and layouts are Server Components. `"use client"` goes at the top of the smallest file that needs state, event handlers, effects or browser APIs. Everything that file imports goes to the browser with it, so keep its imports light.
- **No hand-written memoization by default.** Do not write `useMemo`, `useCallback` or `React.memo` unless an effect must not re-run because a dependency changed identity, or a measurement shows a slowdown. The comment above the hook says which.
- **Read once per render.** A server read that several components need in one request is wrapped in React's `cache()` once, at module level, as `getCurrentUser` and `getPlanForViewer` are, so the layout and the page share one lookup. Pass ids, not objects built for the call, because `cache()` compares arguments with `Object.is`.
- **Cheap queries.** A query's filter and sort are both covered by an index declared in the model, it asks only for the fields it uses, and a list that grows with use comes back one page at a time (or with a limit, as a conversation read returns at most 500 messages). Do not query once per item: fetch related documents with one `$in` query or `populate`. Data saved together lives in one document, so saving it is one write, as storing a generated roadmap in its plan is.
- **Small downloads.** A heavy browser-only library, such as Recharts, loads with `next/dynamic` inside a Client Component (`budget-charts.jsx`, `post-chart.jsx`). Do not use `next/dynamic` for this in a page or layout. Fonts come through `next/font`. Post pictures are web addresses on other sites, shown with `next/image` (`unoptimized`, because the app does not resize them).
- **Measure before tuning.** The defaults above always apply. Anything beyond them, such as a cache, a copied field or a hand-written `useMemo`, starts from a measurement: Lighthouse, the React DevTools profiler, or the query's `explain()` output.

### Comments

A comment says why the code is the way it is. What the code does should be clear from its names.

- Every exported function, component, hook and constant that other files use has a `/** … */` JSDoc comment saying what it is for. Exports that Next.js reads from its special files (`page.js`, `layout.js`, `route.js`, `proxy.js`), such as the default component, `metadata`, `GET` or `config`, get none, and neither do config files.
- A doc comment starts with one sentence saying what the export is for. Add more only for what a caller must know: it redirects, it throws, it is safe to run again, or what an argument means (as `requireUser`'s comment explains where each kind of account is sent).
- Every other comment sits on its own line above the code it explains and is written as a sentence, with a capital letter and a full stop. It says only what the code cannot: a limit (`// For the "messages sent in the last minute" limit.`), a rule (`// Only one waiting request per entrepreneur and mentor at a time.`), an order that matters, what a library call does when its name does not say, or a workaround, with the reason.
- A function that is not exported gets a doc comment only when its name and arguments leave its purpose unclear.
- If a line needs a comment to say what it does, rename or simplify the code first.

Never write:

| Kind | Example |
| --- | --- |
| A comment that repeats the code | `// Set the status to active` above `status = "active"` |
| Step narration | `// Step 1: validate the input`, `// Now we save the user` |
| Notes about the change, which belong in the commit message | `// Updated to use projection`, `// Fixed the redirect loop`, `// New: role check` |
| Section banners and labels | `// ===== Helpers =====` |
| Filler openings | `// This function is responsible for…`, `// Helper to…`, `// Note:`, `// Important:` |
| Hedging | `// Should work now`, `// Just in case` |
| Sales words | robust, seamless, powerful, comprehensive, elegant |
| `@param` and `@returns` tags; explain an argument in the sentence instead | `@param userId - The user ID` |
| Commented-out code, or a TODO without an issue number | `// const old = …`, `// TODO: fix later`. Write `// TODO(#42): …` |
| Emoji or tool attribution | `// ✨ Generated by …` |

Not like this, because it repeats the name:

```js
/** This function checks if the user can read the plan and returns true or false. */
export async function canReadPlan(user, plan) {}
```

Like this, because it says who passes the check:

```js
/**
 * The owner and admins always; a mentor while their request with this plan is
 * accepted; a funder while their interest is accepted and the plan is shared.
 */
export async function canReadPlan(user, plan) {}
```

### Documentation

- `README.md`: what the project is, how to set it up, and how to run it.
- `docs/`: product, architecture, schema, AI, roadmap, these conventions, deployment, test cases, and one implementation plan per phase in `docs/plans/` (dated records, kept as written). A change that makes a doc wrong updates the doc in the same change.
- Inside the code, names and the doc comments above are the documentation. There are no per-folder READMEs and no long header comments.

### How these rules are checked

- **By `npm run lint`:** ESLint with the Next.js rules (`eslint-config-next`, core web vitals), including the React Hooks rules.
- **By the tests:** `npm test` (unit and database tests) and `npm run test:e2e` (browser tests with axe). GitHub Actions runs lint, the tests, the build and the browser tests on every push.
- **In review:** names, one job per file, the order of server code, the page structure, the speed rules and the wording of comments.

## Catalogue

Search here first.

| Helper | Location | What it does |
| --- | --- | --- |
| `connectDB` | `src/lib/db.js` | Opens the Mongoose connection once and reuses it |
| `createSession`, `deleteSession`, `getCurrentUser` | `src/lib/session.js` | Sets and clears the session cookie; the signed-in user, read from the database once per request |
| `signSessionToken`, `verifySessionToken`, `SESSION_COOKIE` | `src/lib/jwt.js` | The signed JWT in the session cookie (jose). Kept apart so the proxy can use it without the database code |
| `requireUser` | `src/lib/guards.js` | Top of every signed-in page: the user, or a redirect for signed-out, suspended or pending accounts, and 404 for a wrong role |
| `route`, `readBody`, `requireApiUser`, `requireApiUserOrPending`, `ApiError` | `src/lib/api.js` | API route plumbing: errors as JSON, the body checked with Zod, the user checked |
| `fieldErrors`, `aed`, `wholeNumber`, `optionalText`, `webUrl`, `checkbox`, `multiChoice` | `src/lib/schemas/helpers.js` | Shared pieces for the Zod schemas |
| `EMIRATES`, `SECTORS`, `ROLE_LABELS`, `valuesOf`, `labelOf` | `src/lib/constants.js` | Fixed lists and their labels |
| `canReadPlan`, `findOwnPlan`, `getPlanForViewer`, `createPlanWithRoadmap` | `src/lib/plans.js` | Who may read a plan, owner-only lookups, and saving a new plan with its roadmap |
| `getConversation`, `findConversation`, `listMessages`, `sendMessage` | `src/lib/messages.js` | Every rule of a guidance request's conversation |
| `listMentors`, `getMentor` | `src/lib/community.js` | The mentor directory |
| `listPitchCards`, `getPitchCard`, `listInterestsForOwner`, `listInterestsForFunder` | `src/lib/funding.js` | Pitch cards and funding interests |
| `consumeQuota`, `uaeDay`, `DAILY_LIMITS` | `src/lib/quota.js` | The atomic daily AI limit, and today's date in the UAE |
| `sendEmail`, `appUrl` | `src/lib/email.js` | Notification and password-reset emails (printed in the terminal in development) |
| `firstYearTotal`, `remainingBudget`, `totalsByCategory`, `progressPercent` | `src/lib/budget.js` | Budget sums and plan progress |
| `formatAed`, `formatAedRange`, `formatDate` | `src/lib/format.js` | Amounts in dirhams and dates as read in the UAE |
| `generateRoadmap` | `src/lib/roadmap/generate.js` | The sample planner (until an AI provider is connected) |
| `answerQuestion` | `src/lib/chat/answer.js` | The sample chat assistant and source search |
| `sendJson`, `postJson`, `formValues`, `focusFirstError` | `src/lib/form-helpers.js` | Sending a form to an API route from the browser |
| `PageHeader`, `Panel`, `Stack`, `Split`, `CardGrid`, `ListPanel`, `TablePanel`, `StatGrid`, `Stat`, `FormActions`, `BackLink` | `src/components/layout.jsx` | The layout kit (see [Page structure](#page-structure)) |
| `EmptyState` | `src/components/page-header.jsx` | What an empty list shows |
| `TextField`, `PasswordField`, `TextAreaField`, `SelectField`, `CheckboxField`, `CheckboxGroup` | `src/components/form/fields.jsx` | Labelled inputs with accessible errors |
| `FormPart`, `FormAlert`, `SubmitButton`, `useApiForm` | `src/components/form/` | A form section, the form's alert, a submit button that shows progress, and the hook that checks with Zod and sends to an API route |
| `MotionProvider` | `src/components/motion-provider.jsx` | Makes every `motion` animation follow the "reduce motion" setting |
| `setupTestDatabase`, `addReferenceData`, `intake` | `tests/helpers/` | A fresh database per test file, and sample sources, fees and intake answers |
| `signUp`, `signIn`, `createPlan`, `expectNotFound`, `expectAccessible` | `tests/e2e/helpers.js` | Browser-test accounts, plans, and the 404 and axe checks |
