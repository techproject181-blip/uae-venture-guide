import Link from "next/link";
import { RoadmapPreview } from "@/components/roadmap-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";

// The three steps, in the order a founder takes them.
const STEPS = [
  {
    title: "Describe your idea",
    text: "Say what the business is, which emirate it is in, your budget and the size of your team.",
  },
  {
    title: "Get your steps and costs",
    text: "Your roadmap lists the licence, visa, bank and tax steps, each with its fee and the documents you need.",
  },
  {
    title: "Track your progress and get help",
    text: "Tick off steps, keep your budget up to date, ask questions about your plan and ask a mentor for guidance.",
  },
];

const linkClass = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="page-width grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 lg:py-20 xl:gap-24">
          <div>
            <h1 className="text-[2.25rem] leading-[1.08] tracking-[-0.025em] sm:text-5xl xl:text-6xl">Plan your UAE startup, step by step.</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Describe your business idea and get a roadmap: every step to start it in the UAE, what each step costs, and
              where to check it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
                Create a free account
              </Link>
              <Link href="/sign-in" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Sign in
              </Link>
            </div>
          </div>
          <RoadmapPreview />
        </div>

        <section aria-labelledby="how-title" className="border-t bg-card">
          <div className="page-width grid gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            <h2 id="how-title" className="text-2xl sm:text-[1.75rem]">
              How it works
            </h2>
            <ol className="divide-y">
              {STEPS.map(({ title, text }, index) => (
                <li key={title} className="flex gap-4 py-5 first:pt-1">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground tabular-nums">{index + 1}</span>
                  <div>
                    <h3 className="text-lg leading-snug">{title}</h3>
                    <p className="mt-1 text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="border-t">
          <p className="page-width py-10">
            Mentor or funder?{" "}
            <Link href="/sign-up" className={linkClass}>
              Create an account
            </Link>{" "}
            and choose your role; an administrator approves it first. See what mentors share in their{" "}
            <Link href="/posts" className={linkClass}>
              experience posts
            </Link>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
