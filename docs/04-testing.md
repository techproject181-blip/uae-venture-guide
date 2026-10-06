# Testing

There are three kinds of tests.

- **Unit tests** (Vitest, `src/**/*.test.js`, 5 files). No database. They cover form rules, budget totals, the daily limit and theme colours.
- **Database tests** (Vitest, `tests/integration`, 5 files). They use the MongoDB from `.env.local`. Each file gets its own empty database that's deleted after. They cover access rules, messages, chat, quota and roadmap making.
- **Browser tests** (Playwright, `tests/e2e`). A real browser clicks through sign-in, plans, PDF, mentors, funders, admin approval, security, keyboard use and every page.

## Run them

- `npm test` for unit and database tests
- `npm run seed`, then `npm run test:e2e` for browser tests

GitHub Actions (`.github/workflows/check.yml`) runs lint, tests, build, seed and browser tests on every push and pull request, with its own temporary MongoDB.

## Key manual checks

| Test | Expected |
| --- | --- |
| Sign up as mentor or funder | "Waiting for approval" |
| Five wrong passwords | Locked for 15 minutes |
| Make a sixth roadmap in a day | Refused, daily limit |
| Open someone else's plan | 404 not found |
| Message after a request is completed | No send box, API returns 409 |
| Owner accepts funder interest | Funder can read the full plan |
