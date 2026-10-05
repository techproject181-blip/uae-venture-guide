import Link from "next/link";
import { Fields } from "@/components/document";
import { CardGrid } from "@/components/layout";
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
        <CardGrid className="grid-cols-1">
          {interests.map((interest) => {
            const plan = interest.planId;
            const open = interest.status === "accepted" && plan?.shared && !plan?.hiddenByAdmin;
            return (
              <li key={interest._id}>
                <article className="panel flex h-full flex-col p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">{plan?.title ?? "A deleted plan"}</h2>
                        <p className="mt-1 text-sm text-muted-foreground tabular-nums">Sent {formatDate(interest.createdAt)}</p>
                      </div>
                      <StatusBadge status={interest.status} className="shrink-0" />
                    </div>
                    <p className="mt-4 line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{interest.message}</p>
                  </div>

                  {open && (
                    <div className="mt-5 space-y-4 border-t pt-4">
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
                      <Link href={`/plans/${plan._id}`} className={buttonVariants({ size: "lg", className: "w-full" })}>
                        Read the full plan
                      </Link>
                    </div>
                  )}
                  {interest.status === "accepted" && !open && (
                    <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">The owner has stopped sharing this plan.</p>
                  )}
                  {interest.status === "pending" && (
                    <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">Waiting for the owner to answer. You will get an email.</p>
                  )}
                </article>
              </li>
            );
          })}
        </CardGrid>
      )}
    </>
  );
}
