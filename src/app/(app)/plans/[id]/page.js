import Link from "next/link";
import { notFound } from "next/navigation";
import { Fields, Section } from "@/components/document";
import { AdviceNotice, Cost } from "@/components/plans/plan-bits";
import { PlanActions } from "@/components/plans/plan-actions";
import { firstYearTotal, remainingBudget } from "@/lib/budget";
import { JURISDICTIONS, JURISDICTION_PREFERENCES, labelOf } from "@/lib/constants";
import { formatAed, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const metadata = { title: "Plan overview" };

const linkClass = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

export default async function PlanOverviewPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();
  const { plan, isOwner } = found;

  const settings = isOwner && (
    <Section title="Plan settings" description="New version builds a fresh roadmap from the same answers and keeps this one.">
      <div className="flex flex-wrap gap-3">
        <PlanActions planId={plan._id} />
      </div>
    </Section>
  );

  if (plan.status === "failed") {
    return (
      <div className="space-y-10">
        <Section title="The roadmap could not be made" className="border-t-0 pt-0">
          <p>{plan.failureReason}</p>
        </Section>
        {settings}
      </div>
    );
  }

  // Steps are numbered by phase, 1.1, 1.2…, the same as on the Steps page.
  const phases = plan.phases.map((phase, index) => ({
    ...phase,
    number: index + 1,
    tasks: plan.tasks.filter((task) => task.phaseId === phase._id),
  }));
  const numbered = phases.flatMap((phase) => phase.tasks.map((task, index) => ({ ...task, number: `${phase.number}.${index + 1}` })));
  const next = numbered.find((task) => task.status !== "done");

  const total = firstYearTotal(plan.budgetItems);
  const remaining = remainingBudget(plan.budgetAed, plan.budgetItems);

  return (
    <div className="space-y-10">
      {numbered.length > 0 && (
        <section aria-labelledby="next-step" className="rounded-xl border border-primary/15 bg-accent px-5 py-5 sm:px-6">
          <h2 id="next-step" className="text-xl">
            Next step
          </h2>
          {next ? (
            <>
              <p className="mt-3 flex gap-3 text-lg font-medium">
                <span className="shrink-0 text-muted-foreground tabular-nums">{next.number}</span>
                <span>{next.title}</span>
              </p>
              <Cost min={next.costMinAed} max={next.costMaxAed} basis={next.costBasis} className="mt-2" />
            </>
          ) : (
            <p className="mt-3 text-lg font-medium">Every step is done.</p>
          )}
          <p className="mt-4">
            <Link href={`/plans/${plan._id}/tasks`} className={linkClass}>
              See all steps
            </Link>
          </p>
        </section>
      )}

      <Section title="Money" className={cn(numbered.length === 0 && "border-t-0 pt-0")}>
        <Fields
          items={[
            { label: "First-year estimate", value: formatAed(total) },
            { label: "Your budget", value: formatAed(plan.budgetAed) },
            {
              label: "Against budget",
              value: remaining < 0 ? <span className="text-destructive">{formatAed(-remaining)} over</span> : `${formatAed(remaining)} left`,
            },
          ]}
        />
      </Section>

      {plan.recommendedJurisdiction && (
        <Section title="Licence">
          <Fields
            items={[
              { label: "Recommended", value: labelOf(JURISDICTIONS, plan.recommendedJurisdiction) },
              { label: "Your answer", value: labelOf(JURISDICTION_PREFERENCES, plan.jurisdictionPref) },
            ]}
          />
          <p className="mt-4 max-w-2xl leading-relaxed">{plan.jurisdictionReason}</p>
        </Section>
      )}

      {phases.length > 0 && (
        <Section title="Roadmap" description={plan.summary}>
          <ol className="max-w-2xl divide-y border-y">
            {phases.map((phase) => {
              const done = phase.tasks.filter((task) => task.status === "done").length;
              const complete = phase.tasks.length > 0 && done === phase.tasks.length;
              return (
                <li key={phase._id} className="flex items-baseline gap-4 py-3">
                  <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{phase.number}</span>
                  <span className="min-w-0 flex-1 font-medium">{phase.title}</span>
                  <span className={cn("shrink-0 text-sm tabular-nums", complete ? "font-medium text-done" : "text-muted-foreground")}>
                    {done} of {phase.tasks.length} done
                  </span>
                </li>
              );
            })}
          </ol>
          {plan.generatedAt && (
            <p className="mt-4 text-sm text-muted-foreground">
              Made {formatDate(plan.generatedAt)} by the built-in planner from the official fee references. The AI service is not
              connected yet.
            </p>
          )}
        </Section>
      )}

      <Section title="The idea">
        <p className="max-w-2xl leading-relaxed whitespace-pre-line">{plan.idea}</p>
        <Fields
          className="mt-5"
          items={[
            { label: "Customers", value: plan.targetCustomers },
            { label: "Team", value: plan.teamSize === 1 ? "Just you" : `${plan.teamSize} people` },
          ]}
        />
      </Section>

      <div className="space-y-4 border-t pt-6">
        <p>
          <Link href={`/plans/${plan._id}/sources`} className={linkClass}>
            Official sources for this plan
          </Link>
        </p>
        <AdviceNotice />
      </div>

      {settings}
    </div>
  );
}
