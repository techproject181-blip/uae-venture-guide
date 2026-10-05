import { notFound } from "next/navigation";
import { SharingForm } from "@/components/funding/sharing-form";
import { progressPercent } from "@/lib/budget";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";

export const metadata = { title: "Share with funders" };

export default async function PlanSharingPage({ params }) {
  const user = await requireUser({ roles: ["entrepreneur"] });
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found?.isOwner) notFound();
  const { plan } = found;

  const card = {
    title: plan.title,
    sector: plan.sector,
    emirate: plan.emirate,
    budgetAed: plan.budgetAed,
    pitchSummary: plan.pitchSummary,
    progress: progressPercent(plan.tasks),
  };
  return (
    <SharingForm
      planId={plan._id}
      card={card}
      shared={plan.shared}
      notice={
        plan.hiddenByAdmin && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive-surface px-5 py-4 text-destructive">
            An administrator has hidden this plan from funders.
          </p>
        )
      }
    />
  );
}
