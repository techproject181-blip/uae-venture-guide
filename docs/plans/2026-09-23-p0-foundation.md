# Phase 0: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Next.js 16 app on MongoDB Atlas where each role signs up and lands on its own dashboard, an admin approves mentors and funders, every account rule is proven by tests, and CI is green.

**Architecture:** One Next.js App Router app. Better Auth handles accounts and stores them in MongoDB; its hooks enforce the signup, role-change and suspension rules. All other database access goes through a server-only data layer (`src/server/`) that takes the signed-in viewer and checks pure, unit-tested policies; an ESLint rule stops any other code from importing the driver. `src/proxy.ts` makes UX redirects through a pure `routeDecision()`, and every page checks access again. Development uses the owner's Atlas cluster; automated tests use a throwaway in-memory MongoDB.

**Tech Stack:** Next.js 16.3.6, React 19.2 with React Compiler 1.0, TypeScript, Tailwind CSS v4, shadcn/ui 4.21 (Radix base, Nova preset), MongoDB Node driver 7.6, Better Auth 1.7, Zod 4, `@vercel/functions`, Vitest 5, `mongodb-memory-server` 11, `tsx`, Playwright 1.63, `@axe-core/playwright` 4.13.

**Spec:** [01-product.md](../01-product.md), [02-architecture.md](../02-architecture.md), [03-schema.md](../03-schema.md) (sections Accounts and Access rules), [05-roadmap.md](../05-roadmap.md) (Phase 0).

## Global Constraints

- Node 24 and npm. Commit `package-lock.json`.
- Next.js App Router in `src/`, import alias `@/*`. Route guards live in `src/proxy.ts`, exporting `proxy` and `config`. Do not set a `runtime` in the proxy file; Next 16 runs proxies on Node.js and throws if one is set.
- MongoDB is reached only through the official `mongodb` driver, and only from `src/server/`. An ESLint rule enforces this for the rest of `src/`. No Mongoose.
- Zod on both sides (A9): schemas in `src/lib/validation/` validate forms in the browser and inputs on the server. Enums and pure logic shared by both live in `src/lib/domain/`.
- Reuse first (A10, [06-conventions.md](../06-conventions.md)): before writing code, check the helper catalogue and what the stack already provides, and put shared logic in helpers at the locations that doc lists. `npm run check` includes a copy-paste check (jscpd) that fails on any block of 50+ tokens repeated outside the shadcn vendor folder. Every helper this plan adds is already listed in the catalogue.
- Code style follows [Writing code](../06-conventions.md#writing-code): simple files with one job, strict TypeScript without `any`, and comments that say why rather than what. Exports get a `/** … */` comment as [Comments](../06-conventions.md#comments) describes. No step narration, section banners or filler comments.
- React Compiler is on (`reactCompiler: true`). Follow [Fast by default](../06-conventions.md#fast-by-default): no hand-written `useMemo`, `useCallback` or `React.memo` outside its exceptions, and server reads that several components need in one render go through React's `cache()`.
- Modules under `src/server/` that read environment variables, the database client or the app's auth instance start with `import "server-only"`. Pure modules there (policies, schemas, factories that take their dependencies as arguments) do not, so scripts and tests can use them.
- Signup roles are `entrepreneur`, `mentor` and `funder`. Entrepreneurs start `active`; mentors and funders start `pending`. Admins are never created through signup. Users cannot change their own `role` or `status`. Suspended users cannot sign in.
- No MongoDB in Docker or on the machine. Development uses the Atlas cluster in `.env.local`; automated tests use `mongodb-memory-server`, which runs MongoDB 8.2 while Atlas free runs 8.0, so use no feature newer than 8.0.
- Secrets live only in `.env.local` (git-ignored) and in Vercel. Never commit them and never paste them into chat.
- Use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`). Never `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left` or `text-right` (A2).
- Prettier settings: semicolons, double quotes, trailing commas, `printWidth` 80.
- Commit messages use Conventional Commits (`feat:`, `chore:`, `test:`, `ci:`, `docs:`).
- Every task ends with `npm run check` passing.

## Prerequisites

- Working directory for every command: `/Users/muneeb/Desktop/Data/All-Dev-working/Development/personal/uae-centure-guide` (the repository root, which has its own `.git`).
- Before Task 2, Step 8, the project owner creates the development cluster:
  1. In Atlas, create a project `uae-venture-guide-dev`, then a **Free** cluster on **AWS, Mumbai (`ap-south-1`)**.
  2. Under Database Access, add a user (for example `uvg_app`) with a generated password and **readWrite** on `uae_venture_guide_dev` and `uae_venture_guide_preview` only.
  3. Under Network Access, add the current IP address.
  4. Under Connect, then Drivers, copy the `mongodb+srv://…` string.
  5. Copy `.env.example` (created in Task 2) to `.env.local` and fill it in. The connection string goes straight into the file, never into chat.

## File Structure

| Path | Responsibility | Task |
| --- | --- | --- |
| `package.json`, `.gitignore`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` | Scaffold from `create-next-app`; ESLint gains the database boundary rule in Task 2 | 1, 2 |
| `.prettierrc.json`, `.prettierignore`, `knip.json`, `.jscpd.json`, `vitest.config.ts` | Formatting, dead-code check, copy-paste check, unit test config | 1 |
| `src/app/layout.tsx`, `src/app/page.tsx` | Root layout and landing page | 1, 6 |
| `src/lib/domain/roles.ts` | Roles, statuses, signup roles, initial status, dashboard paths | 2, 6 |
| `src/server/env.ts` | Validated server environment variables | 2 |
| `src/server/db/client.ts` | The one `MongoClient` and `Db` | 2 |
| `src/server/db/schema.ts`, `src/server/db/setup.ts` | Collection validators and indexes, and the idempotent function that applies them | 2 |
| `scripts/db-setup.mts` | `npm run db:setup` | 2 |
| `vitest.integration.config.ts`, `tests/support/*` | Integration harness: in-memory MongoDB, env, auth helpers | 2, 3 |
| `.env.example` | Every variable, with instructions | 2 |
| `src/server/auth/create-auth.ts` | Better Auth factory with the account rules | 3 |
| `src/server/auth/index.ts`, `src/app/api/auth/[...all]/route.ts` | The app's auth instance and its route | 3 |
| `src/server/auth/viewer-type.ts` | `Viewer` schema parsed from a session | 4 |
| `src/server/policies/accounts.ts` | Pure account policies | 4 |
| `src/server/errors.ts` | `ForbiddenError`, `NotFoundError` | 4 |
| `src/server/db/collections.ts` | Typed accessors for Better Auth's collections | 4 |
| `src/server/data/users.ts` | Admin user list and status changes | 4 |
| `src/server/db/seed.ts`, `scripts/seed-users.mts` | Demo accounts | 4 |
| `tests/support/viewers.ts` | `buildViewer()` for unit and integration tests | 4 |
| `src/server/auth/route-decision.ts`, `src/proxy.ts` | Redirect rules and the proxy | 5 |
| `src/lib/validation/auth.ts` | Login and signup schemas, shared by forms and actions | 6 |
| `src/lib/forms/form-state.ts` | `FormState`, `parseForm()`, `fieldErrorsOf()`: every form action's parsing | 6 |
| `src/hooks/use-validated-form.ts` | `useValidatedForm()`: every form's action wiring and browser-side validation | 6 |
| `src/components/form/field.tsx`, `src/components/form/form-alert.tsx` | Form building blocks for every form in the app | 6 |
| `src/server/auth/viewer.ts` | `getViewer()`, `requireViewer()` | 6, 7 |
| `src/server/auth/actions.ts` | `signUp`, `signIn`, `signOut` Server Actions | 6 |
| `src/app/(auth)/…` | Auth layout, `AuthCard`, login, signup and pending pages | 6 |
| `src/components/ui/…` | shadcn components | 6, 7 |
| `src/components/page-header.tsx` | `PageHeader` for every signed-in page | 7 |
| `src/lib/format.ts` | `formatDate()` in UAE time | 7 |
| `src/app/(app)/…` | App shell, role dashboards, admin users page | 7 |
| `scripts/e2e-server.mts`, `playwright.config.ts`, `tests/e2e/…` | End-to-end and accessibility tests on a throwaway database | 8 |
| `.github/workflows/ci.yml`, `vercel.json`, `README.md` | CI, function region, setup guide | 9 |

---

### Task 1: Scaffold the app and the check pipeline

**Files:**

- Create: everything from `create-next-app`, plus `.prettierrc.json`, `.prettierignore`, `knip.json`, `.jscpd.json`, `vitest.config.ts`
- Modify: `package.json` (name, scripts), `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

**Interfaces:**

- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `test`, `lint:md`, `knip`, `dup`, `check`.

- [ ] **Step 1: Scaffold into a temporary folder and copy it in**

`create-next-app` refuses to write into a folder that already has files (`docs/`, `.vscode/`), so scaffold beside them and copy. Our `README.md` is kept. `--react-compiler` turns on automatic memoization; `--yes` alone leaves it off.

```bash
npx --yes create-next-app@16.3.6 scaffold-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --react-compiler --use-npm --skip-install --disable-git --yes
rsync -a --exclude README.md scaffold-tmp/ ./
rm -rf scaffold-tmp
npm pkg set name=uae-venture-guide
rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

Expected: `package.json`, `src/app/`, `AGENTS.md`, `CLAUDE.md` and `eslint.config.mjs` exist at the repo root, and `README.md` still starts with `# UAE Venture Guide`. `next.config.ts` contains `reactCompiler: true`, and `package.json` lists `babel-plugin-react-compiler` under `devDependencies`.

- [ ] **Step 2: Let `.env.example` into git**

The scaffold's `.gitignore` ignores `.env*`. Append:

```gitignore

# The template is committed; real values never are.
!.env.example

# Playwright artefacts.
/test-results/
/playwright-report/
```

- [ ] **Step 3: Install dependencies and the tooling**

The scaffold pins `@types/node` to `^20`, but Vitest 5 needs 22 or later and refuses to install next to it (npm `ERESOLVE`). The project runs on Node 24, so the types move to 24 in the same command:

```bash
npm install
npm install -D @types/node@24 prettier vitest knip markdownlint-cli2 jscpd
```

Expected: both finish without `ERR!`.

- [ ] **Step 4: Add the formatter, knip, copy-paste and Vitest config**

Create `.prettierrc.json`. It also stops Prettier from picking up the workspace-root config, which uses different settings:

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```gitignore
# npm owns the lockfile's shape.
package-lock.json

# `next dev` writes and rewrites these, so formatting them causes churn.
AGENTS.md
CLAUDE.md
```

Create `knip.json`. The project pattern includes `.css` so knip follows the stylesheet imports; without it, knip reports `tailwindcss` as unused and the check fails. Checked with knip 6.39 on this scaffold:

```json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "entry": [
    "src/proxy.ts",
    "scripts/*.mts",
    "tests/**/*.{test,spec}.ts",
    "tests/support/*.ts",
    "vitest.integration.config.ts"
  ],
  "project": [
    "src/**/*.{ts,tsx,css}",
    "scripts/**/*.mts",
    "tests/**/*.ts"
  ],
  "ignore": ["src/components/ui/**"],
  "ignoreExportsUsedInFile": true
}
```

Create `.jscpd.json`. This is the reuse rule's enforcement (A10): any block of 50+ tokens that appears twice fails `npm run check`. It scans all TypeScript and JavaScript, including `.mts` scripts, except the shadcn vendor folder. Checked with jscpd 5.3:

```json
{
  "threshold": 0,
  "minTokens": 50,
  "minLines": 5,
  "format": ["typescript", "tsx", "javascript"],
  "formatsExts": { "typescript": ["ts", "mts", "cts"] },
  "path": ["."],
  "ignore": [
    "**/node_modules/**",
    "**/.next/**",
    "**/src/components/ui/**",
    "**/docs/**"
  ],
  "reporters": ["console"],
  "gitignore": true
}
```

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests that need a database run under vitest.integration.config.ts instead.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
```

- [ ] **Step 5: Add the scripts**

`next typegen` generates the global `LayoutProps` and `PageProps` types that the scaffold's layout uses; without it `tsc` fails on a clean checkout.

```bash
npm pkg set scripts.typecheck="next typegen && tsc --noEmit"
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."
npm pkg set scripts.test="vitest run"
npm pkg set scripts.lint:md="markdownlint-cli2 \"**/*.md\" \"#node_modules\" \"#.next\" \"#AGENTS.md\" \"#CLAUDE.md\" \"#test-results\" \"#playwright-report\""
npm pkg set scripts.knip="knip"
npm pkg set scripts.dup="jscpd"
npm pkg set scripts.check="npm run format:check && npm run lint && npm run typecheck && npm run lint:md && npm run knip && npm run dup && npm run test"
```

Run `npm pkg get scripts`. Expected: twelve scripts.

- [ ] **Step 6: Replace the scaffold page and metadata**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        UAE Venture Guide
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-300">
        Turn a business idea into a startup plan for the UAE: the steps, the
        costs, the documents and the risks, grounded in official sources.
      </p>
    </main>
  );
}
```

In `src/app/layout.tsx`, replace the `metadata` export with:

```tsx
export const metadata: Metadata = {
  title: {
    default: "UAE Venture Guide",
    template: "%s · UAE Venture Guide",
  },
  description:
    "Turn a business idea into a startup plan for the UAE, grounded in official sources.",
};
```

- [ ] **Step 7: Format, then run every check**

```bash
npm run format
npm run check
```

Expected: every step passes; jscpd reports `Found 0 clones`, and Vitest prints `No test files found, exiting with code 0`. If knip reports `tailwindcss` as unused (it is referenced only from `globals.css`), add `"ignoreDependencies": ["tailwindcss"]` to `knip.json` and run the check again.

- [ ] **Step 8: Build and look at it**

```bash
npm run build
npm run dev
```

Expected: the build succeeds, and <http://localhost:3000> shows the heading and the pitch. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with check pipeline"
```

---

### Task 2: Shared roles, the database client, collection setup and the test harness

**Files:**

- Create: `src/lib/domain/roles.ts`, `src/lib/domain/roles.test.ts`, `src/server/env.ts`, `src/server/db/client.ts`, `src/server/db/schema.ts`, `src/server/db/setup.ts`, `scripts/db-setup.mts`, `vitest.integration.config.ts`, `tests/support/empty-module.ts`, `tests/support/mongo-global-setup.ts`, `tests/support/mongo-env.ts`, `tests/integration/db-setup.test.ts`, `.env.example`
- Modify: `eslint.config.mjs`, `package.json`

**Interfaces:**

- Produces (`roles.ts`): `ROLES`, `type UserRole`, `ACCOUNT_STATUSES`, `type AccountStatus`, `SIGNUP_ROLES`, `initialStatusFor(role: string): AccountStatus`, `dashboardPathFor(role: UserRole): string`.
- Produces (`env.ts`): `serverEnv: { MONGODB_URI; MONGODB_DB; BETTER_AUTH_SECRET; BETTER_AUTH_URL }`.
- Produces (`client.ts`): `mongoClient: MongoClient`, `db: Db`.
- Produces (`setup.ts`): `setupDatabase(db: Db): Promise<string[]>`.
- Produces (tests): the integration config, which starts an in-memory replica set, sets `MONGODB_URI`, applies `setupDatabase` before each file and empties every collection before each test.
- Produces (scripts): `db:setup`, `test:integration`.

- [ ] **Step 1: Install the driver, Zod and the tooling**

```bash
npm install mongodb zod server-only @vercel/functions
npm install -D tsx mongodb-memory-server
```

- [ ] **Step 2: Write the failing roles test**

Create `src/lib/domain/roles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { dashboardPathFor, initialStatusFor, SIGNUP_ROLES } from "./roles";

describe("dashboardPathFor", () => {
  it.each([
    ["entrepreneur", "/dashboard/entrepreneur"],
    ["mentor", "/dashboard/mentor"],
    ["funder", "/dashboard/funder"],
    ["admin", "/admin"],
  ] as const)("sends %s to %s", (role, path) => {
    expect(dashboardPathFor(role)).toBe(path);
  });
});

describe("SIGNUP_ROLES", () => {
  it("offers the three public roles and never admin", () => {
    expect([...SIGNUP_ROLES]).toEqual(["entrepreneur", "mentor", "funder"]);
  });
});

describe("initialStatusFor", () => {
  it.each([
    ["entrepreneur", "active"],
    ["mentor", "pending"],
    ["funder", "pending"],
    ["admin", "pending"],
    ["anything-else", "pending"],
  ])("starts a %s account as %s", (role, status) => {
    expect(initialStatusFor(role)).toBe(status);
  });
});
```

Run `npm test`. Expected: FAIL with `Failed to load url ./roles`.

- [ ] **Step 3: Write `roles.ts` and watch the test pass**

Create `src/lib/domain/roles.ts`:

```ts
/** Every role an account can have, admin included. */
export const ROLES = ["entrepreneur", "mentor", "funder", "admin"] as const;
export type UserRole = (typeof ROLES)[number];

/** Pending accounts wait for an admin; suspended ones cannot sign in. */
export const ACCOUNT_STATUSES = ["active", "pending", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/** Roles a visitor may pick at signup. Admins are only made by other admins or the seed script. */
export const SIGNUP_ROLES = [
  "entrepreneur",
  "mentor",
  "funder",
] as const satisfies readonly UserRole[];

/** Entrepreneurs start at once; mentors and funders wait for an admin. */
export function initialStatusFor(role: string): AccountStatus {
  return role === "entrepreneur" ? "active" : "pending";
}

const DASHBOARD_PATHS: Record<UserRole, string> = {
  entrepreneur: "/dashboard/entrepreneur",
  mentor: "/dashboard/mentor",
  funder: "/dashboard/funder",
  admin: "/admin",
};

/** Where an active user with this role is sent after signing in. */
export function dashboardPathFor(role: UserRole): string {
  return DASHBOARD_PATHS[role];
}
```

Run `npm test`. Expected: PASS.

- [ ] **Step 4: Write the environment and the database client**

Create `src/server/env.ts`:

```ts
import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z
    .string()
    .regex(
      /^mongodb(\+srv)?:\/\//,
      "must be a mongodb:// or mongodb+srv:// connection string",
    ),
  MONGODB_DB: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  BETTER_AUTH_URL: z.url(),
});

const parsed = serverEnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Missing or invalid environment variables. Copy .env.example to .env.local and fill it in.\n${z.prettifyError(parsed.error)}`,
  );
}

/** Server settings from process.env; the first import throws if one is missing or invalid. */
export const serverEnv = parsed.data;
```

Create `src/server/db/client.ts`:

```ts
import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { MongoClient, type Db } from "mongodb";
import { serverEnv } from "@/server/env";

const globalForMongo = globalThis as typeof globalThis & {
  __uvgMongoClient?: MongoClient;
};

function connect(): MongoClient {
  const client = new MongoClient(serverEnv.MONGODB_URI, {
    appName: "uae-venture-guide",
    // The free cluster allows 500 connections in total.
    maxPoolSize: 10,
    maxIdleTimeMS: 60_000,
  });
  // On Vercel, closes idle connections before a function instance is
  // suspended. Elsewhere it does nothing.
  attachDatabasePool(client);
  return client;
}

/** One client per server process, reused across hot reloads in development. */
export const mongoClient: MongoClient = (globalForMongo.__uvgMongoClient ??=
  connect());

/** The app's database. Within src/, only src/server may import it. */
export const db: Db = mongoClient.db(serverEnv.MONGODB_DB);
```

- [ ] **Step 5: Add the database boundary to ESLint and prove it works**

Replace `eslint.config.mjs` with:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Two rules from 06-conventions.md that eslint-config-next leaves off.
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    // Only src/server may import the driver or the database client. Everything
    // else calls functions from @/server/data.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "mongodb",
              message:
                "Only src/server may talk to MongoDB. Call a function from @/server/data instead.",
            },
          ],
          patterns: [
            {
              group: ["@/server/db", "@/server/db/*"],
              message:
                "Only src/server may use the database client. Call a function from @/server/data instead.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

Prove the rule fires, then remove the probe:

```bash
printf 'import { MongoClient } from "mongodb";\nexport const probe = MongoClient;\n' > src/app/boundary-probe.ts
npx eslint src/app/boundary-probe.ts; echo "exit $?"
rm src/app/boundary-probe.ts
```

Expected: `Only src/server may talk to MongoDB…` and `exit 1`.

- [ ] **Step 6: Write the integration harness and the failing setup test**

Create `tests/support/empty-module.ts`:

```ts
// Stands in for "server-only" in tests. The real package throws outside
// Next.js's server bundles, and tests are server code.
export {};
```

Create `tests/support/mongo-global-setup.ts`:

```ts
import { MongoMemoryReplSet } from "mongodb-memory-server";
import type { TestProject } from "vitest/node";

/**
 * One in-memory MongoDB replica set for the whole integration run, so
 * transactions work. The first run downloads the MongoDB binary (about
 * 100 MB) into ~/.cache/mongodb-binaries.
 */
export default async function setup(project: TestProject) {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  project.provide("mongoUri", replSet.getUri());
  return async () => {
    await replSet.stop();
  };
}

declare module "vitest" {
  /** Types the URI that mongo-env.ts reads with inject("mongoUri"). */
  export interface ProvidedContext {
    mongoUri: string;
  }
}
```

Create `tests/support/mongo-env.ts`:

```ts
import { afterAll, beforeAll, beforeEach, inject } from "vitest";

// src/server/env.ts reads this when it is first imported, so set it first.
process.env.MONGODB_URI = inject("mongoUri");
// Each test file gets its own client instead of one cached by an earlier file.
delete (globalThis as { __uvgMongoClient?: unknown }).__uvgMongoClient;

const { db, mongoClient } = await import("@/server/db/client");
const { setupDatabase } = await import("@/server/db/setup");

beforeAll(async () => {
  await setupDatabase(db);
});

// Every test starts from empty collections; validators and indexes stay.
beforeEach(async () => {
  const collections = await db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoClient.close();
});
```

Create `vitest.integration.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Integration tests run the data layer and Better Auth against an in-memory
// MongoDB. They never touch the Atlas cluster and need no Docker.
export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      "server-only": fromRoot("./tests/support/empty-module.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["tests/support/mongo-global-setup.ts"],
    setupFiles: ["tests/support/mongo-env.ts"],
    env: {
      MONGODB_DB: "uvg_integration",
      BETTER_AUTH_SECRET: "integration-tests-secret-of-32-plus-chars",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
    fileParallelism: false,
    hookTimeout: 180_000,
    testTimeout: 30_000,
  },
});
```

Create `tests/integration/db-setup.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { setupDatabase } from "@/server/db/setup";

describe("setupDatabase", () => {
  it("creates Better Auth's collections", async () => {
    const names = (
      await db.listCollections({}, { nameOnly: true }).toArray()
    ).map((collection) => collection.name);
    expect(names).toEqual(
      expect.arrayContaining(["user", "session", "account", "verification"]),
    );
  });

  it("is safe to run again", async () => {
    await expect(setupDatabase(db)).resolves.toBeInstanceOf(Array);
  });

  it("rejects a user with an unknown role", async () => {
    await expect(
      db.collection("user").insertOne({
        email: "x@example.com",
        name: "X",
        role: "superuser",
        status: "active",
      }),
    ).rejects.toThrow(/validation/i);
  });

  it("rejects a second user with the same email", async () => {
    const user = { name: "A", role: "entrepreneur", status: "active" };
    await db.collection("user").insertOne({ ...user, email: "same@example.com" });
    await expect(
      db.collection("user").insertOne({ ...user, email: "same@example.com" }),
    ).rejects.toThrow(/duplicate key/);
  });

  it("expires sessions through a TTL index", async () => {
    const indexes = await db.collection("session").indexes();
    expect(
      indexes.find((index) => index.name === "expiresAt_ttl")
        ?.expireAfterSeconds,
    ).toBe(0);
  });
});
```

Add the script and run it:

```bash
npm pkg set scripts.test:integration="vitest run --config vitest.integration.config.ts"
npm run test:integration
```

Expected: FAIL, because `tests/support/mongo-env.ts` cannot load `@/server/db/setup`.

- [ ] **Step 7: Write the collection specs and `setupDatabase`, and watch the tests pass**

Create `src/server/db/schema.ts`:

```ts
import type { Document, IndexDescription } from "mongodb";
import { ACCOUNT_STATUSES, ROLES } from "@/lib/domain/roles";

type CollectionSpec = {
  name: string;
  validator?: Document;
  indexes: IndexDescription[];
};

/**
 * Every collection the app relies on. `setupDatabase` applies these; change a
 * collection here, never by hand in Atlas. Better Auth owns user, session,
 * account and verification. It creates no indexes itself, so they are here,
 * with a validator on the user fields this app depends on.
 */
export const COLLECTIONS: CollectionSpec[] = [
  {
    name: "user",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "name", "role", "status"],
        properties: {
          email: { bsonType: "string" },
          name: { bsonType: "string" },
          role: { enum: [...ROLES] },
          status: { enum: [...ACCOUNT_STATUSES] },
        },
      },
    },
    indexes: [
      { key: { email: 1 }, name: "email_unique", unique: true },
      // The admin users list reads pending accounts first, newest first.
      { key: { status: 1, createdAt: -1 }, name: "status_createdAt" },
    ],
  },
  {
    name: "session",
    indexes: [
      { key: { token: 1 }, name: "token_unique", unique: true },
      { key: { userId: 1 }, name: "userId" },
      { key: { expiresAt: 1 }, name: "expiresAt_ttl", expireAfterSeconds: 0 },
    ],
  },
  {
    name: "account",
    indexes: [{ key: { userId: 1 }, name: "userId" }],
  },
  {
    name: "verification",
    indexes: [
      { key: { identifier: 1 }, name: "identifier" },
      { key: { expiresAt: 1 }, name: "expiresAt_ttl", expireAfterSeconds: 0 },
    ],
  },
];
```

Create `src/server/db/setup.ts`:

```ts
import type { Db } from "mongodb";
import { COLLECTIONS } from "./schema";

/**
 * Creates each collection with its validator, or updates the validator on an
 * existing one, then ensures every index. Safe to run again.
 */
export async function setupDatabase(db: Db): Promise<string[]> {
  const existing = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map(
      (collection) => collection.name,
    ),
  );
  const report: string[] = [];

  for (const spec of COLLECTIONS) {
    if (!existing.has(spec.name)) {
      await db.createCollection(
        spec.name,
        spec.validator ? { validator: spec.validator } : {},
      );
      report.push(`created ${spec.name}`);
    } else if (spec.validator) {
      await db.command({ collMod: spec.name, validator: spec.validator });
      report.push(`updated validator on ${spec.name}`);
    } else {
      report.push(`kept ${spec.name}`);
    }

    // createIndexes refuses an empty list.
    if (spec.indexes.length > 0) {
      await db.collection(spec.name).createIndexes(spec.indexes);
    }
  }
  return report;
}
```

Run `npm run test:integration`. Expected: all 5 tests PASS. The first run also downloads MongoDB.

- [ ] **Step 8: Add `db:setup` and the environment template, then set up the Atlas database**

Create `scripts/db-setup.mts`:

```ts
import { db, mongoClient } from "@/server/db/client";
import { setupDatabase } from "@/server/db/setup";

try {
  for (const line of await setupDatabase(db)) console.log(line);
  console.log(`Database "${db.databaseName}" is ready.`);
} finally {
  await mongoClient.close();
}
```

`--conditions=react-server` lets scripts import modules that start with `import "server-only"`:

```bash
npm pkg set scripts.db:setup="tsx --conditions=react-server --env-file=.env.local scripts/db-setup.mts"
```

Create `.env.example`:

```bash
# Copy to .env.local and fill in. Never commit .env.local, and never paste
# these values into chat.

# Atlas: Connect → Drivers. Development cluster, AWS Mumbai (ap-south-1).
MONGODB_URI=
MONGODB_DB=uae_venture_guide_dev

# A random string of 32+ characters, for example: openssl rand -base64 32
BETTER_AUTH_SECRET=
# Must match the URL you open in the browser exactly, or Better Auth rejects
# the request's origin. http://localhost:3000 and http://127.0.0.1:3000 differ.
BETTER_AUTH_URL=http://localhost:3000

# Password for the demo accounts that `npm run db:seed` creates. 12+
# characters: the demo accounts live in a cloud database.
SEED_PASSWORD=
```

With `.env.local` filled in (see Prerequisites):

```bash
npm run db:setup
```

Expected: `created user`, `created session`, `created account`, `created verification`, then `Database "uae_venture_guide_dev" is ready.` Running it again prints `updated validator on user` and `kept …` for the others.

- [ ] **Step 9: Check and commit**

```bash
npm run format
npm run check
npm run test:integration
git add -A
git commit -m "feat: MongoDB client, collection setup and integration harness"
```

---

### Task 3: Better Auth with the account rules

**Files:**

- Create: `src/server/auth/create-auth.ts`, `src/server/auth/index.ts`, `src/app/api/auth/[...all]/route.ts`, `tests/support/auth.ts`, `tests/integration/auth.test.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `SIGNUP_ROLES`, `initialStatusFor` (Task 2); `db`, `mongoClient`, `serverEnv` (Task 2).
- Produces: `createAuth(options: { db: Db; client: MongoClient; secret: string; baseURL: string; plugins?: BetterAuthPlugin[] })`, constants `ACCOUNT_SUSPENDED` and `ROLE_CHANGE_NOT_ALLOWED`, and the app instance `auth` from `@/server/auth`. Test helpers: `testAuth`, `signUp(role, name?) → Promise<TestAccount>`, `post(path, body, headers?) → Promise<Response>`, `sessionCookie(account) → Promise<string>`, `type TestAccount = { id: string; email: string; password: string }`.

- [ ] **Step 1: Install Better Auth**

```bash
npm install better-auth
```

- [ ] **Step 2: Write the test helpers and the failing account-rule tests**

Create `tests/support/auth.ts`:

```ts
import type { SIGNUP_ROLES } from "@/lib/domain/roles";
import { createAuth } from "@/server/auth/create-auth";
import { db, mongoClient } from "@/server/db/client";
import { serverEnv } from "@/server/env";

const baseURL = serverEnv.BETTER_AUTH_URL;

/** Better Auth on the in-memory test database, without the Next.js cookie plugin. */
export const testAuth = createAuth({
  db,
  client: mongoClient,
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL,
});

/** An account made by signUp, with the password needed to sign in as it. */
export type TestAccount = { id: string; email: string; password: string };

let created = 0;

/** Signs up through Better Auth's API, the same call the signup form makes. */
export async function signUp(
  role: (typeof SIGNUP_ROLES)[number],
  name = "Test User",
): Promise<TestAccount> {
  created += 1;
  const email = `user-${created}-${Date.now()}@example.com`;
  const password = "test-password-123";
  const { user } = await testAuth.api.signUpEmail({
    body: { name, email, password, role },
  });
  return { id: user.id, email, password };
}

/** A raw HTTP request to Better Auth, the way a browser or an attacker sends one. */
export function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  return testAuth.handler(
    new Request(`${baseURL}/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: baseURL, ...headers },
      body: JSON.stringify(body),
    }),
  );
}

/** Signs in over HTTP and returns a Cookie header for later requests. */
export async function sessionCookie(account: TestAccount): Promise<string> {
  const response = await post("/sign-in/email", {
    email: account.email,
    password: account.password,
  });
  if (!response.ok) throw new Error(`sign-in failed with ${response.status}`);
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}
```

Create `tests/integration/auth.test.ts`:

```ts
import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import {
  ACCOUNT_SUSPENDED,
  ROLE_CHANGE_NOT_ALLOWED,
} from "@/server/auth/create-auth";
import { db } from "@/server/db/client";
import { post, sessionCookie, signUp } from "../support/auth";

function storedUser(id: string) {
  return db.collection("user").findOne({ _id: new ObjectId(id) });
}

describe("signup", () => {
  it("makes an entrepreneur active", async () => {
    const account = await signUp("entrepreneur", "Aisha Khan");
    expect(await storedUser(account.id)).toMatchObject({
      name: "Aisha Khan",
      role: "entrepreneur",
      status: "active",
    });
  });

  it.each(["mentor", "funder"] as const)(
    "makes a %s pending",
    async (role) => {
      const account = await signUp(role);
      expect(await storedUser(account.id)).toMatchObject({
        role,
        status: "pending",
      });
    },
  );

  it("refuses the admin role", async () => {
    const response = await post("/sign-up/email", {
      name: "Sneaky",
      email: "sneaky@example.com",
      password: "test-password-123",
      role: "admin",
    });
    expect(response.status).toBe(400);
    expect(
      await db.collection("user").countDocuments({ email: "sneaky@example.com" }),
    ).toBe(0);
  });

  it("refuses a status chosen by the user", async () => {
    const response = await post("/sign-up/email", {
      name: "Forcer",
      email: "forcer@example.com",
      password: "test-password-123",
      role: "funder",
      status: "active",
    });
    expect(response.status).toBe(400);
  });
});

describe("profile updates through Better Auth", () => {
  it("lets a user change their own name", async () => {
    const account = await signUp("mentor");
    const cookie = await sessionCookie(account);
    const response = await post("/update-user", { name: "New Name" }, { cookie });
    expect(response.status).toBe(200);
    expect(await storedUser(account.id)).toMatchObject({
      name: "New Name",
      role: "mentor",
      status: "pending",
    });
  });

  it("refuses a role change, which would skip approval", async () => {
    const account = await signUp("entrepreneur");
    const cookie = await sessionCookie(account);
    const response = await post("/update-user", { role: "mentor" }, { cookie });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      message: ROLE_CHANGE_NOT_ALLOWED,
    });
    expect(await storedUser(account.id)).toMatchObject({ role: "entrepreneur" });
  });

  it("refuses a status change", async () => {
    const account = await signUp("mentor");
    const cookie = await sessionCookie(account);
    const response = await post("/update-user", { status: "active" }, { cookie });
    expect(response.status).toBe(400);
    expect(await storedUser(account.id)).toMatchObject({ status: "pending" });
  });
});

describe("sign-in", () => {
  it("lets a pending mentor in, so they can see the pending screen", async () => {
    const account = await signUp("mentor");
    const response = await post("/sign-in/email", {
      email: account.email,
      password: account.password,
    });
    expect(response.status).toBe(200);
  });

  it("refuses a suspended account even with the right password", async () => {
    const account = await signUp("entrepreneur");
    await db
      .collection("user")
      .updateOne(
        { _id: new ObjectId(account.id) },
        { $set: { status: "suspended" } },
      );
    const response = await post("/sign-in/email", {
      email: account.email,
      password: account.password,
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ message: ACCOUNT_SUSPENDED });
  });

  it("rejects a wrong password", async () => {
    const account = await signUp("entrepreneur");
    const response = await post("/sign-in/email", {
      email: account.email,
      password: "wrong-password",
    });
    expect(response.status).toBe(401);
  });
});
```

Run `npm run test:integration`. Expected: FAIL with `Failed to load url @/server/auth/create-auth`.

- [ ] **Step 3: Write the Better Auth factory and watch the tests pass**

Create `src/server/auth/create-auth.ts`. Every rule below was confirmed against Better Auth 1.7.5 on a real MongoDB: the `role` validator returns 400 for `admin`, `input: false` returns 400 for `status`, a throw from `session.create.before` reaches the caller as a 403, and the hook receives `userId` as a string while the `session` collection stores it as an `ObjectId`.

```ts
import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";
import { ObjectId, type Db, type MongoClient } from "mongodb";
import { z } from "zod";
import {
  initialStatusFor,
  SIGNUP_ROLES,
  type AccountStatus,
} from "@/lib/domain/roles";

/** Sign-in refusal for a suspended account. The sign-in action matches it. */
export const ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED";
/** Refusal when a user tries to change their own role or status. */
export const ROLE_CHANGE_NOT_ALLOWED = "ROLE_CHANGE_NOT_ALLOWED";

type CreateAuthOptions = {
  db: Db;
  /** Passing the client turns on transactions in Better Auth's adapter. */
  client: MongoClient;
  secret: string;
  baseURL: string;
  plugins?: BetterAuthPlugin[];
};

/**
 * Better Auth with this app's account rules. The app builds one instance in
 * src/server/auth/index.ts, with the Next.js cookie plugin; scripts and tests
 * build their own against whichever database they use.
 */
export function createAuth({
  db,
  client,
  secret,
  baseURL,
  plugins = [],
}: CreateAuthOptions) {
  return betterAuth({
    secret,
    baseURL,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        // Accepted at signup, but only the three public roles.
        role: {
          type: "string",
          required: true,
          input: true,
          validator: { input: z.enum(SIGNUP_ROLES) },
        },
        // Never accepted from a request; the create hook sets it.
        status: { type: "string", required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: { ...user, status: initialStatusFor(String(user.role)) },
          }),
        },
        update: {
          // Without this, /api/auth/update-user would let a user switch roles
          // and skip approval. Admin changes go through src/server/data, which
          // writes to the collection directly and never reaches this hook.
          before: async (data, context) => {
            if (context && ("role" in data || "status" in data)) {
              throw new APIError("FORBIDDEN", {
                message: ROLE_CHANGE_NOT_ALLOWED,
              });
            }
          },
        },
      },
      session: {
        create: {
          // Suspended users cannot sign in, even with the right password.
          before: async (session) => {
            const user = await db
              .collection("user")
              .findOne<{ status: AccountStatus }>(
                { _id: new ObjectId(session.userId) },
                { projection: { status: 1 } },
              );
            if (user?.status === "suspended") {
              throw new APIError("FORBIDDEN", { message: ACCOUNT_SUSPENDED });
            }
          },
        },
      },
    },
    plugins,
  });
}
```

Run `npm run test:integration`. Expected: all tests in `db-setup.test.ts` and `auth.test.ts` PASS.

- [ ] **Step 4: Wire the app's instance and route**

Create `src/server/auth/index.ts`:

```ts
import "server-only";
import { nextCookies } from "better-auth/next-js";
import { db, mongoClient } from "@/server/db/client";
import { serverEnv } from "@/server/env";
import { createAuth } from "./create-auth";

/** The app's Better Auth instance. nextCookies() must stay the last plugin. */
export const auth = createAuth({
  db,
  client: mongoClient,
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  plugins: [nextCookies()],
});
```

Create `src/app/api/auth/[...all]/route.ts`:

```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

Check the route by hand:

```bash
npm run dev
```

In a second terminal: `curl -s http://localhost:3000/api/auth/ok`. Expected: `{"ok":true}`. Stop the dev server.

- [ ] **Step 5: Check and commit**

```bash
npm run format
npm run check
npm run test:integration
git add -A
git commit -m "feat: Better Auth on MongoDB with signup, role and suspension rules"
```

---

### Task 4: Account policies, the users data layer and demo accounts

**Files:**

- Create: `tests/support/viewers.ts`, `src/server/auth/viewer-type.ts`, `src/server/auth/viewer-type.test.ts`, `src/server/policies/accounts.ts`, `src/server/policies/accounts.test.ts`, `src/server/errors.ts`, `src/server/db/collections.ts`, `src/server/data/users.ts`, `tests/integration/users.test.ts`, `src/server/db/seed.ts`, `tests/integration/seed.test.ts`, `scripts/seed-users.mts`
- Modify: `tests/support/auth.ts` (add `makeAdmin`), `package.json`

**Interfaces:**

- Consumes: `ROLES`, `ACCOUNT_STATUSES`, `UserRole`, `AccountStatus` (Task 2); `db`, `mongoClient`, `serverEnv` (Task 2); `createAuth` (Task 3); test helpers (Task 3).
- Produces: `viewerSchema`, `type Viewer = { id: string; name: string; email: string; role: UserRole; status: AccountStatus }`; `canManageUsers(viewer: Viewer | null): boolean`; `canChangeStatusOf(viewer: Viewer | null, target: { role: UserRole }): boolean`; `ForbiddenError`, `NotFoundError`; `users()`, `sessions()`; `type AdminUserRow`; test helpers `buildViewer(role, status?, overrides?): Viewer`, `viewerOf(account, role, status?): Viewer` and `makeAdmin(): Promise<Viewer>`; `listUsersForAdmin(viewer: Viewer | null): Promise<AdminUserRow[]>`; `setUserStatus(viewer: Viewer | null, userId: string, status: Exclude<AccountStatus, "pending">): Promise<void>`; `DEMO_ACCOUNTS`, `seedDemoUsers(auth, db, password): Promise<string[]>`; script `db:seed`.

- [ ] **Step 1: Write the viewer builder, then the failing unit tests for the viewer schema and the policies**

Every access test in this phase and later ones needs a viewer, so the builder is shared from the start. Create `tests/support/viewers.ts`:

```ts
import type { AccountStatus, UserRole } from "@/lib/domain/roles";
import type { Viewer } from "@/server/auth/viewer-type";

/** A viewer for tests. Pass overrides to tie it to a real account. */
export function buildViewer(
  role: UserRole,
  status: AccountStatus = "active",
  overrides: Partial<Viewer> = {},
): Viewer {
  return {
    id: "000000000000000000000001",
    name: "Test",
    email: "test@example.com",
    role,
    status,
    ...overrides,
  };
}
```

Create `src/server/auth/viewer-type.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { viewerSchema } from "./viewer-type";

// Shaped like the user object Better Auth returns from getSession.
const sessionUser = {
  id: "6ab3c2ea32f24d92524bcf0d",
  name: "Layla",
  email: "layla@example.com",
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: "entrepreneur",
  status: "active",
};

describe("viewerSchema", () => {
  it("keeps the fields access checks need", () => {
    expect(viewerSchema.parse(sessionUser)).toEqual({
      id: "6ab3c2ea32f24d92524bcf0d",
      name: "Layla",
      email: "layla@example.com",
      role: "entrepreneur",
      status: "active",
    });
  });

  it("rejects a role that is not one of ours", () => {
    expect(
      viewerSchema.safeParse({ ...sessionUser, role: "superuser" }).success,
    ).toBe(false);
  });

  it("rejects a user with no status", () => {
    expect(
      viewerSchema.safeParse({ ...sessionUser, status: undefined }).success,
    ).toBe(false);
  });
});
```

Create `src/server/policies/accounts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildViewer } from "../../../tests/support/viewers";
import { canChangeStatusOf, canManageUsers } from "./accounts";

describe("canManageUsers", () => {
  it("allows an active admin", () => {
    expect(canManageUsers(buildViewer("admin"))).toBe(true);
  });

  it.each(["entrepreneur", "mentor", "funder"] as const)(
    "refuses an active %s",
    (role) => {
      expect(canManageUsers(buildViewer(role))).toBe(false);
    },
  );

  it.each(["pending", "suspended"] as const)(
    "refuses a %s admin",
    (status) => {
      expect(canManageUsers(buildViewer("admin", status))).toBe(false);
    },
  );

  it("refuses a signed-out visitor", () => {
    expect(canManageUsers(null)).toBe(false);
  });
});

describe("canChangeStatusOf", () => {
  it.each(["entrepreneur", "mentor", "funder"] as const)(
    "lets an admin change a %s",
    (role) => {
      expect(canChangeStatusOf(buildViewer("admin"), { role })).toBe(true);
    },
  );

  it("never lets an admin change another admin", () => {
    expect(canChangeStatusOf(buildViewer("admin"), { role: "admin" })).toBe(
      false,
    );
  });

  it("refuses everyone else", () => {
    expect(canChangeStatusOf(buildViewer("mentor"), { role: "mentor" })).toBe(
      false,
    );
    expect(canChangeStatusOf(null, { role: "mentor" })).toBe(false);
  });
});
```

Run `npm test`. Expected: FAIL with `Failed to load url ./viewer-type` and `./accounts`.

- [ ] **Step 2: Write the viewer schema and the policies, and watch them pass**

Create `src/server/auth/viewer-type.ts`:

```ts
import { z } from "zod";
import { ACCOUNT_STATUSES, ROLES } from "@/lib/domain/roles";

/**
 * The signed-in user as every access check sees them, parsed from a Better
 * Auth session. A session whose user fails this parse is treated as no user.
 */
export const viewerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  status: z.enum(ACCOUNT_STATUSES),
});

export type Viewer = z.infer<typeof viewerSchema>;
```

Create `src/server/policies/accounts.ts`:

```ts
import type { UserRole } from "@/lib/domain/roles";
import type { Viewer } from "@/server/auth/viewer-type";

/** Active admins manage accounts: list them, approve, suspend, reactivate. */
export function canManageUsers(viewer: Viewer | null): boolean {
  return viewer !== null && viewer.role === "admin" && viewer.status === "active";
}

/** Admins may change anyone's status except another admin's. */
export function canChangeStatusOf(
  viewer: Viewer | null,
  target: { role: UserRole },
): boolean {
  return canManageUsers(viewer) && target.role !== "admin";
}
```

Run `npm test`. Expected: PASS.

- [ ] **Step 3: Add the shared admin helpers, then write the failing data-layer tests**

Admin screens in later phases need the same test admin, so it goes in the shared helpers. In `tests/support/auth.ts`, add these imports at the top:

```ts
import { ObjectId } from "mongodb";
import type { AccountStatus, UserRole } from "@/lib/domain/roles";
import type { Viewer } from "@/server/auth/viewer-type";
import { buildViewer } from "./viewers";
```

Append:

```ts
/** A viewer tied to a real test account, for calling data functions as that user. */
export function viewerOf(
  account: TestAccount,
  role: UserRole,
  status: AccountStatus = "active",
): Viewer {
  return buildViewer(role, status, { id: account.id, email: account.email });
}

/** An active admin: signs up, then promotes the account as the seed script does. */
export async function makeAdmin(): Promise<Viewer> {
  const account = await signUp("entrepreneur", "Admin");
  await db
    .collection("user")
    .updateOne({ _id: new ObjectId(account.id) }, { $set: { role: "admin" } });
  return viewerOf(account, "admin");
}
```

Create `tests/integration/users.test.ts`:

```ts
import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { listUsersForAdmin, setUserStatus } from "@/server/data/users";
import { db } from "@/server/db/client";
import { ForbiddenError, NotFoundError } from "@/server/errors";
import {
  makeAdmin,
  post,
  sessionCookie,
  signUp,
  viewerOf,
} from "../support/auth";

async function statusOf(id: string) {
  return (await db.collection("user").findOne({ _id: new ObjectId(id) }))
    ?.status;
}

describe("listUsersForAdmin", () => {
  it("lists pending accounts first, with their emails", async () => {
    const admin = await makeAdmin();
    await signUp("entrepreneur", "Early Bird");
    await signUp("mentor", "Waiting Mentor");

    const rows = await listUsersForAdmin(admin);

    expect(rows[0]).toMatchObject({ name: "Waiting Mentor", status: "pending" });
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.email.endsWith("@example.com"))).toBe(true);
  });

  it("refuses anyone who is not an active admin", async () => {
    const account = await signUp("entrepreneur");
    await expect(
      listUsersForAdmin(viewerOf(account, "entrepreneur")),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(listUsersForAdmin(null)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

describe("setUserStatus", () => {
  it("approves a pending mentor", async () => {
    const admin = await makeAdmin();
    const mentor = await signUp("mentor");
    await setUserStatus(admin, mentor.id, "active");
    expect(await statusOf(mentor.id)).toBe("active");
  });

  it("suspends a user, ends their sessions and blocks their next sign-in", async () => {
    const admin = await makeAdmin();
    const account = await signUp("entrepreneur");
    await sessionCookie(account);

    await setUserStatus(admin, account.id, "suspended");

    expect(await statusOf(account.id)).toBe("suspended");
    expect(
      await db
        .collection("session")
        .countDocuments({ userId: new ObjectId(account.id) }),
    ).toBe(0);
    const response = await post("/sign-in/email", {
      email: account.email,
      password: account.password,
    });
    expect(response.status).toBe(403);
  });

  it("never touches another admin", async () => {
    const first = await makeAdmin();
    const second = await makeAdmin();
    await expect(
      setUserStatus(first, second.id, "suspended"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("refuses a mentor trying to approve themselves", async () => {
    const mentor = await signUp("mentor");
    await expect(
      setUserStatus(viewerOf(mentor, "mentor", "pending"), mentor.id, "active"),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(await statusOf(mentor.id)).toBe("pending");
  });

  it("reports an unknown user as not found", async () => {
    const admin = await makeAdmin();
    await expect(
      setUserStatus(admin, new ObjectId().toHexString(), "active"),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      setUserStatus(admin, "not-an-id", "active"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
```

Run `npm run test:integration`. Expected: FAIL with `Failed to load url @/server/data/users`.

- [ ] **Step 4: Write the errors, typed collections and the users data layer, and watch the tests pass**

Create `src/server/errors.ts`:

```ts
/** The viewer may not do this. Thrown by data functions when a policy refuses. */
export class ForbiddenError extends Error {
  constructor(message = "Not allowed") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** The thing does not exist, or the viewer may not know that it does. */
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
```

Create `src/server/db/collections.ts`:

```ts
import "server-only";
import type { ObjectId } from "mongodb";
import type { AccountStatus, UserRole } from "@/lib/domain/roles";
import { db } from "./client";

/** Better Auth's user document, with the fields this app adds and relies on. */
export type UserDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
};

/** Better Auth's session document. It stores userId as an ObjectId. */
export type SessionDoc = {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
};

/** Better Auth's user collection, typed for the data layer. */
export const users = () => db.collection<UserDoc>("user");

/** Better Auth's session collection, typed for the data layer. */
export const sessions = () => db.collection<SessionDoc>("session");
```

Create `src/server/data/users.ts`:

```ts
import "server-only";
import { ObjectId } from "mongodb";
import { ACCOUNT_STATUSES, type AccountStatus } from "@/lib/domain/roles";
import type { Viewer } from "@/server/auth/viewer-type";
import { sessions, users, type UserDoc } from "@/server/db/collections";
import { ForbiddenError, NotFoundError } from "@/server/errors";
import { canChangeStatusOf, canManageUsers } from "@/server/policies/accounts";

type AdminUserDoc = Pick<
  UserDoc,
  "_id" | "name" | "email" | "role" | "status" | "createdAt"
>;

/** One account as the admin users table shows it. */
export type AdminUserRow = Omit<AdminUserDoc, "_id"> & { id: string };

/** Every account for the admin screen: pending first, then newest first. */
export async function listUsersForAdmin(
  viewer: Viewer | null,
): Promise<AdminUserRow[]> {
  if (!canManageUsers(viewer)) throw new ForbiddenError();

  const projection = { name: 1, email: 1, role: 1, status: 1, createdAt: 1 };
  const decided = ACCOUNT_STATUSES.filter((status) => status !== "pending");
  // Both reads walk the status_createdAt index in order. $in rather than $ne
  // lets MongoDB merge the decided statuses without sorting in memory.
  const [pending, others] = await Promise.all([
    users()
      .find<AdminUserDoc>({ status: "pending" }, { projection })
      .sort({ createdAt: -1 })
      .toArray(),
    users()
      .find<AdminUserDoc>({ status: { $in: decided } }, { projection })
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  return [...pending, ...others].map((doc) => ({
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
  }));
}

/**
 * Approve, suspend or reactivate one account. Suspending also ends the user's
 * sessions, and Better Auth refuses their next sign-in.
 */
export async function setUserStatus(
  viewer: Viewer | null,
  userId: string,
  status: Exclude<AccountStatus, "pending">,
): Promise<void> {
  if (!canManageUsers(viewer)) throw new ForbiddenError();
  if (!ObjectId.isValid(userId)) throw new NotFoundError();

  const _id = new ObjectId(userId);
  const target = await users().findOne<Pick<UserDoc, "role">>(
    { _id },
    { projection: { role: 1 } },
  );
  if (!target) throw new NotFoundError();
  if (!canChangeStatusOf(viewer, target)) throw new ForbiddenError();

  await users().updateOne({ _id }, { $set: { status, updatedAt: new Date() } });
  if (status === "suspended") await sessions().deleteMany({ userId: _id });
}
```

Run `npm run test:integration`. Expected: all tests PASS.

- [ ] **Step 5: Write the failing seed test, then the seed module**

Create `tests/integration/seed.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { DEMO_ACCOUNTS, seedDemoUsers } from "@/server/db/seed";
import { post, testAuth } from "../support/auth";

const password = "seed-password-123";

describe("seedDemoUsers", () => {
  it("creates one active account per role, including the admin", async () => {
    await seedDemoUsers(testAuth, db, password);
    const stored = await db.collection("user").find().toArray();
    expect(
      stored.map(({ email, role, status }) => ({ email, role, status })),
    ).toEqual(
      expect.arrayContaining(
        DEMO_ACCOUNTS.map(({ email, role }) => ({
          email,
          role,
          status: "active",
        })),
      ),
    );
  });

  it("is safe to run twice", async () => {
    await seedDemoUsers(testAuth, db, password);
    await seedDemoUsers(testAuth, db, password);
    expect(await db.collection("user").countDocuments()).toBe(
      DEMO_ACCOUNTS.length,
    );
  });

  it("leaves the demo admin able to sign in", async () => {
    await seedDemoUsers(testAuth, db, password);
    const response = await post("/sign-in/email", {
      email: "admin@example.com",
      password,
    });
    expect(response.status).toBe(200);
  });
});
```

Run `npm run test:integration`. Expected: FAIL with `Failed to load url @/server/db/seed`.

Create `src/server/db/seed.ts`:

```ts
import type { Db } from "mongodb";
import type { UserRole } from "@/lib/domain/roles";
import type { createAuth } from "@/server/auth/create-auth";

type Auth = ReturnType<typeof createAuth>;

export const DEMO_ACCOUNTS: { email: string; name: string; role: UserRole }[] = [
  { email: "admin@example.com", name: "Admin", role: "admin" },
  {
    email: "entrepreneur@example.com",
    name: "Layla Entrepreneur",
    role: "entrepreneur",
  },
  { email: "mentor@example.com", name: "Omar Mentor", role: "mentor" },
  { email: "funder@example.com", name: "Sara Funder", role: "funder" },
];

/**
 * Creates the demo accounts, all active, through Better Auth so passwords are
 * hashed the normal way. Safe to run again: existing accounts keep their
 * password and get their role and status reset.
 */
export async function seedDemoUsers(
  auth: Auth,
  db: Db,
  password: string,
): Promise<string[]> {
  const users = db.collection("user");
  const report: string[] = [];

  for (const account of DEMO_ACCOUNTS) {
    if (!(await users.findOne({ email: account.email }))) {
      await auth.api.signUpEmail({
        body: {
          name: account.name,
          email: account.email,
          password,
          // Signup never accepts admin; the update below promotes it.
          role: account.role === "admin" ? "entrepreneur" : account.role,
        },
      });
    }
    const doc = await users.findOne({ email: account.email });
    if (!doc) throw new Error(`Could not create ${account.email}`);

    await users.updateOne(
      { _id: doc._id },
      { $set: { role: account.role, status: "active", updatedAt: new Date() } },
    );
    // Signup signs the account in; seeding should not leave sessions behind.
    await db.collection("session").deleteMany({ userId: doc._id });
    report.push(`${account.role.padEnd(12)} ${account.email}`);
  }
  return report;
}
```

Run `npm run test:integration`. Expected: all tests PASS.

- [ ] **Step 6: Add the seed script and seed the Atlas database**

Create `scripts/seed-users.mts`:

```ts
import { createAuth } from "@/server/auth/create-auth";
import { db, mongoClient } from "@/server/db/client";
import { seedDemoUsers } from "@/server/db/seed";
import { serverEnv } from "@/server/env";

const password = process.env.SEED_PASSWORD ?? "";
if (password.length < 12) {
  throw new Error(
    "Set SEED_PASSWORD (12+ characters) in .env.local. The demo accounts live in a cloud database, so the password must not be guessable.",
  );
}
if (
  db.databaseName === "uae_venture_guide" &&
  process.env.SEED_ALLOW_PRODUCTION !== "1"
) {
  throw new Error("Refusing to seed the production database.");
}

// No Next.js cookie plugin here: this runs outside a request.
const auth = createAuth({
  db,
  client: mongoClient,
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
});

try {
  for (const line of await seedDemoUsers(auth, db, password)) console.log(line);
  console.log(`Demo accounts ready in "${db.databaseName}".`);
} finally {
  await mongoClient.close();
}
```

```bash
npm pkg set scripts.db:seed="tsx --conditions=react-server --env-file=.env.local scripts/seed-users.mts"
npm run db:seed
```

Expected: four lines (`admin`, `entrepreneur`, `mentor`, `funder` with their emails) and `Demo accounts ready in "uae_venture_guide_dev".`

- [ ] **Step 7: Check and commit**

```bash
npm run format
npm run check
npm run test:integration
git add -A
git commit -m "feat: account policies, users data layer and demo accounts"
```

---

### Task 5: Route rules and the proxy

**Files:**

- Create: `src/server/auth/route-decision.ts`, `src/server/auth/route-decision.test.ts`, `src/proxy.ts`

**Interfaces:**

- Consumes: `dashboardPathFor`, `UserRole`, `AccountStatus` (Task 2); `auth` (Task 3); `viewerSchema` (Task 4).
- Produces: `type RouteProfile = { role: UserRole; status: AccountStatus } | null`, `isGuarded(pathname: string): boolean`, `routeDecision(input: { pathname: string; signedIn: boolean; profile: RouteProfile }): string | null`.

- [ ] **Step 1: Write the failing tests**

Create `src/server/auth/route-decision.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isGuarded, routeDecision, type RouteProfile } from "./route-decision";

const entrepreneur: RouteProfile = { role: "entrepreneur", status: "active" };
const admin: RouteProfile = { role: "admin", status: "active" };
const pendingMentor: RouteProfile = { role: "mentor", status: "pending" };
const suspendedFunder: RouteProfile = { role: "funder", status: "suspended" };

describe("isGuarded", () => {
  it.each([
    ["/", false],
    ["/about", false],
    ["/login", true],
    ["/signup", true],
    ["/dashboard", true],
    ["/dashboard/mentor", true],
    ["/admin", true],
    ["/pending", true],
    ["/dashboardish", false],
  ])("%s → %s", (pathname, expected) => {
    expect(isGuarded(pathname)).toBe(expected);
  });
});

describe("routeDecision when signed out", () => {
  it.each([
    ["/", null],
    ["/login", null],
    ["/signup", null],
    ["/dashboard", "/login"],
    ["/dashboard/entrepreneur", "/login"],
    ["/admin", "/login"],
    ["/pending", "/login"],
    ["/dashboardish", null],
    ["/administrator", null],
  ])("%s → %s", (pathname, expected) => {
    expect(routeDecision({ pathname, signedIn: false, profile: null })).toBe(
      expected,
    );
  });
});

describe("routeDecision for an active entrepreneur", () => {
  it.each([
    ["/", null],
    ["/login", "/dashboard/entrepreneur"],
    ["/signup", "/dashboard/entrepreneur"],
    ["/pending", "/dashboard/entrepreneur"],
    ["/dashboard", "/dashboard/entrepreneur"],
    ["/dashboard/entrepreneur", null],
    ["/dashboard/mentor", "/dashboard/entrepreneur"],
    ["/admin", "/dashboard/entrepreneur"],
  ])("%s → %s", (pathname, expected) => {
    expect(
      routeDecision({ pathname, signedIn: true, profile: entrepreneur }),
    ).toBe(expected);
  });
});

describe("routeDecision for an active admin", () => {
  it.each([
    ["/admin", null],
    ["/admin/users", null],
    ["/dashboard", "/admin"],
    ["/dashboard/funder", "/admin"],
    ["/login", "/admin"],
  ])("%s → %s", (pathname, expected) => {
    expect(routeDecision({ pathname, signedIn: true, profile: admin })).toBe(
      expected,
    );
  });
});

describe("routeDecision for accounts that are not active", () => {
  it.each([
    [pendingMentor, "/dashboard/mentor", "/pending"],
    [pendingMentor, "/pending", null],
    [pendingMentor, "/login", "/pending"],
    [pendingMentor, "/", null],
    [suspendedFunder, "/dashboard/funder", "/pending"],
    [null, "/dashboard", "/pending"],
  ] as const)("%o at %s → %s", (profile, pathname, expected) => {
    expect(routeDecision({ pathname, signedIn: true, profile })).toBe(
      expected,
    );
  });
});
```

Run `npm test`. Expected: FAIL with `Failed to load url ./route-decision`.

- [ ] **Step 2: Write the rules and watch the tests pass**

Create `src/server/auth/route-decision.ts`:

```ts
import {
  dashboardPathFor,
  type AccountStatus,
  type UserRole,
} from "@/lib/domain/roles";

/** The signed-in user's role and status; null when there is no valid user. */
export type RouteProfile = { role: UserRole; status: AccountStatus } | null;

const AUTH_PAGES = ["/login", "/signup"];
const PROTECTED = ["/dashboard", "/admin", "/pending"];

function isIn(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Paths the proxy has to look at. Everything else skips the session lookup. */
export function isGuarded(pathname: string): boolean {
  return [...AUTH_PAGES, ...PROTECTED].some((prefix) => isIn(pathname, prefix));
}

/**
 * Where the proxy should send this request, or null to let it through.
 * UX only: pages and the data layer check access again.
 */
export function routeDecision({
  pathname,
  signedIn,
  profile,
}: {
  pathname: string;
  signedIn: boolean;
  profile: RouteProfile;
}): string | null {
  const target = decide(pathname, signedIn, profile);
  return target === pathname ? null : target;
}

function decide(
  pathname: string,
  signedIn: boolean,
  profile: RouteProfile,
): string | null {
  const isAuthPage = AUTH_PAGES.some((page) => isIn(pathname, page));
  const isProtected = PROTECTED.some((prefix) => isIn(pathname, prefix));

  if (!signedIn) return isProtected ? "/login" : null;

  // Signed in but pending, suspended, or unreadable: only /pending.
  if (!profile || profile.status !== "active") {
    return isAuthPage || isProtected ? "/pending" : null;
  }

  const home = dashboardPathFor(profile.role);
  if (isAuthPage || isIn(pathname, "/pending") || pathname === "/dashboard") {
    return home;
  }
  if (isIn(pathname, "/admin")) return profile.role === "admin" ? null : home;
  if (isIn(pathname, "/dashboard")) return isIn(pathname, home) ? null : home;
  return null;
}
```

Run `npm test`. Expected: PASS.

- [ ] **Step 3: Write the proxy**

Create `src/proxy.ts`. It runs on Node.js (the Next 16 default), so it can read the session from MongoDB. Importing a `server-only` module here was checked against a Next 16.3.6 build.

```ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import {
  isGuarded,
  routeDecision,
  type RouteProfile,
} from "@/server/auth/route-decision";
import { viewerSchema } from "@/server/auth/viewer-type";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Public pages skip the session lookup; the free cluster counts every query.
  if (!isGuarded(pathname)) return NextResponse.next();

  // Better Auth may refresh the session, in which case it returns Set-Cookie
  // headers that have to reach the browser.
  const { headers: authHeaders, response: session } =
    await auth.api.getSession({ headers: request.headers, returnHeaders: true });

  const parsed = viewerSchema.safeParse(session?.user);
  const profile: RouteProfile = parsed.success ? parsed.data : null;

  const target = routeDecision({
    pathname,
    signedIn: session !== null,
    profile,
  });
  const response = target
    ? NextResponse.redirect(new URL(target, request.url))
    : NextResponse.next();
  for (const cookie of authHeaders.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

// Better Auth's own routes and static files never need a redirect.
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
```

- [ ] **Step 4: Check the redirect by hand**

```bash
npm run dev
```

In a second terminal:

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/dashboard
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Expected: `307 http://localhost:3000/login`, then `200`. Stop the dev server.

- [ ] **Step 5: Check and commit**

```bash
npm run format
npm run check
git add -A
git commit -m "feat: role routing rules and session-aware proxy"
```

---

### Task 6: Signup, login and the pending screen

**Files:**

- Create: `components.json`, `src/lib/utils.ts` and `src/components/ui/{button,input,label,card}.tsx` (all from shadcn), `src/lib/validation/auth.ts`, `src/lib/validation/auth.test.ts`, `src/lib/forms/form-state.ts`, `src/lib/forms/form-state.test.ts`, `src/hooks/use-validated-form.ts`, `src/components/form/field.tsx`, `src/components/form/form-alert.tsx`, `src/components/form/form-shell.tsx`, `src/components/form/submit-button.tsx`, `src/server/auth/viewer.ts`, `src/server/auth/actions.ts`, `src/app/(auth)/layout.tsx`, `src/app/(auth)/auth-card.tsx`, `src/app/(auth)/credentials-fields.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/login/login-form.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/signup/signup-form.tsx`, `src/app/(auth)/pending/page.tsx`
- Modify: `src/app/globals.css` (shadcn theme), `src/app/page.tsx`, `src/lib/domain/roles.ts` (add `SignupRole`), `knip.json` if needed

**Interfaces:**

- Consumes: `SIGNUP_ROLES`, `dashboardPathFor` (Task 2); `auth`, `ACCOUNT_SUSPENDED` (Task 3); `viewerSchema`, `Viewer` (Task 4).
- Produces: `type SignupRole`; `loginSchema`, `signupSchema`; `type FieldErrors`, `type FormState`, `fieldErrorsOf(error: z.ZodError): FieldErrors`, `parseForm<T>(schema: z.ZodType<T>, formData: FormData, keep: readonly string[])` returning `{ ok: true; data: T; values: Record<string, string> } | { ok: false; state: FormState }`; `useValidatedForm(action, schema)` returning `{ state, formAction, pending, onSubmit, fieldErrors }` and its type `ValidatedForm`; components `Field`, `FormAlert`, `FormShell`, `SubmitButton`, `AuthCard`, `CredentialsFields`; `getViewer(): Promise<Viewer | null>`; Server Actions `signUp`, `signIn`, `signOut`.

Every form in later phases uses `parseForm` in its action and `useValidatedForm`, `FormShell`, `Field` and `SubmitButton` in the browser. That is why they are built here, with the first two forms, rather than extracted later (A10).

- [ ] **Step 1: Add shadcn with the Radix base**

`--rtl` makes shadcn write logical utilities (`ms-*`, `start-*`) into its components, as A2 asks. `-b radix -p nova` picks the Radix base and the Nova preset without prompting.

```bash
npx --yes shadcn@4.21.0 init -b radix -p nova --yes --no-monorepo --rtl
npx --yes shadcn@4.21.0 add button input label card
```

Expected: `components.json` contains `"style": "radix-nova"` and `"rtl": true`; `src/lib/utils.ts` and the four components exist; `src/app/globals.css` defines the shadcn theme variables.

- [ ] **Step 2: Write the failing tests for the schemas and the form helpers**

Create `src/lib/validation/auth.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./auth";

const validSignup = {
  name: "Aisha Khan",
  email: "aisha@example.com",
  password: "long-enough",
  role: "mentor",
};

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it("trims the name", () => {
    expect(
      signupSchema.parse({ ...validSignup, name: "  Aisha Khan  " }).name,
    ).toBe("Aisha Khan");
  });

  it("rejects the admin role", () => {
    expect(
      signupSchema.safeParse({ ...validSignup, role: "admin" }).success,
    ).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      signupSchema.safeParse({ ...validSignup, password: "short" }).success,
    ).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(
      signupSchema.safeParse({ ...validSignup, email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects a one-letter name", () => {
    expect(signupSchema.safeParse({ ...validSignup, name: "A" }).success).toBe(
      false,
    );
  });
});

describe("loginSchema", () => {
  it("accepts an email and a password", () => {
    expect(
      loginSchema.safeParse({ email: "a@example.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@example.com", password: "" }).success,
    ).toBe(false);
  });
});
```

Create `src/lib/forms/form-state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fieldErrorsOf, parseForm } from "./form-state";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

describe("parseForm", () => {
  it("returns typed data and the kept values when the form is valid", () => {
    const result = parseForm(
      schema,
      formData({ email: "a@example.com", password: "secret" }),
      ["email"],
    );
    expect(result).toEqual({
      ok: true,
      data: { email: "a@example.com", password: "secret" },
      values: { email: "a@example.com" },
    });
  });

  it("returns field errors and puts back only the kept values", () => {
    const result = parseForm(
      schema,
      formData({ email: "nope", password: "" }),
      ["email"],
    );
    expect(result).toEqual({
      ok: false,
      state: {
        values: { email: "nope" },
        fieldErrors: {
          email: ["Enter a valid email address."],
          password: ["Enter your password."],
        },
      },
    });
  });

  it("drops fields the schema does not know", () => {
    const result = parseForm(
      schema,
      formData({ email: "a@example.com", password: "x", extra: "1" }),
      [],
    );
    expect(result.ok && result.data).toEqual({
      email: "a@example.com",
      password: "x",
    });
  });
});

describe("fieldErrorsOf", () => {
  it("groups Zod's messages by field", () => {
    const result = schema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrorsOf(result.error)).toEqual({
        email: ["Enter a valid email address."],
        password: ["Enter your password."],
      });
    }
  });
});
```

Run `npm test`. Expected: FAIL with `Failed to load url ./auth` and `./form-state`.

- [ ] **Step 3: Write the schemas and the form helpers, and watch the tests pass**

Create `src/lib/validation/auth.ts`. The field names match Better Auth's request body, so the parsed data goes straight to it:

```ts
import { z } from "zod";
import { SIGNUP_ROLES } from "@/lib/domain/roles";

/** The login form's fields, checked in the browser and again in `signIn` (A9). */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

/** The signup form's fields, checked in the browser and again in `signUp` (A9). */
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Keep your name under 100 characters."),
  email: z.email("Enter a valid email address."),
  // Better Auth's defaults: 8 to 128 characters.
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Use at most 128 characters."),
  role: z.enum(SIGNUP_ROLES, "Choose how you will use the site."),
});
```

Create `src/lib/forms/form-state.ts`:

```ts
import { z } from "zod";

/** Field name → error messages, as forms display them. */
export type FieldErrors = Partial<Record<string, string[]>>;

/** What a form's Server Action returns to the form. */
export type FormState = {
  /** A problem with the whole submission, shown above the form. */
  error?: string;
  /** A neutral note, such as "Check your email." */
  message?: string;
  fieldErrors?: FieldErrors;
  /** What the user typed, so a failed submit does not clear the form. Never passwords. */
  values?: Record<string, string>;
};

/** Zod's errors grouped by field, for the browser and the server alike. */
export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors;
}

/**
 * The first step of every form action. `keep` lists the fields to send back
 * on failure, never passwords.
 */
export function parseForm<T>(
  schema: z.ZodType<T>,
  formData: FormData,
  keep: readonly string[],
):
  | { ok: true; data: T; values: Record<string, string> }
  | { ok: false; state: FormState } {
  const values = Object.fromEntries(
    keep.map((name) => [name, String(formData.get(name) ?? "")]),
  );
  const result = schema.safeParse(Object.fromEntries(formData));
  return result.success
    ? { ok: true, data: result.data, values }
    : { ok: false, state: { values, fieldErrors: fieldErrorsOf(result.error) } };
}
```

Run `npm test`. Expected: PASS.

- [ ] **Step 4: Write the shared form building blocks**

Create `src/hooks/use-validated-form.ts`:

```ts
import { useActionState, useState, type FormEvent } from "react";
import type { z } from "zod";
import {
  fieldErrorsOf,
  type FieldErrors,
  type FormState,
} from "@/lib/forms/form-state";

type FormAction = (
  previous: FormState,
  formData: FormData,
) => Promise<FormState>;

/**
 * Connects a form to its Server Action and runs the action's Zod schema in the
 * browser first, so mistakes show at once without a request. The action still
 * validates everything on the server.
 */
export function useValidatedForm(action: FormAction, schema: z.ZodType) {
  const [state, formAction, pending] = useActionState(action, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const result = schema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (result.success) {
      setClientErrors(undefined);
      return;
    }
    event.preventDefault();
    setClientErrors(fieldErrorsOf(result.error));
  }

  return {
    state,
    formAction,
    pending,
    onSubmit,
    fieldErrors: clientErrors ?? state.fieldErrors,
  };
}

/** What `useValidatedForm` returns; form components take this as their `form` prop. */
export type ValidatedForm = ReturnType<typeof useValidatedForm>;
```

Create `src/components/form/field.tsx`:

```tsx
import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = ComponentProps<typeof Input> & {
  name: string;
  label: string;
  errors?: string[];
};

/** A labelled input with its first error, wired up for screen readers. */
export function Field({ name, label, errors, ...inputProps }: FieldProps) {
  const errorId = `${name}-error`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...inputProps}
      />
      {hasError ? (
        <p id={errorId} className="text-sm text-destructive">
          {errors?.[0]}
        </p>
      ) : null}
    </div>
  );
}
```

Create `src/components/form/form-alert.tsx`:

```tsx
/** The message above a form: an error, or a neutral note. */
export function FormAlert({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className="rounded-md border px-3 py-2 text-sm">
        {message}
      </p>
    );
  }
  return null;
}
```

Create `src/components/form/form-shell.tsx`:

```tsx
import type { ReactNode } from "react";
import type { ValidatedForm } from "@/hooks/use-validated-form";
import { FormAlert } from "./form-alert";

/** The form element every form uses: action, browser-side check, alert, spacing. */
export function FormShell({
  form,
  children,
}: {
  form: ValidatedForm;
  children: ReactNode;
}) {
  return (
    <form
      action={form.formAction}
      onSubmit={form.onSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      <FormAlert error={form.state.error} message={form.state.message} />
      {children}
    </form>
  );
}
```

Create `src/components/form/submit-button.tsx`:

```tsx
import { Button } from "@/components/ui/button";

/** A form's submit button, which says what is happening while the action runs. */
export function SubmitButton({
  pending,
  idle,
  busy,
}: {
  pending: boolean;
  idle: string;
  busy: string;
}) {
  return (
    <Button type="submit" disabled={pending}>
      {pending ? busy : idle}
    </Button>
  );
}
```

- [ ] **Step 5: Write the viewer loader and the Server Actions**

Create `src/server/auth/viewer.ts`:

```ts
import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./index";
import { viewerSchema, type Viewer } from "./viewer-type";

/** The signed-in user, or null. Read once per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const parsed = viewerSchema.safeParse(session.user);
  return parsed.success ? parsed.data : null;
});
```

Create `src/server/auth/actions.ts`. The error codes were confirmed against Better Auth 1.7.5: a wrong password is a 401, a suspended account is a 403 with the message `ACCOUNT_SUSPENDED`.

```ts
"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { parseForm, type FormState } from "@/lib/forms/form-state";
import { loginSchema, signupSchema } from "@/lib/validation/auth";
import { ACCOUNT_SUSPENDED } from "./create-auth";
import { auth } from "./index";

/** The signup form's action. Creates the account, signs the user in and goes to /dashboard. */
export async function signUp(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseForm(signupSchema, formData, ["name", "email", "role"]);
  if (!parsed.ok) return parsed.state;

  try {
    // Signs the new user in; nextCookies() sets the session cookie.
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return {
      values: parsed.values,
      error: error.body?.message ?? "Could not create the account.",
    };
  }
  redirect("/dashboard");
}

/** The login form's action. Signs the user in, or returns the error the form shows. */
export async function signIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseForm(loginSchema, formData, ["email"]);
  if (!parsed.ok) return parsed.state;

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return { values: parsed.values, error: signInErrorMessage(error) };
  }
  redirect("/dashboard");
}

function signInErrorMessage(error: APIError): string {
  if (error.body?.message === ACCOUNT_SUSPENDED) {
    return "This account is suspended. Contact the site administrator if you think this is a mistake.";
  }
  if (error.statusCode === 429) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return "That email and password do not match an account.";
}

/** Ends the session and returns to the login page. */
export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
```

- [ ] **Step 6: Write the auth pages**

In `src/lib/domain/roles.ts`, add this line directly below the `SIGNUP_ROLES` declaration:

```ts
export type SignupRole = (typeof SIGNUP_ROLES)[number];
```

Create `src/app/(auth)/layout.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Link href="/" className="text-sm font-semibold">
        UAE Venture Guide
      </Link>
      {children}
    </main>
  );
}
```

Create `src/app/(auth)/auth-card.tsx`. Only the auth screens use it, so it lives beside them:

```tsx
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** The card every auth screen sits in: a heading, a line of context, the content. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{title}</h1>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

Both auth forms ask for an email and a password, so those two inputs are shared. Create `src/app/(auth)/credentials-fields.tsx`:

```tsx
import { Field } from "@/components/form/field";
import type { ValidatedForm } from "@/hooks/use-validated-form";

/** The email and password inputs that the login and signup forms share. */
export function CredentialsFields({
  form,
  passwordAutoComplete,
}: {
  form: ValidatedForm;
  passwordAutoComplete: "current-password" | "new-password";
}) {
  return (
    <>
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={form.state.values?.email}
        errors={form.fieldErrors?.email}
      />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete={passwordAutoComplete}
        errors={form.fieldErrors?.password}
      />
    </>
  );
}
```

Create `src/app/(auth)/login/login-form.tsx`:

```tsx
"use client";

import Link from "next/link";
import { FormShell } from "@/components/form/form-shell";
import { SubmitButton } from "@/components/form/submit-button";
import { useValidatedForm } from "@/hooks/use-validated-form";
import { loginSchema } from "@/lib/validation/auth";
import { signIn } from "@/server/auth/actions";
import { CredentialsFields } from "../credentials-fields";

/** The login page's client part: the form and its state. */
export function LoginForm() {
  const form = useValidatedForm(signIn, loginSchema);
  return (
    <FormShell form={form}>
      <CredentialsFields form={form} passwordAutoComplete="current-password" />
      <SubmitButton pending={form.pending} idle="Log in" busy="Logging in…" />
      <p className="text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </FormShell>
  );
}
```

Create `src/app/(auth)/login/page.tsx`:

```tsx
import type { Metadata } from "next";
import { AuthCard } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthCard title="Log in" description="Welcome back.">
      <LoginForm />
    </AuthCard>
  );
}
```

Create `src/app/(auth)/signup/signup-form.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Field } from "@/components/form/field";
import { FormShell } from "@/components/form/form-shell";
import { SubmitButton } from "@/components/form/submit-button";
import { useValidatedForm } from "@/hooks/use-validated-form";
import type { SignupRole } from "@/lib/domain/roles";
import { signupSchema } from "@/lib/validation/auth";
import { signUp } from "@/server/auth/actions";
import { CredentialsFields } from "../credentials-fields";

const ROLE_OPTIONS: { value: SignupRole; label: string; hint: string }[] = [
  {
    value: "entrepreneur",
    label: "Entrepreneur or student",
    hint: "Plan a business and track your progress.",
  },
  {
    value: "mentor",
    label: "Mentor",
    hint: "Guide founders. An admin reviews new mentors first.",
  },
  {
    value: "funder",
    label: "Funder",
    hint: "Discover shared plans. An admin reviews new funders first.",
  },
];

/** The signup page's client part: the form, its state and the role choice. */
export function SignupForm() {
  const form = useValidatedForm(signUp, signupSchema);
  const selectedRole = form.state.values?.role || "entrepreneur";

  return (
    <FormShell form={form}>
      <Field
        name="name"
        label="Full name"
        autoComplete="name"
        defaultValue={form.state.values?.name}
        errors={form.fieldErrors?.name}
      />
      <CredentialsFields form={form} passwordAutoComplete="new-password" />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">I am joining as</legend>
        {ROLE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[:checked]:border-primary"
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              defaultChecked={selectedRole === option.value}
              className="mt-1"
            />
            <span className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-sm text-muted-foreground">
                {option.hint}
              </span>
            </span>
          </label>
        ))}
        {form.fieldErrors?.role ? (
          <p className="text-sm text-destructive">{form.fieldErrors.role[0]}</p>
        ) : null}
      </fieldset>
      <SubmitButton
        pending={form.pending}
        idle="Create account"
        busy="Creating account…"
      />
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </FormShell>
  );
}
```

Create `src/app/(auth)/signup/page.tsx`:

```tsx
import type { Metadata } from "next";
import { AuthCard } from "../auth-card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Plan a business, guide founders, or discover plans to back."
    >
      <SignupForm />
    </AuthCard>
  );
}
```

Create `src/app/(auth)/pending/page.tsx`:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { dashboardPathFor } from "@/lib/domain/roles";
import { signOut } from "@/server/auth/actions";
import { getViewer } from "@/server/auth/viewer";
import { AuthCard } from "../auth-card";

export const metadata: Metadata = { title: "Account status" };

const COPY = {
  pending: {
    title: "Your account is waiting for approval",
    body: "An admin reviews every new mentor and funder account. Log in again once you have been approved.",
  },
  suspended: {
    title: "Your account is suspended",
    body: "Contact the site administrator if you think this is a mistake.",
  },
  missing: {
    title: "We could not load your account",
    body: "Log out and try again. If this keeps happening, contact the site administrator.",
  },
} as const;

export default async function PendingPage() {
  const viewer = await getViewer();
  if (viewer?.status === "active") redirect(dashboardPathFor(viewer.role));

  // Never redirect to /login from here: the proxy sends signed-in users on
  // /login back to /pending, and that would loop.
  const copy = viewer ? COPY[viewer.status] : COPY.missing;

  return (
    <AuthCard title={copy.title} description={copy.body}>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </AuthCard>
  );
}
```

- [ ] **Step 7: Link the landing page to the new pages**

Replace `src/app/page.tsx` with:

```tsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        UAE Venture Guide
      </h1>
      <p className="text-lg text-muted-foreground">
        Turn a business idea into a startup plan for the UAE: the steps, the
        costs, the documents and the risks, grounded in official sources.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/signup" className={buttonVariants()}>
          Create an account
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Log in
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Try it by hand**

```bash
npm run dev
```

1. Open <http://localhost:3000>, choose "Create an account", and press "Create account" with the form empty. Expected: field errors appear at once, before any request (the browser-side Zod check).
2. Fill it in, pick **Mentor**, and submit with a new email. Expected: `/pending` with "Your account is waiting for approval".
3. Choose "Log out". Expected: `/login`.
4. Log in as `entrepreneur@example.com` with a wrong password. Expected: "That email and password do not match an account.", and the email field keeps its value.
5. Log in with the `SEED_PASSWORD` from `.env.local`. Expected: the URL becomes `/dashboard/entrepreneur` and shows a 404; Task 7 builds the dashboards.

Stop the dev server.

- [ ] **Step 9: Check and commit**

```bash
npm run format
npm run check
```

knip may report dependencies that shadcn installed. Since `knip.json` includes `.css` files, packages that `src/app/globals.css` imports (typically `tw-animate-css` and `shadcn`) should count as used. For each one knip still reports, run `grep -rn "<name>" src/`. If only `globals.css` imports it, or nothing imports it yet but shadcn components added in later phases will (typically `lucide-react`), add it to `ignoreDependencies` in `knip.json` and run the check again. If jscpd reports a clone, extract the repeated part into a helper instead of raising the threshold.

```bash
git add -A
git commit -m "feat: signup, login and pending screen on shared form helpers"
```

---

### Task 7: App shell, role dashboards and admin approval

**Files:**

- Create: `src/components/ui/{badge,table}.tsx` (shadcn), `src/components/page-header.tsx`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/dashboard/entrepreneur/page.tsx`, `src/app/(app)/dashboard/mentor/page.tsx`, `src/app/(app)/dashboard/funder/page.tsx`, `src/app/(app)/admin/page.tsx`, `src/app/(app)/admin/actions.ts`, `src/app/(app)/admin/status-action.ts`, `src/app/(app)/admin/status-action.test.ts`
- Modify: `src/server/auth/viewer.ts` (add `requireViewer`)

**Interfaces:**

- Consumes: `getViewer` (Task 6); `signOut` (Task 6); `dashboardPathFor`, `UserRole`, `AccountStatus` (Task 2); `listUsersForAdmin`, `setUserStatus` (Task 4).
- Produces: `requireViewer(role: UserRole): Promise<Viewer>`; `PageHeader({ title, description? })`; `formatDate(date: Date): string`; `SETTABLE_STATUSES` (`["active", "suspended"]`, the statuses an admin can set); `statusActionFor(status: AccountStatus): { label: "Approve" | "Suspend" | "Reactivate"; next: (typeof SETTABLE_STATUSES)[number] }`; `changeUserStatus(formData: FormData): Promise<void>`.

Every signed-in page has a header and many will show dates, so `PageHeader` and `formatDate` are built with their first callers here (A10).

- [ ] **Step 1: Add the shadcn components**

```bash
npx --yes shadcn@4.21.0 add badge table
```

- [ ] **Step 2: Write the failing tests**

Create `src/app/(app)/admin/status-action.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { statusActionFor } from "./status-action";

describe("statusActionFor", () => {
  it.each([
    ["pending", { label: "Approve", next: "active" }],
    ["active", { label: "Suspend", next: "suspended" }],
    ["suspended", { label: "Reactivate", next: "active" }],
  ] as const)("offers a %s account the right action", (status, expected) => {
    expect(statusActionFor(status)).toEqual(expected);
  });
});
```

Create `src/lib/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("shows the date in UAE time, which can be a day ahead of UTC", () => {
    // 21:30 UTC on 23 September is 01:30 on 24 September in Dubai.
    expect(formatDate(new Date("2026-09-23T21:30:00Z"))).toMatch(
      /^24 Sept? 2026$/,
    );
  });
});
```

Run `npm test`. Expected: FAIL with `Failed to load url ./status-action` and `./format`.

- [ ] **Step 3: Write the status action and the date formatter, and watch the tests pass**

Create `src/app/(app)/admin/status-action.ts`:

```ts
import type { AccountStatus } from "@/lib/domain/roles";

/** Statuses an admin can move an account to. Pending is only ever a starting status. */
export const SETTABLE_STATUSES = [
  "active",
  "suspended",
] as const satisfies readonly AccountStatus[];

type StatusAction = {
  label: "Approve" | "Suspend" | "Reactivate";
  next: (typeof SETTABLE_STATUSES)[number];
};

/** The one button an admin sees next to an account in the given status. */
export function statusActionFor(status: AccountStatus): StatusAction {
  switch (status) {
    case "pending":
      return { label: "Approve", next: "active" };
    case "active":
      return { label: "Suspend", next: "suspended" };
    case "suspended":
      return { label: "Reactivate", next: "active" };
  }
}
```

Create `src/lib/format.ts`:

```ts
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Asia/Dubai",
});

/** A date as read in the UAE, for example "24 Sept 2026". */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}
```

Run `npm test`. Expected: PASS.

- [ ] **Step 4: Add `requireViewer` and `PageHeader`**

In `src/server/auth/viewer.ts`, add these imports at the top:

```ts
import { redirect } from "next/navigation";
import { dashboardPathFor, type UserRole } from "@/lib/domain/roles";
```

Append:

```ts
/**
 * For pages that need an active user with one specific role. Redirects
 * instead of rendering when the user does not qualify, so no page relies on
 * the proxy alone.
 */
export async function requireViewer(role: UserRole): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.status !== "active") redirect("/pending");
  if (viewer.role !== role) redirect(dashboardPathFor(viewer.role));
  return viewer;
}
```

Create `src/components/page-header.tsx`:

```tsx
/** The heading block at the top of every signed-in page. */
export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Write the app shell and dashboards**

Create `src/app/(app)/layout.tsx`:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth/actions";
import { getViewer } from "@/server/auth/viewer";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.status !== "active") redirect("/pending");

  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="font-semibold">
            UAE Venture Guide
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span>{viewer.name}</span>
            <Badge variant="secondary">{viewer.role}</Badge>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
```

Create `src/app/(app)/dashboard/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { dashboardPathFor } from "@/lib/domain/roles";
import { getViewer } from "@/server/auth/viewer";

// The proxy normally redirects /dashboard first. This covers the case where it did not run.
export default async function DashboardPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  redirect(dashboardPathFor(viewer.role));
}
```

Create `src/app/(app)/dashboard/entrepreneur/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Dashboard" };

export default async function EntrepreneurDashboardPage() {
  const viewer = await requireViewer("entrepreneur");
  return (
    <PageHeader
      title={`Welcome, ${viewer.name}`}
      description="You have no business plans yet."
    />
  );
}
```

Create `src/app/(app)/dashboard/mentor/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Dashboard" };

export default async function MentorDashboardPage() {
  const viewer = await requireViewer("mentor");
  return (
    <PageHeader
      title={`Welcome, ${viewer.name}`}
      description="Guidance requests and your experience posts will show up here."
    />
  );
}
```

Create `src/app/(app)/dashboard/funder/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireViewer } from "@/server/auth/viewer";

export const metadata: Metadata = { title: "Dashboard" };

export default async function FunderDashboardPage() {
  const viewer = await requireViewer("funder");
  return (
    <PageHeader
      title={`Welcome, ${viewer.name}`}
      description="Business plans that founders share with funders will show up here."
    />
  );
}
```

- [ ] **Step 6: Write the admin users page and its action**

Create `src/app/(app)/admin/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/server/auth/viewer";
import { setUserStatus } from "@/server/data/users";
import { SETTABLE_STATUSES } from "./status-action";

const statusChange = z.object({
  userId: z.string().regex(/^[0-9a-f]{24}$/),
  status: z.enum(SETTABLE_STATUSES),
});

/** Approve, suspend or reactivate one account. The data layer checks again. */
export async function changeUserStatus(formData: FormData): Promise<void> {
  const viewer = await requireViewer("admin");
  const { userId, status } = statusChange.parse(Object.fromEntries(formData));
  await setUserStatus(viewer, userId, status);
  revalidatePath("/admin");
}
```

Create `src/app/(app)/admin/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { requireViewer } from "@/server/auth/viewer";
import { listUsersForAdmin } from "@/server/data/users";
import { changeUserStatus } from "./actions";
import { statusActionFor } from "./status-action";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const viewer = await requireViewer("admin");
  const users = await listUsersForAdmin(viewer);

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Users"
        description="Pending mentors and funders are listed first. Approve them to let them in."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const action = statusActionFor(user.status);
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "secondary" : "outline"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-end">
                  {user.role === "admin" ? null : (
                    <form action={changeUserStatus}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="status" value={action.next} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={
                          action.next === "suspended" ? "outline" : "default"
                        }
                        aria-label={`${action.label} ${user.name}`}
                      >
                        {action.label}
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
```

- [ ] **Step 7: Try the approval flow by hand**

```bash
npm run dev
```

1. Sign up as a new **Funder**. Expected: `/pending`. Log out.
2. Log in as `admin@example.com` with the `SEED_PASSWORD`. Expected: `/admin`, with the new funder at the top and an **Approve** button.
3. Choose **Approve**. Expected: the badge becomes `active` and the button **Suspend**. Log out.
4. Log in as the funder. Expected: `/dashboard/funder` with "Welcome, <name>".
5. Still as the funder, open <http://localhost:3000/admin>. Expected: redirected to `/dashboard/funder`.
6. Log out, log in as the admin, and **Suspend** the funder. Log out and try to log in as the funder. Expected: "This account is suspended…".

Stop the dev server.

- [ ] **Step 8: Check and commit**

```bash
npm run format
npm run check
git add -A
git commit -m "feat: role dashboards and admin approval of mentors and funders"
```

---

### Task 8: End-to-end and accessibility tests on a throwaway database

**Files:**

- Create: `tests/e2e/demo.ts`, `scripts/e2e-server.mts`, `playwright.config.ts`, `tests/e2e/auth.spec.ts`, `tests/e2e/accessibility.spec.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `setupDatabase` (Task 2), `createAuth` (Task 3), `seedDemoUsers` (Task 4); labels, headings and button names from Tasks 6 and 7.
- Produces: `npm run e2e`, and `E2E_BASE_URL`, `E2E_DEMO_PASSWORD` in `tests/e2e/demo.ts`.

- [ ] **Step 1: Install Playwright and axe**

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install chromium
npm pkg set scripts.e2e="playwright test"
```

- [ ] **Step 2: Write the e2e server**

End-to-end tests must never write to Atlas, so the dev server they drive gets its own in-memory database. Variables already set in the environment win over `.env.local`, so the app never sees the Atlas connection string during the run.

Create `tests/e2e/demo.ts`:

```ts
/** Where the e2e dev server listens. Better Auth checks request origins against this exact URL. */
export const E2E_BASE_URL = "http://127.0.0.1:3100";

/** Password of the demo accounts seeded into the throwaway e2e database. */
export const E2E_DEMO_PASSWORD = "e2e-demo-password-123";
```

Create `scripts/e2e-server.mts`:

```ts
import { spawn } from "node:child_process";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { E2E_BASE_URL, E2E_DEMO_PASSWORD } from "../tests/e2e/demo";

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
const env = {
  MONGODB_URI: replSet.getUri(),
  MONGODB_DB: "uvg_e2e",
  BETTER_AUTH_SECRET: "e2e-only-secret-that-is-32-plus-chars",
  BETTER_AUTH_URL: E2E_BASE_URL,
};
// Set before importing server modules, which read these on import.
Object.assign(process.env, env);

const { db, mongoClient } = await import("@/server/db/client");
const { setupDatabase } = await import("@/server/db/setup");
const { createAuth } = await import("@/server/auth/create-auth");
const { seedDemoUsers } = await import("@/server/db/seed");

await setupDatabase(db);
await seedDemoUsers(
  createAuth({
    db,
    client: mongoClient,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  }),
  db,
  E2E_DEMO_PASSWORD,
);
await mongoClient.close();

const next = spawn(
  "npx",
  ["next", "dev", "--port", "3100", "--hostname", "127.0.0.1"],
  { env: { ...process.env, ...env }, stdio: "inherit" },
);

async function shutdown(code: number) {
  next.kill("SIGTERM");
  await replSet.stop();
  process.exit(code);
}
process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
next.on("exit", (code) => void shutdown(code ?? 0));
```

- [ ] **Step 3: Write the Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL } from "./tests/e2e/demo";

/**
 * Starts its own dev server on port 3100 with a throwaway MongoDB
 * (scripts/e2e-server.mts). Stop your own `npm run dev` first: two Next.js
 * dev servers in one folder get in each other's way.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx tsx --conditions=react-server scripts/e2e-server.mts",
    url: E2E_BASE_URL,
    // Never reuse a server: one started by hand would point at Atlas.
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
```

- [ ] **Step 4: Write the tests**

Create `tests/e2e/auth.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";
import { E2E_DEMO_PASSWORD } from "./demo";

const password = "e2e-password-123";

function unique(label: string) {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    name: `${label} ${suffix}`,
    email: `e2e-${label.toLowerCase()}-${suffix}@example.com`,
  };
}

async function signUp(
  page: Page,
  person: { name: string; email: string },
  role: RegExp,
) {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill(person.name);
  await page.getByLabel("Email").fill(person.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("radio", { name: role }).check();
  await page.getByRole("button", { name: "Create account" }).click();
}

async function logIn(page: Page, email: string, secret: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(secret);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("an entrepreneur signs up and lands on their dashboard", async ({
  page,
}) => {
  const founder = unique("Founder");
  await signUp(page, founder, /Entrepreneur/);
  await expect(page).toHaveURL(/\/dashboard\/entrepreneur$/);
  await expect(
    page.getByRole("heading", { name: `Welcome, ${founder.name}` }),
  ).toBeVisible();
});

test("an empty signup shows field errors without leaving the page", async ({
  page,
}) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page).toHaveURL(/\/signup$/);
});

test("a wrong password shows an error and keeps the email", async ({
  page,
}) => {
  await logIn(page, "entrepreneur@example.com", "wrong-password");
  await expect(page.getByRole("alert")).toHaveText(
    "That email and password do not match an account.",
  );
  await expect(page.getByLabel("Email")).toHaveValue(
    "entrepreneur@example.com",
  );
});

test("a new mentor waits for approval, then gets in", async ({ browser }) => {
  const mentor = unique("Mentor");

  const mentorPage = await (await browser.newContext()).newPage();
  await signUp(mentorPage, mentor, /Mentor/);
  await expect(mentorPage).toHaveURL(/\/pending$/);
  await expect(
    mentorPage.getByRole("heading", {
      name: "Your account is waiting for approval",
    }),
  ).toBeVisible();

  const adminPage = await (await browser.newContext()).newPage();
  await logIn(adminPage, "admin@example.com", E2E_DEMO_PASSWORD);
  await expect(adminPage).toHaveURL(/\/admin$/);
  await adminPage
    .getByRole("button", { name: `Approve ${mentor.name}` })
    .click();
  await expect(
    adminPage.getByRole("button", { name: `Suspend ${mentor.name}` }),
  ).toBeVisible();

  await mentorPage.goto("/dashboard");
  await expect(mentorPage).toHaveURL(/\/dashboard\/mentor$/);
});

test("a signed-in entrepreneur cannot open the admin page", async ({
  page,
}) => {
  await logIn(page, "entrepreneur@example.com", E2E_DEMO_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard\/entrepreneur$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard\/entrepreneur$/);
});
```

Create `tests/e2e/accessibility.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/login", "/signup"]) {
  test(`${path} has no detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 5: Run them**

Stop any `npm run dev` you have running, then:

```bash
npm run e2e
```

Expected: 8 tests PASS. If an axe test fails, the output lists each violation's `id` and the offending HTML. Fix the markup and run again; do not disable rules.

- [ ] **Step 6: Check and commit**

```bash
npm run format
npm run check
git add -A
git commit -m "test: end-to-end signup, approval and accessibility on a throwaway database"
```

---

### Task 9: CI, function region, setup guide and the preview deploy

**Files:**

- Create: `.github/workflows/ci.yml`, `vercel.json`
- Modify: `README.md`

**Interfaces:**

- Consumes: npm scripts `check`, `test:integration`, `build`, `e2e` (Tasks 1–8).

- [ ] **Step 1: Pin Vercel functions to Mumbai**

The Atlas cluster is in AWS Mumbai, and Vercel's `bom1` is the same AWS region. Hobby allows one function region.

Create `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["bom1"]
}
```

- [ ] **Step 2: Write the CI workflow**

No job needs the Atlas connection string: integration and end-to-end tests use in-memory MongoDB, and the build gets placeholder values because it never connects.

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run check

  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - uses: actions/cache@v4
        with:
          path: ~/.cache/mongodb-binaries
          key: mongodb-binaries-${{ runner.os }}
      - run: npm ci
      - run: npm run test:integration

  e2e:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - uses: actions/cache@v4
        with:
          path: ~/.cache/mongodb-binaries
          key: mongodb-binaries-${{ runner.os }}
      - run: npm ci
      # Catches production-build failures that the dev server hides.
      - run: npm run build
        env:
          MONGODB_URI: mongodb://127.0.0.1:27017
          MONGODB_DB: uvg_build
          BETTER_AUTH_SECRET: ci-build-placeholder-secret-32-chars
          BETTER_AUTH_URL: http://127.0.0.1:3100
      - run: npx playwright install --with-deps chromium
      - run: npm run e2e
      - if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
```

- [ ] **Step 3: Add the setup guide to the README**

In `README.md`, replace `**Status:** planning. No application code yet. Phase 0 is next.` with `**Status:** Phase 0 (foundation) done. Phase 1 is next.`, and add this section after the Docs table:

````markdown
## Getting started

Needs Node 24 and a MongoDB Atlas free cluster (AWS Mumbai). There is no local database; see [Environments](docs/02-architecture.md#environments).

1. Copy `.env.example` to `.env.local` and fill it in: the Atlas connection string, a random secret of 32+ characters, and a demo password.
2. Install, prepare the database, and start:

```bash
npm install
npm run db:setup   # collections, validators and indexes on your Atlas database
npm run db:seed    # demo accounts; the password is SEED_PASSWORD
npm run dev        # http://localhost:3000
```

Demo accounts: `admin@example.com`, `entrepreneur@example.com`, `mentor@example.com`, `funder@example.com`.

| Command | What it checks |
| --- | --- |
| `npm run check` | Formatting, ESLint (including the database boundary), types, Markdown, dead code, copy-paste, unit tests |
| `npm run test:integration` | Better Auth rules and the data layer against an in-memory MongoDB. The first run downloads MongoDB |
| `npm run e2e` | Signup, approval and accessibility in a browser, on a throwaway database. Stop your own dev server first |
````

- [ ] **Step 4: Confirm the helper catalogue matches the code**

Every Phase 0 row in the catalogue of [06-conventions.md](../06-conventions.md) must point at a file that now exists:

```bash
grep -E '\| 0 \|$' docs/06-conventions.md | grep -oE '`(src|tests)/[^`]+`' | tr -d '`' | while read -r path; do
  if [ -e "$path" ] || ls $path >/dev/null 2>&1; then echo "ok      $path"; else echo "MISSING $path"; fi
done
```

Expected: every line starts with `ok`. For a `MISSING` line, fix the catalogue or the file so they agree.

- [ ] **Step 5: Check and commit**

```bash
npm run format
npm run check
git add -A
git commit -m "ci: checks, integration and e2e tests, Mumbai function region"
```

- [ ] **Step 6: Push and watch CI (needs a GitHub repository)**

Only once the owner has created a GitHub repository and added it as `origin`:

```bash
git push -u origin main
gh run watch
```

Expected: `check` and `integration` pass. On a push to `main`, `e2e` passes too.

- [ ] **Step 7: Preview deploy (needs a Vercel account)**

These steps create cloud resources, so the project owner runs them or approves each one.

1. In Atlas, under Network Access, add `0.0.0.0/0`. Vercel has no fixed IP addresses and the free tier has no private networking; the database user's long password is the protection.
2. Prepare the preview database from your machine. Variables set on the command line win over `.env.local`:

   ```bash
   MONGODB_DB=uae_venture_guide_preview npm run db:setup
   MONGODB_DB=uae_venture_guide_preview SEED_PASSWORD='a-different-strong-password' npm run db:seed
   ```

3. In Vercel, import the GitHub repository. In the project's settings, change the production branch from `main` to `production`, a branch that does not exist until Phase 7. Otherwise Vercel deploys `main` to Production, where none of the variables below are set.
4. For the **Preview** environment set `MONGODB_URI` (same cluster), `MONGODB_DB=uae_venture_guide_preview`, a new `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), and `BETTER_AUTH_URL` set to the `main` branch's preview URL, the branch domain Vercel shows on the deployment (`<project>-git-main-<team>.vercel.app`).
5. Redeploy `main` so it builds as a preview with these variables, then open that URL.

Expected: the landing page loads; the preview's admin can log in with the preview seed password and see `/admin`; a new mentor sees the pending screen until approved.

---

## Phase 0 exit check

From [05-roadmap.md](../05-roadmap.md): each role signs up and lands on its own dashboard (Task 8 e2e, Task 7 manual check). A new mentor sees the pending screen until an admin approves them (Task 8 e2e). Tests prove that no user can change their own role or status (Task 3: `update-user` refuses both; Task 4: only admins change status). CI is green (Task 9, Step 6) and a preview deploy works (Task 9, Step 7).
