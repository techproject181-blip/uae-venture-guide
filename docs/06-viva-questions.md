# Viva Questions and Answers

Short answers to say out loud. Each one matches the code. File paths show where to point.

## The idea

**1. What problem does the app solve?**
Starting a business in the UAE means many steps, many authorities and fees spread over many websites. A first-time founder does not know the order or the total cost. The app asks a few questions and builds one roadmap with steps, documents, costs and links to the official pages.

**2. Who are the users?**
There are four roles: entrepreneur, mentor, funder and admin (see src/models/User.js). Entrepreneurs make plans. Mentors answer requests, funders browse shared plans, and the admin approves mentors and funders and keeps fees and sources up to date.

**3. Why the UAE?**
The UAE has seven emirates and a choice between mainland and many free zones, so the path really changes from person to person. That makes a personalised roadmap useful. It is also a clear, limited scope for a student project.

**4. What is new compared to government portals?**
Government portals explain their own service only. This app joins the steps into one plan for your emirate, sector and team size, adds up a first-year budget, and links each cost to its source. It also adds mentors, funders and a plan assistant in one place.

## Technology choices

**5. Why Next.js?**
One project holds both the pages and the API (src/app and src/app/api), so there is no separate backend server. Server components can read the database directly. It also deploys easily to Vercel.

**6. Why JavaScript and not TypeScript?**
JavaScript was the language I know best, so I could spend my time on features. I check data at the edges with Zod schemas (src/lib/schemas), which catches bad input at runtime, where TypeScript would not help anyway. The honest cost is fewer checks while writing code.

**7. Why MongoDB and Mongoose?**
A plan is one document with nested phases, tasks and budget items, which fits a document database well (see src/models/Plan.js). Mongoose gives schemas, validation and indexes on top. MongoDB Atlas has a free tier for hosting.

**8. Why your own auth instead of a library like NextAuth?**
I only need email and password with four roles, so the code is small: bcrypt for passwords and a signed JWT in a cookie (src/lib/jwt.js, src/lib/session.js). Writing it myself means I can explain every line. The downside is that I am responsible for its security, so I kept it simple and tested it.

**9. Why Tailwind CSS?**
Styles sit next to the markup, so I do not manage many CSS files. It works well with shadcn/ui components, which are copied into the project and can be changed. Colours are kept in one place as theme tokens.

## How it works

**10. Describe the flow of a request.**
First src/proxy.js runs and checks the session cookie; if a private page has no valid token it redirects to sign-in. Then the page or API route loads the user from the database and checks role and status (src/lib/guards.js, src/lib/api.js). Input is checked with Zod, then Mongoose reads or writes MongoDB, and the result is sent back.

**11. How is the roadmap generated?**
src/lib/roadmap/generate.js uses rules, not AI. It picks mainland or free zone from the sector and the user's choice, takes steps from templates (src/lib/roadmap/templates.js), adds team and sector steps, and fills costs from the fee references for that emirate. It returns the same shape an AI planner would, so an AI can be plugged in later.

**12. How do costs get the Official, Demo or Estimate mark?**
In costFor() in generate.js: if an admin-entered fee reference matches the step, its amount is used and marked "reference" (shown as Official). If that fee came from seed data that nobody checked, it is marked "demo". If no fee exists, the template range is used and marked "estimate".

**13. How does the chat assistant work?**
src/lib/chat/answer.js finds topics in the question by keywords, like cost, visa or documents, and answers from the user's own plan. It searches the official sources with a MongoDB text index and shows them as links. If nothing matches, it says the plan does not cover it and names the licensing authority.

**14. Why is it called "sample mode"?**
No AI provider is connected yet, so this built-in assistant stands in for it. Every answer says it is a sample answer and asks the user to check the official source. This is honest, and the app works without any paid API.

**15. How does mentor chat work?**
An entrepreneur sends a request to a mentor, and once accepted they talk in a saved thread stored in the RequestMessage collection. The page asks the server for new messages every 4 seconds (POLL_EVERY_MS in src/components/requests/conversation.jsx).

**16. Why polling and not WebSockets?**
Vercel's serverless functions do not keep long connections open, so WebSockets would need a separate server or paid service. Polling every 4 seconds is simple and enough for a few messages between two people. The cost is a small delay and extra requests.

**17. How is the PDF report made?**
The route src/app/api/plans/[id]/report/route.js checks the user can read the plan, then renders a React component (src/lib/report/plan-report.jsx) to a PDF with @react-pdf/renderer. The file is created on the server and downloaded.

**18. How are emails sent?**
src/lib/email.js uses Nodemailer over SMTP. Emails go out for password reset, account approval, mentor requests and funder interest. They are only notices: the actual conversations happen on the website. Without SMTP settings, the email is printed in the terminal so the flows still work in development.

## Database

**19. Which collections do you have?**
User, MentorProfile, FunderProfile, Plan, ChatMessage, MentorRequest, RequestMessage, FundingInterest, InterestMessage, Post, FeeReference, Source, AiUsage and LoginAttempt (src/models). Docs are in docs/03-database.md.

**20. How are they related?**
By ObjectId references. A Plan has ownerId to a User; a MentorRequest links an entrepreneur and a mentor; a FundingInterest links a plan and a funder; a FeeReference points to its Source. Phases, tasks and budget items are embedded inside the Plan because they are always read with it.

**21. Why NoSQL and not SQL?**
The plan is naturally a nested document, and reading it in one query is simple. The data does not need complex joins across many tables. SQL would also work; this was a fit and familiarity choice, not a claim that SQL is worse.

**22. Which indexes did you add and why?**
Examples: a unique email on User, a unique (userId, day) on AiUsage for daily limits, a unique (planId, funderId) on FundingInterest to stop duplicates, and a text index on Source for chat search. LoginAttempt and AiUsage use TTL indexes, so MongoDB deletes old records itself.

## Security

**23. How are passwords stored?**
Hashed with bcrypt, cost 10, never in plain text (src/app/api/auth/sign-up/route.js). Sign-in uses bcrypt.compare, and compares against a dummy hash when the email is unknown, so timing does not reveal which emails exist.

**24. How do sessions work?**
On sign-in the server signs a JWT with HS256 using JWT_SECRET, holding the user id and role, valid for 7 days. It is stored in an httpOnly cookie, so page JavaScript cannot read it, Secure in production and SameSite=Lax (src/lib/session.js). The user is loaded again from the database on every request, and a token made before the user's passwordChangedAt is refused, so changing a password signs out other devices. There are no refresh tokens, by design: after 7 days the user signs in again, which keeps the code small.

**25. How are roles checked?**
The proxy only checks the token. Each page and API route loads the user fresh from the database and checks role and status (requireUser in src/lib/guards.js). So if the admin suspends someone, it takes effect on the next request, even with an old token.

**26. Do you have rate limits?**
Yes, two kinds. Five failed sign-ins for one email lock it for 15 minutes (src/models/LoginAttempt.js). Each user can make 5 roadmaps and 40 chat messages a day (src/lib/quota.js), counted in one atomic database call so two parallel requests cannot pass the limit.

**27. How is input validated?**
Every API route checks the body with Zod schemas from src/lib/schemas before touching the database. Mongoose schemas add a second check with types, enums and max lengths.

**28. What about XSS?**
React escapes text by default. Community posts are Markdown, rendered with react-markdown and skipHtml, so raw HTML in a post is dropped (src/components/posts/markdown.jsx). And the session cookie is httpOnly, so a script could not steal it.

**29. What about CSRF?**
The cookie is SameSite=Lax, so the browser does not send it on cross-site POST requests. Changes only happen through POST, PATCH or DELETE, never GET. A CSRF token would be stronger; that is a possible addition.

**30. What about NoSQL injection?**
Zod checks that fields are the expected strings and numbers, so an object like {"$gt": ""} is rejected before a query. Mongoose also casts values to the schema types.

**31. What if the JWT secret leaks?**
Someone could forge a token for any user id, so it is serious. The fix is to change JWT_SECRET, which logs everyone out at once. Because roles and status are read from the database on each request, a forged token cannot give a role the user does not have, but it could act as an existing admin's id, so the secret must stay private.

## Testing

**32. What kinds of tests do you have?**
Unit tests for logic and schemas (src/lib/*.test.js), integration tests against a real MongoDB (tests/integration: access, chat, messages, quota, roadmap), and Playwright end-to-end tests in the browser (tests/e2e: auth, plans, community, security, keyboard, pages). Unit and integration run with Vitest.

**33. How many tests?**
About 60 Vitest test cases in 10 test files (5 unit, 5 integration), plus the Playwright specs. The test plan is in docs/04-testing.md.

**34. Do you have CI?**
Yes. .github/workflows/check.yml runs on every push and pull request: lint, Vitest, production build, seed data, then Playwright on Chrome, Firefox, WebKit and two phone sizes, with its own MongoDB container.

## Limitations and future work

**35. Is there real AI?**
No. The roadmap and chat are rule-based "sample" versions because no AI provider has been chosen yet. The code is shaped so one function can switch to an AI planner later, and the daily quotas are already in place to control AI cost.

**36. Can users pay for anything?**
No. There are no payments. Fees shown are information only, and users pay the authorities directly.

**37. Are the fees always correct?**
Not automatically. An admin must enter and check each fee from its official page, and fees change. Seeded fees are marked Demo until checked, and anything without a fee is only an Estimate.

**38. What other limits are there?**
Mentor and funder chat use polling, not real-time push. The free Atlas tier has no automatic backups, so backups are manual exports (docs/05-setup-and-deploy.md). The app is English only.

**39. What would you add next?**
Connect an AI provider for planning and chat, add Arabic, real-time chat if traffic grows, automatic backups on a paid tier, and alerts when a source page changes.

## Tricky questions

**40. Is this a government service?**
No. It is an independent student project and is not linked to any government. It guides users and always sends them to the official source to act.

**41. What if a fee is wrong and someone loses money?**
The app shows where each fee came from and marks unchecked ones as Demo or Estimate. The chat answers also tell users to check the official source. The admin fixes the fee reference, and new roadmaps use the new amount.

**42. Why should anyone trust a mentor?**
Mentors cannot use the app until an admin approves them; they start as "pending" (src/models/User.js). The admin can suspend them later. Still, approval is a basic check, not a full background check, and users should judge advice themselves.

**43. Your chat bot just matches keywords. Is that really an assistant?**
It is a simple one, and I say so in every answer. It only uses the user's plan and stored official sources, so it does not invent facts. It is a placeholder that shows how a real AI would be grounded.
