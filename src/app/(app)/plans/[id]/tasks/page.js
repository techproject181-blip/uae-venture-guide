import { notFound } from "next/navigation";
import { Section } from "@/components/document";
import { AdviceNotice, FeeLegend, feeMarks } from "@/components/plans/plan-bits";
import { TaskForm } from "@/components/plans/task-form";
import { TaskRow } from "@/components/plans/task-row";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
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

  return (
    <div className="space-y-10">
      <Section title="Steps" description="Press a step to see what it involves, who you deal with and the official source." className="border-t-0 pt-0">
        <FeeLegend {...feeMarks(plan.tasks)} done={plan.tasks.some((task) => task.status === "done")} />
        <div className="mt-8 space-y-10">
          {plan.phases.map((phase, index) => {
            const tasks = plan.tasks.filter((task) => task.phaseId === phase._id);
            return (
              <section key={phase._id} aria-labelledby={`phase-${phase._id}`}>
                <h3 id={`phase-${phase._id}`} className="flex gap-3 text-lg">
                  <span className="w-8 shrink-0 tabular-nums">{index + 1}</span>
                  <span>{phase.title}</span>
                </h3>
                <p className="mt-1 pl-11 text-sm text-muted-foreground">{phase.description}</p>
                {tasks.length === 0 ? (
                  <p className="mt-3 border-y py-4 pl-11 text-sm text-muted-foreground">No steps in this phase.</p>
                ) : (
                  <ol className="mt-3 divide-y border-y">
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
      </Section>

      {isOwner && (
        <Section title="Add your own step">
          <div className="max-w-4xl panel p-5 sm:p-6">
            <TaskForm planId={plan._id} phases={phases} />
          </div>
        </Section>
      )}

      <AdviceNotice />
    </div>
  );
}
