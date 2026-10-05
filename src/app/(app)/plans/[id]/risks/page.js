import { notFound } from "next/navigation";
import { ListPanel, Panel, Split } from "@/components/layout";
import { AdviceNotice, FactRows, LevelBadge } from "@/components/plans/plan-bits";
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

  const isHigh = (risk) => risk.likelihood === "high" || risk.impact === "high";
  const aside = (
    <>
      <Panel title="How they are ranked" flush>
        <p className="px-5 pt-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pt-6">
          Each risk is rated low, medium or high for how likely it is and how much harm it would do. The two together set the order.
        </p>
        <div className="mt-4 border-t">
          <FactRows
            rows={[
              { label: "Risks in this plan", value: risks.length },
              { label: "Rated high on either", value: risks.filter(isHigh).length },
            ]}
          />
        </div>
      </Panel>
      <AdviceNotice />
    </>
  );

  return (
    <Split aside={aside}>
      <ListPanel title="Risks" description="What could go wrong, most serious first, and what to do about it.">
        {risks.map((risk) => (
          <li key={risk._id} className="px-5 py-5 sm:px-6">
            <h3 className="leading-snug font-semibold">{risk.title}</h3>
            <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
              <LevelBadge label="Likelihood" level={risk.likelihood} />
              <LevelBadge label="Impact" level={risk.impact} />
            </p>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{risk.description}</p>
            <p className="mt-3 max-w-3xl rounded-lg bg-accent/60 px-4 py-3 leading-relaxed">
              <span className="font-medium">What to do: </span>
              {risk.mitigation}
            </p>
          </li>
        ))}
      </ListPanel>
    </Split>
  );
}
