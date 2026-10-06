# Testing

The app has three kinds of automated tests.

## 1. Unit tests (Vitest)

Vitest is a test runner for JavaScript. Unit tests sit next to the code, in `src/**/*.test.js` (5 files). They need no database.

- Form rules for sign-up and plans (`src/lib/schemas`).
- Budget totals (`budget.test.js`) and the daily AI limit (`quota.test.js`).
- Theme colours (`theme-colors.test.js`).

## 2. Database tests (Vitest)

These are in `tests/integration` (5 files). They use the MongoDB from `.env.local`. Each test file gets its own empty database, which is deleted at the end.

- Who can open which plan or request (`access.test.js`).
- Request messages: only the two people in a request can read them, and no new messages after it is completed (`messages.test.js`).
- The plan chat, the daily limit and roadmap making (`chat`, `quota`, `roadmap`).

## 3. Browser tests (Playwright)

Playwright opens a real browser and clicks through the app. These are in `tests/e2e`.

- Sign up, sign in, lockout and sign out (`auth.spec.js`).
- Make a plan, mark steps done, download the PDF (`plan.spec.js`).
- Mentors, funders and admin approval (`community.spec.js`).
- Security checks such as blocked pages (`security.spec.js`), keyboard use (`keyboard.spec.js`) and every page loading (`pages.spec.js`).

## How to run

| Tests | Command |
| --- | --- |
| Unit and database tests | `npm test` |
| Browser tests | `npm run test:e2e` (run `npm run seed` first) |

## CI

GitHub Actions runs `.github/workflows/check.yml` on every push and pull request.
It runs lint, `npm test`, the build, the seed and the browser tests, using its own temporary MongoDB.

## Important manual test cases

| ID | Steps | Expected result |
| --- | --- | --- |
| AUTH-01 | Sign up as an entrepreneur | Lands on the dashboard |
| AUTH-02 | Sign up as a mentor or funder | Sees "waiting for approval" |
| AUTH-05 | Sign in with a wrong password | "Email or password is incorrect." |
| AUTH-06 | Enter five wrong passwords in a row | Sign-in is locked for 15 minutes |
| PLAN-02 | Create a plan | Roadmap with phases, steps, costs, documents and risks |
| PLAN-04 | Mark a step as done | Progress goes up |
| PLAN-11 | Make a sixth roadmap in one day | Refused with a daily limit message |
| PLAN-12 | Another entrepreneur opens your plan | "Not found" (404) |
| MENT-03 | Ask a mentor for guidance twice while waiting | First is sent, second is refused |
| MENT-10 | Mentor completes a request, then someone sends a message | No send box; the API refuses (409) |
| FUND-03 | Owner accepts a funder's interest | The funder can read the full plan |
| ADM-01 | Admin approves and rejects waiting accounts | Approved can use the app, rejected cannot |
