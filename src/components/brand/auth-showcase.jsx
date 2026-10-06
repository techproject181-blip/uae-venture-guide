import Link from "next/link";
import { Check } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/logo";

// Three steps of an example plan; the first two are ticked off one after another.
const STEPS = [
  { number: "1.1", title: "Reserve your trade name", fee: "AED 620" },
  { number: "1.2", title: "Get initial approval", fee: "AED 120" },
  { number: "2.1", title: "Rent a place and register the lease", fee: "Estimate" },
];

/** The emerald side of the sign-in and sign-up pages: the promise of the app, with a small plan that ticks itself off. */
export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-brand-deep text-on-brand lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* A soft glow and a faint grid, behind everything. */}
      <div aria-hidden="true" className="absolute -top-40 -right-40 size-144 rounded-full bg-brand-400/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-48 -left-32 size-120 rounded-full bg-brand-300/10 blur-3xl" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(var(--on-brand)_1px,transparent_1px),linear-gradient(90deg,var(--on-brand)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <Link
        href="/"
        className="relative flex w-fit items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-on-brand/50"
      >
        <LogoMark className="ring-1 ring-on-brand/20 rounded-[9px]" />
        <Wordmark className="text-on-brand [&>span]:text-brand-300" />
      </Link>

      <div className="relative">
        <p className="font-display text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] xl:text-5xl">
          Your UAE business,
          <br />
          one clear step at a time.
        </p>
        <p className="mt-4 max-w-md text-lg text-brand-100/80">
          Licence, visas, bank and tax: every step with its cost, in the order you take them.
        </p>

        <div
          aria-hidden="true"
          className="float-slow mt-10 max-w-md rounded-2xl border border-on-brand/15 bg-on-brand/[0.07] p-2 shadow-2xl backdrop-blur-md"
        >
          <ol className="divide-y divide-on-brand/10">
            {STEPS.map((step, index) => (
              <li key={step.number} className="flex items-center gap-3 px-3 py-3">
                <span
                  className={`tick-in flex size-6 shrink-0 items-center justify-center rounded-full border border-on-brand/30 ${index < 2 ? "tick-in-done" : ""}`}
                  style={{ animationDelay: `${0.6 + index * 0.5}s` }}
                >
                  {index < 2 && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="w-7 text-sm text-brand-100/60 tabular-nums">{step.number}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{step.title}</span>
                <span className="text-sm text-brand-100/70 tabular-nums">{step.fee}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
