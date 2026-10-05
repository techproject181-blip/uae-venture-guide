import { notFound } from "next/navigation";
import { Section } from "@/components/document";
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
    <Section
      title="Share with funders"
      description="Funders browse pitch cards and can ask to see your plan. You decide who gets in."
      >
      {plan.hiddenByAdmin && (
        <p role="alert" className="mb-6 max-w-2xl rounded-lg border border-destructive/30 bg-destructive-surface px-4 py-3 text-destructive">
          An administrator has hidden this plan from funders.
        </p>
      )}
      <SharingForm planId={plan._id} card={card} shared={plan.shared} />
    </Section>
  );
}
