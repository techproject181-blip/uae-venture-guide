import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { IntakeForm } from "@/components/plans/intake-form";
import { requireUser } from "@/lib/guards";
import { DAILY_LIMITS, quotaLeft } from "@/lib/quota";

export const metadata = { title: "New plan" };

export default async function NewPlanPage() {
  const user = await requireUser({ roles: ["entrepreneur"] });
  const left = await quotaLeft(user.id, "generations");

  return (
    <div className="max-w-3xl">
      <BackLink href="/plans">My plans</BackLink>
      <PageHeader
        title="Plan a new business"
        description="Answer a few questions. Your roadmap lists every step, who you deal with and what it costs, with official fees where they exist."
      />
      <p className="-mt-2 mb-8 text-sm text-muted-foreground" role="status">
        You can make {left} more of {DAILY_LIMITS.generations} roadmaps today.
      </p>
      <IntakeForm />
    </div>
  );
}
