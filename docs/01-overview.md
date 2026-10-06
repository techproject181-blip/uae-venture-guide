# Overview

## What the app is

UAE Venture Guide is a website that helps students and first-time founders plan a small business in the UAE.

The user types in their idea, the emirate, their budget and their customers. The site then makes a step-by-step plan, called a roadmap. The plan shows the steps, the costs in AED, the documents needed and the risks.

## The problem it solves

Starting a business in the UAE has many steps. The rules and fees are spread over many government and free-zone websites. A first-time founder does not know where to start or how much it will cost.

This app puts the steps, the costs and the official links in one place. It also connects founders with mentors who can give advice and funders who may invest.

## The four roles

| Role | What they can do |
| --- | --- |
| Entrepreneur | Make plans, edit the budget, tick off tasks, ask the chat assistant about a plan, ask a mentor for guidance, share a plan with funders, download a PDF report. |
| Mentor | Fill in a profile, accept or decline guidance requests, message the entrepreneur after accepting, write posts about their experience. |
| Funder | Browse shared plans as short pitch cards, send an interest request, read the full plan and message the owner on the website after the owner accepts. |
| Admin | Approve or suspend users, hide posts and shared plans, manage official sources and fees, see chat assistant usage. |

Entrepreneurs can use the site right after sign-up. Mentors and funders wait until an admin approves them. The admin account is made with a script (`npm run create-admin`), not through sign-up.

## Main features

- **Roadmap planner.** Makes phases, tasks, costs, a document list and risks from the user's answers.
- **Budget.** Cost lines by category, one-time and yearly costs, first-year total, money left, and charts.
- **Progress.** Each task is to do, in progress or done. The plan shows a percentage done.
- **Documents.** A checklist of papers the user needs, such as passport copies and a lease.
- **Chat assistant (sample mode).** Answers questions about one plan, using the plan and the official sources. It shows which sources it used.
- **Mentors.** A mentor list. An entrepreneur sends a request. When the mentor accepts, a conversation opens on the site. Messages are saved in the database.
- **Funders.** Owners can choose to share a plan. Funders see a pitch card and can send interest. There is no chat with funders.
- **Posts.** Mentors write experience posts with up to five pictures (by web address) and one simple chart.
- **Official sources and fees.** A list of government and free-zone links. Each cost has a mark:
  - **Official**: the fee comes from a source an admin checked.
  - **Demo**: sample data that has not been checked.
  - **Estimate**: a guess, not backed by a fee reference.
- **PDF report.** A download of the whole plan: summary, tasks, budget, documents, risks, sources and a disclaimer.
- **Admin console.** Users, posts, sources, fees and usage in one area.

## What it does NOT do

- It is **not a government service**. It does not register a company. Every plan links to the real authority.
- It takes **no payments**. No subscriptions, no investments through the site.
- The **AI provider is not chosen yet**. So the roadmap and the chat run in **sample mode**: they use fixed rules and text search, not a language model. Only two files would change when a provider is added.
- No chat between entrepreneurs, or between funders and owners.
- English only. No mobile app; the website works on phones.
