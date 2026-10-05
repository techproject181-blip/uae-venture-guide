# Test cases

Every main task of the app as a test case, with how it is checked. The ones marked with a file name are automated browser tests (Playwright) in `tests/e2e/`; they run in five setups: Chrome, Firefox and Safari's engine (WebKit) on a laptop screen, plus a Chrome phone and an iPhone. Every browser test also fails if a page shows a JavaScript error or the server answers with an error (500 or higher). The ones marked "by hand" are for manual testing.

How to run the automated ones: `npm test` for the unit and database tests, `npm run test:e2e` for the browser tests (with `npm run db:up`, `npm run seed:demo` and `npm run dev` running).

For manual testing, use the demo accounts in the README (password `Demo2026pass`) and fill in the Result column: pass, or what went wrong.

## Accounts (AUTH)

| ID | Test case | Expected result | Checked by | Result |
| --- | --- | --- | --- | --- |
| AUTH-01 | Sign up as an entrepreneur | Lands on the dashboard | `auth.spec.js` | |
| AUTH-02 | Sign up as a mentor or funder | Lands on "waiting for approval"; other pages send them back there | `auth.spec.js`, `security.spec.js` | |
| AUTH-03 | Sign up with empty fields, a bad email or a weak password | Each field shows its own message; no account is made | By hand | |
| AUTH-04 | Sign up with an email that already has an account | Clear message on the email field; no second account | By hand | |
| AUTH-05 | Sign in with the right and the wrong password | Right: dashboard. Wrong: "Email or password is incorrect." | `auth.spec.js` | |
| AUTH-06 | Five wrong passwords in a row | Sign-in is locked for 15 minutes, even with the right password | `auth.spec.js` | |
| AUTH-07 | Sign out, then open a private page | Sent to the sign-in page | `auth.spec.js` | |
| AUTH-08 | Reset a forgotten password with the emailed link | New password works, old one does not, the link works only once | By hand | |
| AUTH-09 | Try to sign up as an administrator through the API | Refused (400) | `security.spec.js` | |
| AUTH-10 | A suspended user opens a page or signs in | Signed out, and told the account is suspended | By hand | |
| AUTH-11 | Sign up using only the keyboard; use the skip link | Fields in visual order, focus always visible, skip link reaches the content | `keyboard.spec.js` | |

## Plans (PLAN)

| ID | Test case | Expected result | Checked by | Result |
| --- | --- | --- | --- | --- |
| PLAN-01 | Submit the new plan form with missing or wrong answers | Each field shows its message; no plan is made | By hand | |
| PLAN-02 | Create a plan | Roadmap with phases, steps, costs, documents and risks | `plan.spec.js` | |
| PLAN-03 | A step whose fee has an official reference | Shows the fee with the OFFICIAL stamp and a link to the source | By hand | |
| PLAN-04 | Mark a step as done | Progress goes up; the step shows the DONE stamp | `plan.spec.js` | |
| PLAN-05 | Add, edit and delete your own step | Each change shows at once and stays after a reload | By hand | |
| PLAN-06 | Add, edit and delete a cost; enter what was paid | Totals update; the "estimated and actual" chart appears; the over-budget warning shows only when over | `plan.spec.js`, by hand | |
| PLAN-07 | Tick a document as obtained | Stays ticked after a reload | By hand | |
| PLAN-08 | Ask the chat a question | Answer from the plan, with sources and the sample-mode note; questions left goes down by one | `plan.spec.js`, by hand | |
| PLAN-09 | Download the PDF report | A PDF file | `plan.spec.js` | |
| PLAN-10 | Make a new version, then delete the plan | New roadmap replaces the old one; after delete the plan is gone | By hand | |
| PLAN-11 | Make a sixth roadmap in one day | Refused with a message about the daily limit | By hand | |
| PLAN-12 | Another entrepreneur opens or changes the plan | "Not found" (404) for every page and action | `security.spec.js` | |

## Mentors (MENT)

| ID | Test case | Expected result | Checked by | Result |
| --- | --- | --- | --- | --- |
| MENT-01 | A mentor fills in a profile while waiting, then is approved | Appears in the mentor directory | `community.spec.js` | |
| MENT-02 | Filter the directory by area and emirate | Only matching mentors are listed | By hand | |
| MENT-03 | Ask a mentor for guidance with a plan attached; ask again while waiting | First request is sent; the second is refused with a clear message | `community.spec.js`, by hand | |
| MENT-04 | The mentor accepts, then marks the request completed | Can read the plan while accepted, not before or after | `community.spec.js`, by hand | |
| MENT-05 | The mentor declines a request | The entrepreneur sees it as declined; no access to the plan | By hand | |
| MENT-06 | A mentor writes a post with a chart and a picture, edits it, deletes it | Shows on the public posts page, changes after editing, gone after deleting | By hand | |
| MENT-07 | HTML inside a post | Shown as nothing, never run | `security.spec.js` | |
| MENT-08 | Ask a mentor who is not taking requests | Refused with a clear message | By hand | |

## Funders (FUND)

| ID | Test case | Expected result | Checked by | Result |
| --- | --- | --- | --- | --- |
| FUND-01 | Share a plan with a pitch summary | The pitch card appears on the funders' discover page | `community.spec.js` | |
| FUND-02 | A funder sends interest; sends it again | First is sent; the second is refused | `community.spec.js`, by hand | |
| FUND-03 | The owner accepts the interest | The funder can read the full plan | `community.spec.js` | |
| FUND-04 | The owner declines the interest | The funder sees it declined and cannot read the plan | By hand | |
| FUND-05 | The owner stops sharing the plan | The card leaves discover and the funder loses access | By hand | |
| FUND-06 | A funder waiting for approval opens discover or sends interest | Sent to "waiting for approval"; the API refuses (403) | `security.spec.js` | |
| FUND-07 | Filter discover by sector and emirate | Only matching plans are listed | By hand | |
| FUND-08 | A funder edits their profile | Saved and shown to plan owners | By hand | |

## Administration (ADM)

| ID | Test case | Expected result | Checked by | Result |
| --- | --- | --- | --- | --- |
| ADM-01 | Approve and reject waiting accounts | Approved can use the app; rejected cannot | `community.spec.js`, by hand | |
| ADM-02 | Suspend an active user, then reactivate them | Suspended at once; can sign in again after reactivation | By hand | |
| ADM-03 | Add an official source and a fee reference | New roadmaps in that emirate show the fee as OFFICIAL | By hand | |
| ADM-04 | Hide a post, then show it again | Gone from the public posts while hidden | By hand | |
| ADM-05 | Hide a shared plan | Leaves discover; a funder with access loses it | By hand | |
| ADM-06 | Open the AI usage page | Shows today's roadmaps and chat messages | By hand | |

## Every page (X)

| ID | Test case | Expected result | Checked by | Result |
| --- | --- | --- | --- | --- |
| X-01 | Open every page as a visitor, entrepreneur, mentor, funder, waiting mentor and administrator | Every page loads | `pages.spec.js` | |
| X-02 | Accessibility check (axe, WCAG 2.1 A and AA) on every page | No problems | `pages.spec.js` and the other specs | |
| X-03 | Watch for JavaScript and server errors in every test | None | `fixtures.js`, in every spec | |
| X-04 | Phone screens | No page scrolls sideways | `pages.spec.js` | |
| X-05 | Keyboard only | Every flow tested works without a mouse | `keyboard.spec.js` | |
| X-06 | Speed (Lighthouse, phone, slow 4G) | Score 90 or more on the main pages | Measured by hand | |

## Unit and database tests

`npm test` runs 50 tests without a browser: budget and progress sums, the UAE day for the daily limits, the form rules, who may read a plan (every role and every request state), the daily limits with 10 requests at the same moment, which fees the planner marks official or demo, and which sources the chat links.
