# Conventions

How code is written in this project. The project owner set two rules: reuse first (A10 in [01-product.md](01-product.md)) and the style in [Writing code](#writing-code) (A11). Both cover browser code, server code, tests and scripts, except that the speed rules in [Fast by default](#fast-by-default) cover only code that runs while serving a request.

## Reuse first

Write each piece of logic once, and write it so the next caller can use it. Before writing anything, look for what already does the job.

### Before writing new code

Go down this list and stop at the first thing that does the job:

1. **This repo.** Search `src/lib`, `src/hooks`, `src/components`, `src/server` and `tests/support`, and check the [catalogue](#catalogue) below.
2. **What the stack already includes.** Zod parses, validates and formats errors. shadcn/ui has the UI primitives. Better Auth handles sign-up, sign-in, sessions and password hashing. The MongoDB driver does atomic updates, and MongoDB itself provides TTL indexes and validators. `Intl` formats dates, numbers and currency. Next.js handles redirects, caching and revalidation.
3. **A small, maintained library.** Only after checking that nothing above covers it. Record it in the stack table in [02-architecture.md](02-architecture.md).
4. **New code.** Write it as a helper from the start if a second caller is foreseeable.

### Where shared code lives

A helper sits in the most specific place that every caller can reach. When a component that lived beside one route group gets a caller in another group, it moves up to `src/components/`.

| Kind | Location | Runs in | Examples |
| --- | --- | --- | --- |
| Domain constants, enums, pure rules | `src/lib/domain/` | Browser and server | `roles.ts`, later `budget.ts`, `progress.ts` |
| Zod schemas | `src/lib/validation/` | Browser and server | `auth.ts` |
| Form plumbing | `src/lib/forms/` | Browser and server | `parseForm`, `FormState` |
| Formatting | `src/lib/format.ts` | Browser and server | `formatDate`, later `formatAed` |
| React hooks | `src/hooks/` | Browser | `useValidatedForm` |
| UI primitives | `src/components/ui/` | Both | shadcn components. Vendor code: change them through the shadcn CLI, not by hand |
| Composed components used in several places | `src/components/` | Both | `PageHeader`, `FormShell`, `Field`, `SubmitButton` |
| Components used by one route group | Beside those routes | Both | `src/app/(auth)/auth-card.tsx` |
| Data access, policies, auth | `src/server/` | Server | `setUserStatus`, `canManageUsers`, `createAuth` |
| Test helpers and builders | `tests/support/` | Tests | `signUp`, `makeAdmin`, `buildViewer` |

### When to extract

- **On the second use.** The second time the same logic appears, extract it before the change is merged. Copying now and cleaning up later does not happen in practice.
- **With the first use, when repetition is already planned.** Every form validates with Zod, every signed-in page has a header, every list shows dates. Those helpers are built with their first caller.
- **Not speculatively.** A helper for a use nobody has planned is also wasted code.
- **Same logic, not just similar-looking code.** Two pieces that look alike but change for different reasons stay separate. Mentor request statuses and funding interest statuses share some values but follow different rules, so they get separate code.

### What a helper looks like

- One job, and a name that says what it does: `formatDate`, not `utils.format`.
- Typed inputs and outputs. Dependencies come in as arguments where practical, as `createAuth({ db, client })` does, so tests and scripts can call it too.
- Pure when it can be. Side effects stay at the edges: the data layer and Server Actions.
- A doc comment saying what it is for (see [Comments](#comments)).
- Unit tests beside it (`*.test.ts`).
- Grouped by topic. No `utils.ts` catch-all files. The one shadcn generates (`src/lib/utils.ts`, holding `cn`) stays as it is and holds nothing else.

### How the rule is enforced

- **Copy-paste check.** `npm run check` runs [jscpd](https://github.com/kucherenko/jscpd) over all TypeScript and JavaScript in the repo, except the shadcn vendor folder. Any block of 50 or more tokens that appears in two places fails the check.
- **Dead-code check.** knip fails the check on unused files and exports, so helpers nobody calls do not pile up.
- **The catalogue.** Each phase plan lists the helpers it adds, and the table below is updated in the same commit.
- **Review.** The first review question is "does something already do this?", before "is this correct?"

## Writing code

Someone who has never seen the repo should be able to open any file and follow it.

### Keep it simple

- Plain functions and React components. Do not write classes, except `Error` subclasses such as `ForbiddenError`, which callers tell apart with `instanceof`. Using a library's classes (`MongoClient`, `Intl.DateTimeFormat`) is fine.
- One job per file, named for that job: `form-shell.tsx`, `users.ts`, `roles.ts`. When a file picks up a second job, split it.
- Early returns instead of nested `if` blocks, and no nested ternaries. When a value depends on more than one condition, work it out in a small function with early returns.
- Server Actions, route handlers and data functions read top to bottom in one order: check who is asking, parse the input, check access to the specific record, do the work, return. Nothing is written before the last check passes.
- Names say what a thing is or does: `listUsersForAdmin`, `canReadPlan`, `formatDate`. A boolean reads as a yes-or-no statement (`canReadPlan`, `isGuarded`, `signedIn`, `pending`, `shared`), never as `flag` or `check`.
- Files are kebab-case and components PascalCase. Hard-coded lists and lookup tables, and hard-coded values that other files import, are UPPER_SNAKE (`ROLES`, `DASHBOARD_PATHS`, `ACCOUNT_SUSPENDED`). Everything else is camelCase, including computed values (`serverEnv`, `dateFormat`) and test fixtures (`validSignup`).

### TypeScript

- `strict` stays on. No `any`: accept `unknown` and parse it with Zod. No `@ts-ignore`; `@ts-expect-error` only with a description of why.
- A type has one source. Data that Zod checks uses `z.infer<typeof schema>`. Each stored document has one hand-written type in `src/server/db/collections.ts` (`UserDoc`), and code reads through a collection typed with it. Everything else is derived with `Pick`, `Omit` or an indexed type (`UserDoc["role"]`), never written out again.
- A fixed set of allowed values (roles, statuses, emirates) is an `as const` array with the union type taken from it (`ROLES` and `UserRole`). No TypeScript `enum`s.
- Expected failures are returned, not thrown. A form's Server Action returns a `FormState` with the errors; a helper returns a result union, as `parseForm` returns `{ ok: true, data } | { ok: false, state }`. Throw only for a broken invariant, a forbidden action (`ForbiddenError`), a record that is missing or hidden from the viewer (`NotFoundError`), or a service that is down.
- Mark type-only imports with `type`: `import type { Db } from "mongodb"`, or `import { MongoClient, type Db } from "mongodb"` when one import brings in both. Narrow with a check instead of a non-null assertion (`!`).

### Fast by default

These rules cover code that runs while serving a request. Scripts and tests may trade speed for simplicity.

- **Server first.** Pages and layouts are Server Components. `"use client"` goes at the top of the smallest file that needs state, event handlers, effects or browser APIs. Everything that file imports goes to the browser with it, so keep its imports light.
- **Memoization is the compiler's job.** React Compiler (`reactCompiler: true` in `next.config.ts`) memoizes client components and hooks that follow the Rules of React. It skips code that breaks them and the build still passes; the `react-hooks` lint rules in `eslint-config-next` report that code, so fix it rather than silencing the rule. Do not write `useMemo`, `useCallback` or `React.memo` by hand, except when an effect must not re-run because a dependency changed identity, or when profiling shows a slowdown the compiler missed. The comment above the hook says which. If the compiler breaks a component, add `"use no memo"` to it with a comment linking the issue. shadcn components in `src/components/ui/` keep their own memoization.
- **Read once per render.** A server read that several components need in one request is wrapped in React's `cache()` once, at module level, as `getViewer` is, so the layout and the page share one lookup. `cache()` compares arguments with `Object.is`, so pass ids, not objects built for the call. Outside a Server Component render it calls straight through, so the proxy's session check is a separate lookup.
- **Cheap queries.** A query's filter and sort are both covered by an index, it asks only for the fields it uses (`projection`), and a list that grows with use comes back one page at a time. Type a projected read to match, as in `findOne<Pick<UserDoc, "_id" | "role">>(filter, { projection: { role: 1 } })`. Without the type argument the driver types the result as the whole document, so a field that was left out still compiles and is `undefined` at run time. Do not query once per item: fetch related documents with one `$in` query and match them back by `_id`, because `$in` does not return them in the array's order. Data saved together lives in one document, so saving it is one atomic write, as storing a generated roadmap in its plan is.
- **Small downloads.** A heavy browser-only library, such as Recharts or a Markdown editor, loads with `next/dynamic` inside a Client Component, with `ssr: false` when it cannot render on the server. Do not use `next/dynamic` for this in a page or layout: those are Server Components, where Next.js does not split the import into its own chunk and `ssr: false` is a compile error. Pictures come from Cloudinary at the size they are shown, through `next/image` with a Cloudinary loader, and fonts through `next/font`.
- **Measure before tuning.** The defaults above always apply. Anything beyond them, such as a cache, a copied field or a hand-written `useMemo`, starts from a measurement: Lighthouse, the React DevTools profiler, or the query's `explain()` output. The full Lighthouse pass is in Phase 7.

### Comments

A comment says why the code is the way it is. What the code does should be clear from its names and types.

- Every exported function, component, hook and constant has a `/** … */` comment saying what it is for. So does every exported type, except one that only renames another (`UserRole = (typeof ROLES)[number]`). Exports that Next.js reads from its special files (`page.tsx`, `layout.tsx`, `route.ts`, `proxy.ts`, `error.tsx`), such as the default component, `metadata`, `GET` or `config`, get none, and neither do config files.
- A doc comment starts with one sentence saying what the export is for. Add more only for what a caller must know: it redirects, it throws, it is safe to run again, or what an argument means (as `parseForm`'s comment explains `keep`). Keep it on one line up to 100 characters, and wrap anything longer into a block at 80, because Prettier does not wrap comments.
- Every other comment, at module level and in config files too, sits on its own line above the code it explains and is written as a sentence, with a capital letter and a full stop. It says only what the code cannot: a limit (`// The free cluster allows 500 connections in total.`), a rule (`// Admins are never created through signup.`), an order that matters (`// src/server/env.ts reads this when it is first imported, so set it first.`), what a library call does when its name does not say, or a workaround, with a link to the reason.
- A function that is not exported gets a doc comment only when its name and signature leave its purpose unclear.
- If a line needs a comment to say what it does, rename or simplify the code first.

Never write:

| Kind | Example |
| --- | --- |
| A comment that repeats the code | `// Set the status to active` above `status = "active"` |
| Step narration | `// Step 1: validate the input`, `// Now we save the user` |
| Notes about the change, which belong in the commit message | `// Updated to use projection`, `// Fixed the redirect loop`, `// New: role check` |
| Section banners and labels | `// ===== Helpers =====`, `// Types` |
| Filler openings | `// This function is responsible for…`, `// Helper to…`, `// Note:`, `// Important:` |
| Hedging | `// Should work now`, `// Just in case` |
| Sales words | robust, seamless, powerful, comprehensive, elegant |
| `@param` and `@returns` tags; explain an argument in the sentence instead | `@param userId - The user ID` |
| Commented-out code, or a TODO without an issue number | `// const old = …`, `// TODO: fix later`. Write `// TODO(#42): …` |
| Emoji or tool attribution | `// ✨ Generated by …` |

Not like this, because it repeats the name and the return type:

```ts
/** This function checks if the user is an admin and returns true or false. */
export function canManageUsers(viewer: Viewer | null): boolean;
```

Like this, because it says what the check is for:

```ts
/** Active admins manage accounts: list them, approve, suspend, reactivate. */
export function canManageUsers(viewer: Viewer | null): boolean;
```

### Documentation

- `README.md`: what the project is, how to set it up, and how to run it.
- `docs/`: product, architecture, schema, AI, roadmap, these conventions, and one implementation plan per phase in `docs/plans/`. A change that makes a doc wrong updates the doc in the same commit.
- Inside the code, names, types and the doc comments above are the documentation. There are no per-folder READMEs and no long header comments.

### How these rules are checked

- **By `npm run check`:** strict `tsc`; ESLint's `no-explicit-any` and `ban-ts-comment`, which reject `any` and an `@ts-expect-error` without a description; the `react-hooks` rules that report code React Compiler skipped; and `consistent-type-imports` and `no-non-null-assertion`, added in `eslint.config.mjs`.
- **In review:** names, one job per file, the order of server code, the speed rules and the wording of comments.

## Catalogue

Search here first. Phase 0 entries arrive with the Phase 0 plan; later ones are planned.

| Helper | Location | What it does | Phase |
| --- | --- | --- | --- |
| `ROLES`, `SIGNUP_ROLES`, `initialStatusFor`, `dashboardPathFor` | `src/lib/domain/roles.ts` | Role rules shared by forms, auth and routing | 0 |
| `loginSchema`, `signupSchema` | `src/lib/validation/auth.ts` | Auth form shapes, used in the browser and in actions | 0 |
| `parseForm`, `fieldErrorsOf`, `FormState` | `src/lib/forms/form-state.ts` | Turns submitted form data into typed data, or into field errors plus the values to put back | 0 |
| `useValidatedForm`, `ValidatedForm` | `src/hooks/use-validated-form.ts` | Connects a form to its Server Action and runs the same Zod schema in the browser first | 0 |
| `FormShell`, `Field`, `SubmitButton`, `FormAlert` | `src/components/form/` | The form element with its alert; a labelled input with an accessible error; a submit button that shows progress | 0 |
| `PageHeader` | `src/components/page-header.tsx` | Title and description at the top of a signed-in page | 0 |
| `AuthCard` | `src/app/(auth)/auth-card.tsx` | The card every auth screen sits in | 0 |
| `CredentialsFields` | `src/app/(auth)/credentials-fields.tsx` | The email and password inputs shared by login and signup | 0 |
| `formatDate` | `src/lib/format.ts` | A date as read in the UAE (Dubai time zone) | 0 |
| `setupDatabase`, `COLLECTIONS` | `src/server/db/` | Applies collection validators and indexes | 0 |
| `createAuth` | `src/server/auth/create-auth.ts` | Better Auth with the account rules, for the app, scripts and tests | 0 |
| `viewerSchema`, `getViewer`, `requireViewer` | `src/server/auth/` | The signed-in user, parsed and checked | 0 |
| `routeDecision`, `isGuarded` | `src/server/auth/route-decision.ts` | Redirect rules for the proxy | 0 |
| `canManageUsers`, `canChangeStatusOf` | `src/server/policies/accounts.ts` | Account access rules | 0 |
| `listUsersForAdmin`, `setUserStatus` | `src/server/data/users.ts` | Admin account management | 0 |
| `ForbiddenError`, `NotFoundError` | `src/server/errors.ts` | Errors the data layer throws | 0 |
| `seedDemoUsers` | `src/server/db/seed.ts` | Demo accounts for development, previews and e2e | 0 |
| `signUp`, `post`, `sessionCookie`, `viewerOf`, `makeAdmin`, `testAuth` | `tests/support/auth.ts` | Integration-test accounts, viewers tied to them, and raw HTTP calls to Better Auth | 0 |
| `buildViewer` | `tests/support/viewers.ts` | A `Viewer` for unit and integration tests | 0 |
| `formatAed` | `src/lib/format.ts` | Whole-dirham amounts | 1, planned |
| `progressOf` | `src/lib/domain/progress.ts` | Plan progress percentage | 1, planned |
| `searchSources` | `src/server/data/sources.ts` | Source lookup, Atlas Search or text index | 1, planned |
| `consumeAiQuota` | `src/server/ai/quotas.ts` | Atomic daily AI quota | 1, planned |
| Budget totals | `src/lib/domain/budget.ts` | First-year totals and remaining budget | 2, planned |
