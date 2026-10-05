import Link from "next/link";
import { ProgressBar } from "@/components/plans/plan-bits";
import { StatusBadge } from "@/components/status-badge";
import { progressPercent } from "@/lib/budget";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/format";

/**
 * A plan in a list, as one plain row: name, place and sector, progress and
 * last update. The whole row is a link. Put it in a list with thin rules
 * between the rows (`divide-y`).
 */
export function PlanCard({ plan }) {
  const tasks = plan.tasks ?? [];
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <Link
      href={`/plans/${plan._id}`}
      className="group flex flex-col gap-4 rounded-sm py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:flex-row md:items-center md:justify-between md:gap-10"
    >
      <div className="min-w-0">
        <h2 className="text-lg underline-offset-4 group-hover:underline">{plan.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {labelOf(EMIRATES, plan.emirate)} · {labelOf(SECTORS, plan.sector)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
        {plan.status === "ready" ? (
          <div className="w-full sm:w-56">
            <ProgressBar percent={progressPercent(tasks)} label={`${done} of ${tasks.length} steps done`} />
          </div>
        ) : (
          <StatusBadge status={plan.status} />
        )}
        <p className="text-sm text-muted-foreground sm:w-36 sm:text-right">Updated {formatDate(plan.updatedAt)}</p>
      </div>
    </Link>
  );
}
