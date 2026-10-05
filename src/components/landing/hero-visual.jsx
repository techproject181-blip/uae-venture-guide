import { Check, MessageCircle, Wallet } from "lucide-react";
import { Stamp } from "@/components/stamp";

// An example plan, drawn like the plan page. The official fees match the demo
// fee references for mainland Dubai; the rest are estimates.
const STEPS = [
  { number: "1.1", title: "Reserve your trade name", fee: "AED 620", basis: "official", done: true },
  { number: "1.2", title: "Get initial approval", fee: "AED 120", basis: "official", done: true },
  { number: "2.1", title: "Rent a place and register the lease", fee: "AED 15,000–40,000", basis: "estimate" },
  { number: "2.2", title: "Pay for your trade licence", fee: "AED 12,000–18,000", basis: "official" },
];

/** The picture beside the home page headline: an example plan in an app window, with two cards floating around it. */
export function HeroVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div aria-hidden="true" className="absolute -inset-x-6 -inset-y-10 -z-10 rounded-[3rem] bg-gradient-to-br from-emerald-200/60 via-teal-100/40 to-amber-100/50 blur-2xl" />

      <div className="hero-window overflow-hidden rounded-2xl border bg-card shadow-[0_24px_60px_-12px_rgb(15_23_42/0.18)]">
        {/* Window bar */}
        <div aria-hidden="true" className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">My plans / Specialty café</span>
        </div>

        <div className="p-5 sm:p-6 sm:pb-20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-xl font-bold tracking-[-0.02em]">Specialty café</p>
              <p className="mt-1 text-sm text-muted-foreground">Dubai · Mainland · Food and drink</p>
            </div>
            <Stamp tone="quiet">Example</Stamp>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">2 of 15 steps done</span>
              <span className="font-medium tabular-nums">13%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="progress-fill h-full w-[13%] rounded-full bg-primary" />
            </div>
          </div>

          <ol className="mt-5 divide-y rounded-xl border">
            {STEPS.map((step, index) => (
              <li key={step.number} className="flex items-start gap-3 px-4 py-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${step.done ? "hero-tick border-primary bg-primary text-white" : "border-slate-300"}`}
                  style={step.done ? { animationDelay: `${0.5 + index * 0.45}s` } : undefined}
                >
                  {step.done && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="w-7 shrink-0 text-sm text-muted-foreground tabular-nums">{step.number}</span>
                <span className="min-w-0 flex-1 text-sm font-medium">{step.title}</span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm font-medium whitespace-nowrap tabular-nums">{step.fee}</span>
                  {step.basis === "official" ? (
                    <Stamp tone="official">Official</Stamp>
                  ) : (
                    <span className="text-xs text-muted-foreground">Estimate</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Floating cards */}
      <div aria-hidden="true" className="float-slow absolute -bottom-8 -left-4 hidden w-52 rounded-xl border bg-card p-3.5 shadow-lg sm:block lg:-left-10">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Wallet className="size-3.5 text-primary" />
          First-year budget
        </div>
        <p className="mt-1.5 font-display text-lg font-bold tabular-nums">AED 60,000</p>
        <div className="mt-2 flex h-10 items-end gap-1.5">
          {[60, 85, 40, 70, 30, 55].map((height, index) => (
            <span key={index} className="bar-grow flex-1 rounded-t-sm bg-emerald-400/80" style={{ height: `${height}%`, animationDelay: `${0.4 + index * 0.08}s` }} />
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="float-slow absolute -top-7 -right-4 hidden items-center gap-3 rounded-xl border bg-card p-3.5 pr-5 shadow-lg sm:flex lg:-right-8"
        style={{ animationDelay: "-3s" }}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">OS</span>
        <span>
          <span className="block text-sm font-medium">Omar accepted your request</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="size-3" />
            Mentor · Food and drink
          </span>
        </span>
      </div>

      {/* The FAQ on the home page explains the Official mark in full. */}
      <figcaption className="sr-only">
        An example plan for a specialty café in Dubai. In a real plan, Official means the fee was checked against a government or free zone page.
      </figcaption>
    </figure>
  );
}
