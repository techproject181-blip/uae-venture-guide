# Schema

MongoDB Atlas. One database per environment, named by `MONGODB_DB` (for example `uae_venture_guide_dev`). The auth library (Better Auth) owns four collections; the app owns the rest.

Conventions:

- Ids are `ObjectId` in `_id`. References to users store the user's id as a string, because that is how Better Auth exposes `user.id`.
- Money is whole dirhams stored as integers (`Int32`). Plan estimates never need fils, and integers avoid rounding bugs in totals.
- Every document has `createdAt` and, where it changes, `updatedAt` (both `Date`), omitted below.
- Every collection has a `$jsonSchema` validator for required fields and enum values, created by `npm run db:setup`. Zod validates first, in the app; the validator is the second line of defence when a bug slips past Zod.
- Things that are read and written together live in one document. A plan and its roadmap are one document, so saving a generated roadmap is one atomic write.

## Enums

Stored as strings. The same lists live in `src/lib/domain/enums.ts` (shared by the browser and the server) and in the collection validators.

| Enum | Values |
| --- | --- |
| role | `entrepreneur`, `mentor`, `funder`, `admin` |
| status (account) | `active`, `pending`, `suspended` |
| emirate | `abu_dhabi`, `dubai`, `sharjah`, `ajman`, `umm_al_quwain`, `ras_al_khaimah`, `fujairah` |
| jurisdiction | `mainland`, `free_zone`, `unsure` |
| plan status | `draft`, `generating`, `ready`, `failed` |
| task status | `todo`, `in_progress`, `done` |
| cost basis | `reference` (backed by a fee reference), `estimate` (model estimate, unverified) |
| origin | `ai`, `user` |
| budget category | `licensing`, `visa`, `office`, `equipment`, `technology`, `marketing`, `staff`, `legal`, `other` |
| recurrence | `one_time`, `monthly`, `yearly` |
| level | `low`, `medium`, `high` |
| source category | `licensing`, `visas`, `tax`, `banking`, `free_zones`, `funding`, `legal`, `general` |
| funder type | `angel`, `vc`, `government`, `accelerator`, `corporate`, `other` |
| request status | `pending`, `accepted`, `declined`, `completed` |
| interest status | `pending`, `accepted`, `declined` |
| post status | `published`, `hidden` |

## Accounts

**`user`** (Better Auth). Built-in fields: `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`. Added through `user.additionalFields`:

| Field | Type | Rule |
| --- | --- | --- |
| `role` | string | Accepted at signup, but its validator only allows `entrepreneur`, `mentor` or `funder`. The `user.update.before` hook refuses any change to it through Better Auth's own endpoints (without that hook, a user could switch roles through `/api/auth/update-user` and skip approval). Only admin data functions change it; `admin` is set only by an admin or the seed script |
| `status` | string | Not accepted as input. The `user.create.before` hook sets `active` for entrepreneurs and `pending` for mentors and funders |
| `emirate` | string | Optional |

Indexes: `email_unique` on `{ email: 1 }`, and `status_createdAt` on `{ status: 1, createdAt: -1 }` for the admin users list (pending accounts first, newest first).

**`session`**, **`account`**, **`verification`** (Better Auth). Not touched by app code, except that suspending a user deletes their `session` documents.

**`mentorProfiles`**: `_id` is the user id (string). `headline`, `bio`, `expertise: string[]`, `industries: string[]`, `emirates: string[]`, `yearsExperience`, `linkedinUrl`, `acceptingRequests` (default true).

**`funderProfiles`**: `_id` is the user id (string). `organization`, `funderType`, `ticketMinAed`, `ticketMaxAed`, `sectors: string[]`, `bio`.

## Plans

**`plans`**. One document per plan, roadmap included.

```ts
{
  _id: ObjectId,
  ownerId: string,
  // intake
  title: string,
  idea: string,               // max 2,000 characters
  emirate: Emirate,
  sector: string,             // from a fixed list in the app
  jurisdictionPref: Jurisdiction,
  budgetAed: number,          // integer ≥ 0
  targetCustomers: string,    // max 1,000 characters
  teamSize: number,           // default 1
  // generation
  status: PlanStatus,
  failureReason?: string,
  generationStartedAt?: Date,
  generatedAt?: Date,
  model?: string,
  summary?: string,
  recommendedJurisdiction?: "mainland" | "free_zone",
  jurisdictionReason?: string,
  // roadmap, in display order
  phases: { _id: ObjectId, title: string, description: string }[],
  tasks: {
    _id: ObjectId,
    phaseId: ObjectId,
    title: string,
    description: string,
    authority: string,
    costMinAed: number,
    costMaxAed: number,       // ≥ costMinAed
    costBasis: CostBasis,
    estDays: number,
    status: TaskStatus,
    completedAt?: Date,
    origin: Origin,
    sourceIds: ObjectId[],
  }[],
  budgetItems: {
    _id: ObjectId,
    category: BudgetCategory,
    label: string,
    estimatedAed: number,
    actualAed?: number,
    recurrence: Recurrence,
    costBasis: CostBasis,
    origin: Origin,
  }[],
  documents: {
    _id: ObjectId,
    name: string,
    description: string,
    required: boolean,
    obtained: boolean,
    sourceId?: ObjectId,
  }[],
  risks: {
    _id: ObjectId,
    title: string,
    description: string,
    likelihood: Level,
    impact: Level,
    mitigation: string,
  }[],
  // sharing
  shared: boolean,            // owner opts in to funder discovery
  pitchSummary?: string,      // required when shared
  hiddenByAdmin: boolean,
}
```

Tasks sit in one flat array with a `phaseId` rather than nested inside phases, so changing one task is a single positional update (`tasks.$[t]` with an `arrayFilters` match on `t._id`). A roadmap of 50 tasks is a few tens of kilobytes, far from MongoDB's 16 MB document limit.

Indexes: `{ ownerId: 1, updatedAt: -1 }`, and `{ shared: 1, hiddenByAdmin: 1, emirate: 1, sector: 1 }` for the funder feed.

**`chatMessages`**: `planId: ObjectId`, `authorId: string`, `role` (`user` or `assistant`), `content`, `inputTokens`, `outputTokens`. Kept apart from the plan because it grows without bound. Index `{ planId: 1, createdAt: 1 }`.

## Reference data

**`sources`**: `title`, `publisher`, `url`, `emirate` (null means federal, applies everywhere), `categories: string[]`, `summary`, `verifiedAt`, `active`. Searched with an Atlas Search index named `sources_text` over `title`, `publisher` and `summary`; see [Source search](02-architecture.md#source-search) for the plain text-index mode that automated tests use.

**`feeReferences`**: `sourceId: ObjectId`, `emirate` (null for federal), `jurisdiction` (`mainland` or `free_zone`), `item` (for example "trade licence, professional activity"), `amountMinAed`, `amountMaxAed`, `recurrence`, `notes`, `verifiedAt`, `active`. Index `{ emirate: 1, active: 1 }`.

Both collections start empty except for a few clearly labelled demo rows. An admin enters and verifies real sources and fees before launch; the model never supplies them.

## Mentors, posts, funders

**`mentorRequests`**: `entrepreneurId`, `mentorId`, `planId?: ObjectId`, `topic`, `message`, `status`, `mentorReply?`, `respondedAt?`. Partial unique index on `{ entrepreneurId: 1, mentorId: 1 }` where `status` is `pending`, so one pending request per pair.

**`posts`**: `authorId`, `title`, `body` (Markdown, rendered without raw HTML), `images: { url, storageKey, alt }[]` (at most five, `alt` required), `chart?: { type: "bar" | "line" | "pie", labels: string[], values: number[] }`, `status`. Index `{ status: 1, createdAt: -1 }`.

**`fundingInterests`**: `planId: ObjectId`, `funderId`, `message`, `status`, `respondedAt?`. Unique index on `{ planId: 1, funderId: 1 }`.

## AI usage

**`aiUsage`**: one document per user per day. `userId`, `day` (`"2026-09-23"` in UAE time), `generations`, `chatMessages`, `inputTokens`, `outputTokens`. Unique index on `{ userId: 1, day: 1 }`, plus a TTL index that deletes documents after 180 days.

Quota check and increment happen in one atomic call:

```ts
aiUsage.findOneAndUpdate(
  { userId, day, generations: { $lt: DAILY_GENERATIONS } },
  { $inc: { generations: 1 } },
  { upsert: true },
);
```

If the user is already at the limit, the filter matches nothing, the upsert tries to insert a second document for the same user and day, and the unique index rejects it with a duplicate-key error. The app treats that error as "quota reached". Two requests racing at the limit cannot both pass.

## Access rules

MongoDB has no row-level security for app users, so these rules live in the app, in one place. See "Authorization" in [02-architecture.md](02-architecture.md) for how that is enforced.

Every write requires an `active` account, with one exception: users may edit their own `user` name and their own `mentorProfiles` or `funderProfiles` document while `pending`, so a mentor or funder can fill in their profile before an admin reviews it. Suspended users can do nothing; they cannot even sign in.

`canReadPlan(viewer, plan)` is true when the viewer:

- owns the plan, or
- is an admin, or
- is a mentor with an `accepted` mentor request that has this `planId`, or
- is a funder with an `accepted` funding interest for this plan, while the plan is still shared and not hidden. Turning sharing off therefore ends every funder's access.

| Collection | Read | Write |
| --- | --- | --- |
| `user` | Self; admins (with emails); anyone, for active mentors' name and image | Self (name, image, emirate); admins (role, status) |
| `mentorProfiles` | Anyone, when the mentor is active; self; admins, so they can review a pending mentor | Self |
| `funderProfiles` | Self; admins; owners of plans this funder sent interest to | Self |
| `plans` | `canReadPlan` | Owner; admins may set `hiddenByAdmin` |
| `chatMessages` | Plan owner | Plan owner |
| `sources`, `feeReferences` | Anyone, when `active` | Admins |
| `aiUsage` | Self; admins | Only the quota function |
| `mentorRequests` | The entrepreneur, the mentor, admins | Entrepreneur creates (target mentor must be active and accepting). Mentor sets `accepted`, `declined` or `completed` and the reply |
| `posts` | Anyone, when `published`; author; admins | Active mentor authors; admins may set `hidden` |
| `fundingInterests` | The funder, the plan owner, admins | Active funders create on shared, non-hidden plans. The owner sets `accepted` or `declined` |

**Pitch cards.** Funders never receive a plan document unless `canReadPlan` passes. Discovery goes through `listPitchCards(viewer, filters)`, which checks the viewer is an active funder and projects only `_id`, `title`, `sector`, `emirate`, `budgetAed`, `pitchSummary` and progress percentage, for plans that are shared and not hidden.

**Contact details.** An accepted mentor request or funding interest shows both parties' names and emails. `getRequestContacts(viewer, kind, id)` returns them only when the status is `accepted` and the viewer is one of the two parties.

## Derived values

Computed in `src/lib/domain/budget.ts` and `src/lib/domain/progress.ts`, never stored. They live in `src/lib` because the browser uses them too, for live totals while editing:

- **First-year total** = sum of one-time items + 12 × sum of monthly items + sum of yearly items. Computed twice: once over `estimatedAed`, once over `actualAed` where set.
- **Remaining** = `budgetAed` − estimated first-year total. Negative means over budget, and the UI says so.
- **Progress** = tasks with status `done` ÷ all tasks, rounded to a whole percent. A plan with no tasks is 0%.
