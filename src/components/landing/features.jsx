import { Bot, Check, FileCheck2, Landmark, ListChecks, Users, Wallet } from "lucide-react";
import { Stamp } from "@/components/stamp";
import { cn } from "@/lib/utils";

/** One card of the feature grid: an icon, a title, a line of text and a small picture of the feature. */
function Feature({ icon: Icon, title, text, className, children }) {
  return (
    <li className={cn("reveal group panel panel-link flex flex-col overflow-hidden", className)}>
      <div className="p-6 sm:p-7">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-lg font-semibold">{title}</h3>
        <p className="mt-1.5 text-muted-foreground">{text}</p>
      </div>
      <div aria-hidden="true" className="mt-auto px-6 pb-6 sm:px-7 sm:pb-7">
        {children}
      </div>
    </li>
  );
}

/** What the app does, as six cards in a zigzag (wide, narrow / narrow, wide / wide, narrow). Each shows a small picture of the real feature. */
export function Features() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <Feature icon={ListChecks} title="A roadmap in the right order" text="Licence, visas, bank and tax, as numbered steps you tick off." className="lg:col-span-2">
        <ol className="grid gap-2 sm:grid-cols-3">
          {["Choose your licence", "Reserve the trade name", "Open a bank account"].map((step, index) => (
            <li key={step} className="flex items-center gap-2.5 rounded-lg border bg-ink-50/70 px-3 py-2.5 text-sm">
              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", index < 2 ? "border-primary bg-primary text-primary-foreground" : "border-ink-300 bg-card")}>
                {index < 2 && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="truncate">{step}</span>
            </li>
          ))}
        </ol>
      </Feature>

      <Feature icon={Landmark} title="Fees you can check" text="Every fee says where it comes from: an official page, demo data or our estimate.">
        <div className="flex flex-wrap items-center gap-2">
          <Stamp tone="official">Official</Stamp>
          <Stamp tone="quiet">Demo fee</Stamp>
          <span className="text-xs text-muted-foreground">Estimate</span>
        </div>
      </Feature>

      <Feature icon={FileCheck2} title="Documents, ticked off" text="The papers each step needs, so nothing is missing at the counter.">
        <ul className="space-y-1.5 text-sm">
          {["Passport copy", "Tenancy contract (Ejari)", "Initial approval"].map((doc, index) => (
            <li key={doc} className="flex items-center gap-2">
              <Check className={cn("size-4", index < 2 ? "text-primary" : "text-ink-300")} strokeWidth={3} />
              <span className={index < 2 ? "" : "text-muted-foreground"}>{doc}</span>
            </li>
          ))}
        </ul>
      </Feature>

      <Feature icon={Wallet} title="A budget that adds up" text="Your first-year costs by category, with what you actually paid beside each estimate." className="lg:col-span-2">
        <div className="space-y-2">
          {[
            ["Licensing", 72, 60],
            ["Office", 90, 0],
            ["Visas", 45, 40],
          ].map(([label, estimated, paid]) => (
            <div key={label} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-muted-foreground">{label}</span>
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <span className="bar-grow absolute inset-y-0 left-0 origin-left rounded-full bg-brand-300" style={{ width: `${estimated}%` }} />
                <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${paid}%` }} />
              </span>
            </div>
          ))}
        </div>
      </Feature>

      <Feature icon={Bot} title="Ask about your plan" text="Questions about your own plan, answered with links to the official sources." className="lg:col-span-2">
        <div className="space-y-2 text-sm">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-primary-foreground">Which documents do I need?</p>
          <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border bg-card px-3.5 py-2">You still need your tenancy contract…</p>
        </div>
      </Feature>

      <Feature icon={Users} title="Mentors and funders" text="Ask a checked mentor for guidance, and share a summary with funders when you are ready.">
        <div className="flex items-center">
          {["FA", "OS", "DO", "LH"].map((initials, index) => (
            <span
              key={initials}
              className={cn("-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-card text-xs font-bold first:ml-0", index % 2 ? "bg-gold-100 text-gold-800" : "bg-accent text-accent-foreground")}
            >
              {initials}
            </span>
          ))}
          <span className="ml-3 text-sm text-muted-foreground">approved by an administrator</span>
        </div>
      </Feature>
    </ul>
  );
}
