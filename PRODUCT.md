# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Student founders and first-time founders in the UAE** who have an idea and do not know the steps, fees or documents to start a business. Often in a hurry, often on a phone.
- **Examiners** at the BSIT capstone defense, who watch a demo on a laptop or projector and must understand each screen quickly. The owner confirmed both groups matter equally.
- Supporting roles: **mentors** (answer guidance requests, write experience posts), **funders** (browse shared plans, send interest) and one **administrator** (approves accounts, keeps official sources and fees, hides content).

## Product Purpose

Turn a business idea into a step-by-step UAE startup plan: a roadmap (licence, visas, bank, tax, launch), first-year costs, documents and risks, grounded in official sources. Then a workspace to track tasks and budget, ask questions about the plan, get help from mentors and share the plan with funders. Success: a first-time founder knows the next step and roughly what it costs, and an examiner can follow every screen.

## Positioning

Costs marked "official" come only from fee references an administrator checked against government and free zone pages; everything else is labelled an estimate. Plans stay private: mentors and funders see a plan only after its owner accepts them.

## Operating Context

- A BSIT undergraduate capstone. The team must be able to build, explain and defend every part.
- Demo accounts for every role (password in the README) are used in demos and testing.
- Real-user testing with about five students needs ethical approval first.

## Capabilities and Constraints

- Roles: entrepreneur, mentor, funder, administrator. Mentors and funders wait for approval.
- Features: plan intake and roadmap, tasks, budget with charts, documents checklist, risks, sources, chat about the plan, PDF report, mentor directory and requests, experience posts, funder pitch cards and interest, admin pages. The owner confirmed every feature stays; screens get simpler.
- The roadmap planner and chat run in a built-in sample mode until an AI provider is chosen; every answer says so.
- English only for now; Arabic may come later.
- Stack: Next.js 16 with JavaScript, Tailwind CSS v4, shadcn/ui, MongoDB with Mongoose.

## Brand Commitments

- Name: UAE Venture Guide.
- Voice: plain, short, simple words; guidance, never legal or financial advice.
- The owner's binding direction: it must not look like an AI tool (no purple or violet, no AI-product look), it should feel made by people, and it must stay simple and easy, not complex.

## Evidence on Hand

- Demo data from `npm run seed:demo`: 10 accounts, 13 real official sources with demo summaries and demo fee amounts, 4 plans, 3 mentor posts.
- No real users, testimonials, press or usage numbers exist. Do not invent any.

## Product Principles

1. The next step is always obvious: what to do now, what it costs, where to check it.
2. Official versus estimate is never ambiguous.
3. Every screen can be explained in one sentence at the defense.
4. Fewer things per screen beats more features in view.
5. Private by default: the owner decides who sees a plan.

## Accessibility & Inclusion

WCAG 2.1 AA: axe-clean pages, full keyboard use, visible focus, 44 px touch targets, and reduced motion respected. Works on phones and laptops.
