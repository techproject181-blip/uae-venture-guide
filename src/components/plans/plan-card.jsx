import Link from "next/link";
import { Route } from "lucide-react";
import { ProgressBar } from "@/components/plans/plan-bits";
import { StatusBadge } from "@/components/status-badge";
import { progressPercent } from "@/lib/budget";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/format";

/**
 * A plan in the card grid of "My plans": name, place and sector, a few lines
 * of the idea, then progress and the last update pinned to the bottom. The
 * title link stretches over the whole card, so the card is one link.
 */
export function PlanCard({ plan }) {
  const tasks = plan.tasks ?? [];
  const done = tasks.filter((task) => task.status === "done").length;

  return (
    <article className="panel panel-link relative flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary" aria-hidden="true">
          <Route className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
            <Link
              href={`/plans/${plan._id}`}
              className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {plan.title}
            </Link>
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {labelOf(EMIRATES, plan.emirate)} · {labelOf(SECTORS, plan.sector)}
          </p>
        </div>
      </div>

      {plan.idea && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{plan.idea}</p>}

      <div className="mt-auto pt-5">
        <div className="border-t pt-4">
          {plan.status === "ready" ? (
            <ProgressBar percent={progressPercent(tasks)} label={`${done} of ${tasks.length} steps done`} />
          ) : (
            <StatusBadge status={plan.status} />
          )}
          <p className="mt-3 text-sm text-muted-foreground">Updated {formatDate(plan.updatedAt)}</p>
        </div>
      </div>
    </article>
  );
}
