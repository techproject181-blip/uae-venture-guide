import { notFound } from "next/navigation";
import { Section } from "@/components/document";
import { AdviceNotice, LevelBadge } from "@/components/plans/plan-bits";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";

export const metadata = { title: "Risks" };

const WEIGHT = { low: 1, medium: 2, high: 3 };

export default async function PlanRisksPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();

  // Most serious first: likelihood times impact, as in the project's own risk table.
  const risks = [...found.plan.risks].sort(
    (a, b) => WEIGHT[b.likelihood] * WEIGHT[b.impact] - WEIGHT[a.likelihood] * WEIGHT[a.impact],
  );

  return (
    <div className="max-w-3xl space-y-10">
      <Section title="Risks" description="What could go wrong, most serious first, and what to do about it." >
        <ul className="divide-y border-y">
          {risks.map((risk) => (
            <li key={risk._id} className="py-5">
              <h3 className="text-lg">{risk.title}</h3>
              <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                <LevelBadge label="Likelihood" level={risk.likelihood} />
                <LevelBadge label="Impact" level={risk.impact} />
              </p>
              <p className="mt-3 leading-relaxed text-muted-foreground">{risk.description}</p>
              <p className="mt-2 leading-relaxed">
                <span className="font-medium">What to do: </span>
                {risk.mitigation}
              </p>
            </li>
          ))}
        </ul>
      </Section>
      <AdviceNotice />
    </div>
  );
}
