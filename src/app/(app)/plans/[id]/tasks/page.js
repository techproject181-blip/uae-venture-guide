import { notFound } from "next/navigation";
import { Panel, Split } from "@/components/layout";
import { AdviceNotice, FeeLegend, feeMarks } from "@/components/plans/plan-bits";
import { TaskForm } from "@/components/plans/task-form";
import { TaskRow } from "@/components/plans/task-row";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Source } from "@/models/Source";

export const metadata = { title: "Steps" };

/** The roadmap's steps by phase, numbered 1.1, 1.2… The owner changes status, edits and adds steps here. */
export default async function PlanTasksPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();
  const { plan, isOwner } = found;

  await connectDB();
  const sourceIds = [...new Set(plan.tasks.flatMap((task) => task.sourceIds))];
  const sources = await Source.find({ _id: { $in: sourceIds }, active: true }).select("title url").lean();
  const sourcesById = Object.fromEntries(sources.map((s) => [String(s._id), { title: s.title, url: s.url }]));
  const phases = plan.phases.map(({ _id, title }) => ({ _id, title }));

  // The key to the fee marks and the DONE stamp, shown only when the steps use one.
  const marks = feeMarks(plan.tasks);
  const anyDone = plan.tasks.some((task) => task.status === "done");
  const showLegend = marks.official || marks.demo || marks.estimate || anyDone;

  const aside = isOwner ? (
    <Panel title="Add your own step" description="For anything the roadmap does not list. It is numbered with its phase.">
      <TaskForm planId={plan._id} phases={phases} />
    </Panel>
  ) : (
    <AdviceNotice />
  );

  return (
    <Split aside={aside}>
      <Panel title="Steps" description="Press a step to see what it involves, who you deal with and the official source." flush>
        <div className="divide-y">
          {showLegend && (
            <div className="px-5 py-3 sm:px-6">
              <FeeLegend {...marks} done={anyDone} />
            </div>
          )}
          {plan.phases.map((phase, index) => {
            const tasks = plan.tasks.filter((task) => task.phaseId === phase._id);
            const done = tasks.filter((task) => task.status === "done").length;
            const complete = tasks.length > 0 && done === tasks.length;
            return (
              <section key={phase._id} aria-labelledby={`phase-${phase._id}`}>
                <div className="flex items-start gap-3 bg-ink-50/70 px-5 py-4 sm:px-6">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border bg-card text-sm font-medium tabular-nums",
                      complete ? "border-done bg-done-surface text-done" : "text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 id={`phase-${phase._id}`} className="leading-snug font-semibold">
                      <span className="sr-only">{index + 1} </span>
                      {phase.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                  {tasks.length > 0 && (
                    <span className={cn("mt-0.5 shrink-0 text-sm tabular-nums", complete ? "font-medium text-done" : "text-muted-foreground")}>
                      {done} of {tasks.length}
                    </span>
                  )}
                </div>
                {tasks.length === 0 ? (
                  <p className="border-t px-5 py-4 text-sm text-muted-foreground sm:px-6">No steps in this phase.</p>
                ) : (
                  <ol className="divide-y border-t">
                    {tasks.map((task, taskIndex) => (
                      <TaskRow
                        key={task._id}
                        planId={plan._id}
                        task={task}
                        number={`${index + 1}.${taskIndex + 1}`}
                        phases={phases}
                        sources={sourcesById}
                        canEdit={isOwner}
                      />
                    ))}
                  </ol>
                )}
              </section>
            );
          })}
        </div>
      </Panel>

      {isOwner && <AdviceNotice />}
    </Split>
  );
}
