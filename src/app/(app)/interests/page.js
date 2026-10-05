import Link from "next/link";
import { Fields } from "@/components/document";
import { EmptyState, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { listInterestsForFunder } from "@/lib/funding";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "My interests" };

/** A funder's interest requests. Accepted ones link to the full plan while it stays shared. */
export default async function InterestsPage() {
  const user = await requireUser({ roles: ["funder"] });
  const interests = toPlain(await listInterestsForFunder(user.id));

  return (
    <>
      <PageHeader title="My interests" description="The plans you asked about, and what their owners answered." />
      {interests.length === 0 ? (
        <EmptyState
          title="No interest requests yet"
          text="Browse shared plans and tell owners when one interests you."
          action={
            <Link href="/discover" className={buttonVariants({ size: "lg" })}>
              Discover plans
            </Link>
          }
        />
      ) : (
        <ul className="divide-y border-b">
          {interests.map((interest) => {
            const plan = interest.planId;
            const open = interest.status === "accepted" && plan?.shared && !plan?.hiddenByAdmin;
            return (
              <li key={interest._id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <h2 className="text-lg">{plan?.title ?? "A deleted plan"}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Sent {formatDate(interest.createdAt)}</p>
                  </div>
                  <StatusBadge status={interest.status} />
                </div>
                <p className="mt-3 max-w-prose whitespace-pre-line text-muted-foreground">{interest.message}</p>

                {open && (
                  <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                    <Link href={`/plans/${plan._id}`} className={buttonVariants({ size: "lg", className: "self-start sm:self-auto" })}>
                      Read the full plan
                    </Link>
                    <Fields
                      items={[
                        { label: "Owner", value: plan.ownerId?.name },
                        {
                          label: "Email",
                          value: (
                            <a
                              href={`mailto:${plan.ownerId?.email}`}
                              className="text-foreground decoration-primary underline underline-offset-4 wrap-anywhere hover:decoration-2"
                            >
                              {plan.ownerId?.email}
                            </a>
                          ),
                        },
                      ]}
                    />
                  </div>
                )}
                {interest.status === "accepted" && !open && (
                  <p className="mt-4 text-sm text-muted-foreground">The owner has stopped sharing this plan.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
