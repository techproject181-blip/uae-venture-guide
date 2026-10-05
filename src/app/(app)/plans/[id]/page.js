import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Fields } from "@/components/document";
import { Panel, Split } from "@/components/layout";
import { AdviceNotice, Cost, FactRows } from "@/components/plans/plan-bits";
import { PlanActions } from "@/components/plans/plan-actions";
import { buttonVariants } from "@/components/ui/button";
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
    <Panel title="Plan settings" description="New version builds a fresh roadmap from the same answers and keeps this one.">
      <div className="flex flex-wrap gap-3">
        <PlanActions planId={plan._id} />
      </div>
    </Panel>
  );

  if (plan.status === "failed") {
    return (
      <Split aside={settings}>
        <Panel title="The roadmap could not be made">
          <p>{plan.failureReason}</p>
        </Panel>
      </Split>
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

  const aside = (
    <>
      <Panel title="Money" flush actions={<Link href={`/plans/${plan._id}/budget`} className={cn(linkClass, "text-sm")}>Budget</Link>}>
        <FactRows
          rows={[
            { label: "First-year estimate", value: formatAed(total) },
            { label: "Your budget", value: formatAed(plan.budgetAed) },
            {
              label: "Against budget",
              value: remaining < 0 ? <span className="text-destructive">{formatAed(-remaining)} over</span> : `${formatAed(remaining)} left`,
            },
          ]}
        />
      </Panel>

      {plan.recommendedJurisdiction && (
        <Panel title="Licence">
          <Fields
            items={[
              { label: "Recommended", value: labelOf(JURISDICTIONS, plan.recommendedJurisdiction) },
              { label: "Your answer", value: labelOf(JURISDICTION_PREFERENCES, plan.jurisdictionPref) },
            ]}
          />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.jurisdictionReason}</p>
        </Panel>
      )}

      {settings}
    </>
  );

  return (
    <Split aside={aside}>
      {numbered.length > 0 && (
        <Panel
          title="Next step"
          className="border-primary/20"
          actions={
            <Link href={`/plans/${plan._id}/tasks`} className={buttonVariants({ size: "lg" })}>
              See all steps
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        >
          {next ? (
            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent font-display text-sm font-bold text-primary tabular-nums">
                {next.number}
              </span>
              <div className="min-w-0">
                <p className="text-lg leading-snug font-semibold">{next.title}</p>
                {next.description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{next.description}</p>}
                <Cost min={next.costMinAed} max={next.costMaxAed} basis={next.costBasis} className="mt-3" />
              </div>
            </div>
          ) : (
            <p className="text-lg font-medium">Every step is done.</p>
          )}
        </Panel>
      )}

      {phases.length > 0 && (
        <Panel
          title="Roadmap"
          description={plan.summary}
          flush
          actions={
            <Link href={`/plans/${plan._id}/sources`} className={cn(linkClass, "text-sm")}>
              Official sources for this plan
            </Link>
          }
          footer={
            plan.generatedAt && (
              <p className="text-sm text-muted-foreground">
                Made {formatDate(plan.generatedAt)} by the built-in planner from the official fee references. The AI service is not
                connected yet.
              </p>
            )
          }
        >
          <ol className="divide-y">
            {phases.map((phase) => {
              const done = phase.tasks.filter((task) => task.status === "done").length;
              const complete = phase.tasks.length > 0 && done === phase.tasks.length;
              const percent = phase.tasks.length ? Math.round((done / phase.tasks.length) * 100) : 0;
              return (
                <li key={phase._id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border text-sm font-medium tabular-nums",
                      complete ? "border-done bg-done-surface text-done" : "text-muted-foreground",
                    )}
                  >
                    {phase.number}
                  </span>
                  <span className="min-w-0 flex-1 font-medium">{phase.title}</span>
                  <span aria-hidden="true" className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 sm:block">
                    <span className="block h-full rounded-full bg-done" style={{ width: `${percent}%` }} />
                  </span>
                  <span className={cn("w-20 shrink-0 text-right text-sm tabular-nums", complete ? "font-medium text-done" : "text-muted-foreground")}>
                    {done} of {phase.tasks.length} done
                  </span>
                </li>
              );
            })}
          </ol>
        </Panel>
      )}

      <Panel title="The idea">
        <p className="max-w-2xl leading-relaxed whitespace-pre-line">{plan.idea}</p>
        <Fields
          className="mt-5"
          items={[
            { label: "Customers", value: plan.targetCustomers },
            { label: "Team", value: plan.teamSize === 1 ? "Just you" : `${plan.teamSize} people` },
          ]}
        />
      </Panel>

      <AdviceNotice />
    </Split>
  );
}
