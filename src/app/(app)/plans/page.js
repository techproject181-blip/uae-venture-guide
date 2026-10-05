import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PlanCard } from "@/components/plans/plan-card";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Plan } from "@/models/Plan";

export const metadata = { title: "My plans" };

export default async function PlansPage() {
  const user = await requireUser({ roles: ["entrepreneur"] });
  await connectDB();
  const plans = await Plan.find({ ownerId: user.id })
    .sort({ updatedAt: -1 })
    .select("title emirate sector status tasks.status updatedAt")
    .lean();

  const newPlan = (
    <Link href="/plans/new" className={buttonVariants({ size: "lg" })}>
      <Plus aria-hidden="true" />
      New plan
    </Link>
  );

  return (
    <>
      <PageHeader title="My plans" description="Each plan has its own steps, budget, documents and chat." actions={plans.length > 0 && newPlan} />
      {plans.length === 0 ? (
        <EmptyState
          title="No plans yet"
          text="Describe your business idea and get a step-by-step roadmap with official costs."
          action={newPlan}
        />
      ) : (
        <ul className="-mt-3 divide-y border-b">
          {toPlain(plans).map((plan) => (
            <li key={plan._id}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
