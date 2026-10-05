import { Check } from "lucide-react";
import { Panel, Split } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { IntakeForm } from "@/components/plans/intake-form";
import { requireUser } from "@/lib/guards";
import { DAILY_LIMITS, quotaLeft } from "@/lib/quota";

export const metadata = { title: "New plan" };

// What every new plan comes with, in the order of the plan's tabs.
const YOU_GET = [
  "Steps in five phases, from choosing your activity to launch, each with who you deal with",
  "A recommendation for mainland or free zone, with the reason",
  "A first-year budget, with official fees where they exist",
  "A checklist of the documents to collect",
  "The main risks, and what to do about each",
  "A chat assistant that answers questions about the plan",
  "A PDF of the whole plan to download",
];

export default async function NewPlanPage() {
  const user = await requireUser({ roles: ["entrepreneur"] });
  const left = await quotaLeft(user.id, "generations");

  return (
    <>
      <PageHeader
        back={{ href: "/plans", label: "My plans" }}
        title="Plan a new business"
        description="Answer a few questions. Your roadmap lists every step, who you deal with and what it costs, with official fees where they exist."
      />
      <Split
        aside={
          <>
            <Panel title="What you get">
              <ul className="space-y-3 text-sm">
                {YOU_GET.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Daily limit">
              <p className="font-display text-[1.625rem] leading-none font-bold tracking-[-0.02em] tabular-nums">
                {left} <span className="text-base font-medium text-muted-foreground">of {DAILY_LIMITS.generations} left</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground" role="status">
                You can make {left} more of {DAILY_LIMITS.generations} roadmaps today.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">A new version of an existing plan counts too.</p>
            </Panel>
          </>
        }
      >
        <IntakeForm />
      </Split>
    </>
  );
}
