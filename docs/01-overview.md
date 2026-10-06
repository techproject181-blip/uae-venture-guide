# Overview

UAE Venture Guide helps first-time founders plan a small business in the UAE. The user enters their idea, emirate, budget and customers. The app makes a roadmap: steps, costs in AED, documents and risks.

The problem: the rules and fees are spread over many government and free-zone sites, so a new founder doesn't know the order or the total cost. The app puts it in one place, with links to the official pages, and connects founders with mentors and funders.

## The four roles

- **Entrepreneur**: makes plans, edits the budget, ticks off tasks, asks the plan assistant, asks a mentor for help, shares a plan with funders, downloads a PDF.
- **Mentor**: fills in a profile, accepts or declines requests, messages the entrepreneur after accepting, writes posts.
- **Funder**: browses shared plans as pitch cards, sends interest, and after the owner accepts can read the full plan and message the owner.
- **Admin**: approves or suspends users, hides posts and shared plans, manages sources and fees, sees assistant usage.

Entrepreneurs can use the site straight after sign-up. Mentors and funders wait for admin approval. The admin is made with `npm run create-admin`, not sign-up.

## Main features

- Roadmap with phases, tasks, costs, documents and risks
- Budget with one-time and yearly costs, first-year total and charts
- Task progress (to do, in progress, done) and a percentage
- Plan assistant that answers from the plan and official sources
- Mentor and funder conversations on the site
- Mentor posts (up to five pictures by URL and one chart)
- PDF report of the whole plan
- Admin console

Each cost has a mark. **Official** means the fee comes from a source an admin checked. **Demo** is unchecked sample data. **Estimate** is a guess with no fee reference.

## What it doesn't do

- It's not a government service and doesn't register companies.
- No payments.
- No AI provider is connected yet, so the roadmap and assistant run in sample mode (fixed rules and text search). Only two files would change to add one.
- No chat between two entrepreneurs. English only. No mobile app, but the site works on phones.
