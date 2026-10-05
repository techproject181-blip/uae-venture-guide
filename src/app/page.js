import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Features } from "@/components/landing/features";
import { HeroVisual } from "@/components/landing/hero-visual";
import { RoleTabs } from "@/components/landing/role-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { EMIRATES } from "@/lib/constants";

// The three steps, in the order a founder takes them.
const STEPS = [
  { title: "Describe your idea", text: "What the business is, which emirate it is in, your budget and the size of your team." },
  { title: "Get your steps and costs", text: "Licence, visa, bank and tax steps, each with its fee and the documents you need." },
  { title: "Track it and get help", text: "Tick off steps, keep your budget up to date, ask about your plan and talk to a mentor." },
];

const QUESTIONS = [
  {
    q: "Is this a government service?",
    a: "No. UAE Venture Guide is a student project that helps you plan. It links to the official pages, and those pages are where you apply and pay.",
  },
  {
    q: "How do I know a fee is right?",
    a: "Each fee shows where it comes from. Official means an administrator checked it against a government or free zone page, and the page is linked. Demo fees and estimates are labelled as such. Always check the official page before you pay.",
  },
  { q: "Does it cost anything?", a: "No. Creating an account and making plans is free. Each account can make five new roadmaps and ask 40 questions a day." },
  {
    q: "Who are the mentors?",
    a: "People with experience of starting businesses in the UAE. An administrator approves every mentor before they appear. Once a mentor accepts your request, you talk with them in a conversation on the website.",
  },
  {
    q: "Who can see my plan?",
    a: "Only you. A mentor can read it while they are guiding you, and a funder only after you accept their interest. You can stop sharing at any time.",
  },
];

const linkClass = "font-medium text-foreground underline decoration-primary underline-offset-4 hover:decoration-2";

/** A section heading, centred, with a short line under it. */
function SectionIntro({ id, title, text }) {
  return (
    <div className="reveal mx-auto mb-12 max-w-2xl text-center lg:mb-16">
      <h2 id={id} className="font-display text-[2rem] leading-tight font-bold tracking-[-0.03em] sm:text-[2.5rem]">
        {title}
      </h2>
      {text && <p className="mt-3 text-lg text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,rgb(15_23_42/0.07)_1px,transparent_0)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div className="page-width grid items-center gap-16 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-24 xl:gap-20">
            <div className="intro text-center lg:text-left">
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium shadow-xs lg:mx-0">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                For students and first-time founders
              </p>
              <h1 className="mt-6 text-[2.5rem] leading-[1.02] tracking-[-0.04em] sm:text-6xl xl:text-7xl">
                Plan your UAE startup, <span className="text-primary">step by step.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                Describe your business idea and get a roadmap: every step to start it in the UAE, what each step costs, and where to check it.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "group h-12 px-6 text-base" })}>
                  Create a free account
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link href="/sign-in" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-6 text-base" })}>
                  Sign in
                </Link>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* Emirates strip */}
        <section aria-label="Emirates covered" className="border-y bg-card py-6">
          <p className="page-width mb-4 text-center text-sm text-muted-foreground">Roadmaps for all seven emirates, mainland and free zones</p>
          <div className="marquee-frame relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <ul className="marquee flex w-max gap-4">
              {[...EMIRATES, ...EMIRATES, ...EMIRATES, ...EMIRATES].map((emirate, index) => (
                <li
                  key={`${emirate.value}-${index}`}
                  aria-hidden={index >= EMIRATES.length ? "true" : undefined}
                  className="font-display text-xl font-bold tracking-[-0.02em] whitespace-nowrap text-slate-400 after:ml-4 after:text-emerald-400 after:content-['•']"
                >
                  {emirate.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-title" className="page-width py-20 sm:py-28">
          <SectionIntro id="features-title" title="Everything a first business needs, in one place" text="One plan holds your steps, costs, documents and questions, so you always know what comes next." />
          <Features />
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="border-y bg-card py-20 sm:py-28">
          <div className="page-width">
            <SectionIntro id="how-title" title="How it works" text="Three steps from idea to a plan you can follow." />
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              <span aria-hidden="true" className="absolute top-6 right-[16%] left-[16%] hidden h-px border-t-2 border-dashed border-slate-200 md:block" />
              {STEPS.map(({ title, text }, index) => (
                <li key={title} className="reveal relative text-center">
                  <span className="relative mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold text-white shadow-[0_8px_20px_-6px_rgb(4_120_87/0.6)]">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who it is for */}
        <section aria-labelledby="roles-title" className="page-width py-20 sm:py-28">
          <SectionIntro id="roles-title" title="Made for founders, mentors and funders" text="Mentors and funders are approved by an administrator first." />
          <RoleTabs />
        </section>

        {/* Questions */}
        <section aria-labelledby="faq-title" className="border-t bg-card py-20 sm:py-28">
          <div className="page-width">
            <SectionIntro id="faq-title" title="Questions" />
            <div className="mx-auto max-w-3xl divide-y rounded-2xl border">
              {QUESTIONS.map(({ q, a }) => (
                <details key={q} className="group px-5 sm:px-6">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="pb-5 text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-center text-muted-foreground">
              See what mentors share in their{" "}
              <Link href="/posts" className={linkClass}>
                experience posts
              </Link>
              , or browse the{" "}
              <Link href="/sources" className={linkClass}>
                official sources
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="page-width pb-20 sm:pb-28">
          <div className="reveal relative overflow-hidden rounded-3xl bg-[#053d30] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute -top-24 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl" />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
            />
            <h2 className="relative mx-auto max-w-2xl font-display text-[2rem] leading-tight font-bold tracking-[-0.03em] sm:text-5xl">Your roadmap is a few questions away.</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg text-emerald-100/80">Free to use. Mentor or funder? Choose your role when you sign up.</p>
            <Link
              href="/sign-up"
              className={buttonVariants({ size: "lg", variant: "outline", className: "group relative mt-8 h-12 border-white bg-white px-6 text-base text-[#053d30] hover:border-white hover:bg-emerald-50" })}
            >
              Create a free account
              <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
