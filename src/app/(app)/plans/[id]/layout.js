import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Share2 } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Fields } from "@/components/document";
import { ProgressBar } from "@/components/plans/plan-bits";
import { PlanTabs } from "@/components/plans/plan-tabs";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { progressPercent } from "@/lib/budget";
import { EMIRATES, JURISDICTIONS, SECTORS, labelOf } from "@/lib/constants";
import { formatAed, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";

// Six tabs. The sources page is linked from the overview, and sharing from
// the button at the top, so the tab row stays short.
const TABS = [
  { slug: "", label: "Overview" },
  { slug: "tasks", label: "Steps" },
  { slug: "budget", label: "Budget" },
  { slug: "documents", label: "Documents" },
  { slug: "risks", label: "Risks" },
];
// Only the owner chats about the plan.
const OWNER_TABS = [...TABS, { slug: "chat", label: "Chat" }];

/** The document header and tabs shared by every page of one plan. */
export default async function PlanLayout({ children, params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();
  const { plan, isOwner } = found;
  const done = plan.tasks.filter((task) => task.status === "done").length;

  return (
    <>
      {isOwner && <BackLink href="/plans">My plans</BackLink>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">{plan.title}</h1>
          {(plan.status !== "ready" || !isOwner) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {plan.status !== "ready" && <StatusBadge status={plan.status} />}
              {!isOwner && <StatusBadge status="todo" label="Read-only view" />}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.status === "ready" && (
            // A normal link: the browser downloads the PDF the API sends back.
            <a href={`/api/plans/${plan._id}/report`} className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Download aria-hidden="true" />
              Download PDF
            </a>
          )}
          {isOwner && (
            <Link href={`/plans/${plan._id}/sharing`} className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Share2 aria-hidden="true" />
              Share with funders
            </Link>
          )}
        </div>
      </div>

      <Fields
        className="mt-5"
        items={[
          { label: "Emirate", value: labelOf(EMIRATES, plan.emirate) },
          { label: "Sector", value: labelOf(SECTORS, plan.sector) },
          plan.recommendedJurisdiction && { label: "Licence", value: labelOf(JURISDICTIONS, plan.recommendedJurisdiction) },
          { label: "Budget", value: formatAed(plan.budgetAed) },
          { label: "Reference", value: plan._id.slice(-6).toUpperCase() },
          { label: "Issued", value: formatDate(plan.generatedAt ?? plan.createdAt) },
        ]}
      />
      {plan.tasks.length > 0 && (
        <div className="mt-5 max-w-sm">
          <ProgressBar percent={progressPercent(plan.tasks)} label={`${done} of ${plan.tasks.length} steps done`} />
        </div>
      )}

      <PlanTabs planId={plan._id} tabs={isOwner ? OWNER_TABS : TABS} />
      {children}
    </>
  );
}
