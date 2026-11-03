import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { Fields } from "@/components/document";
import { CardGrid } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { ChatPreview } from "@/components/requests/chat-preview";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { listInterestsForFunder } from "@/lib/funding";
import { requireUser } from "@/lib/guards";
import { interestChats } from "@/lib/inbox";

export const metadata = { title: "My interests" };

/**
 * A funder's interest requests. Accepted ones link to the full plan while it
 * stays shared, and to the chat with the owner: the card shows its newest
 * message, with a dot while it is unread.
 */
export default async function InterestsPage() {
  const user = await requireUser({ roles: ["funder"] });
  const interests = toPlain(await listInterestsForFunder(user.id));
  const chats = await interestChats(interests, user);

  return (
    <>
      <PageHeader title="My interests" description="The plans you asked about, and what their owners answered." />
      {interests.length === 0 ? (
        <EmptyState
          title="No interest requests yet"
          text="Browse shared plans and tell owners when one interests you."
          action={
            <Link href="/discover" className={buttonVariants({ size: "lg" })}>
              See shared plans
            </Link>
          }
        />
      ) : (
        <CardGrid className="grid-cols-1">
          {interests.map((interest) => {
            const plan = interest.planId;
            const open = interest.status === "accepted" && plan?.shared && !plan?.hiddenByAdmin;
            const chat = chats.get(interest._id);
            const unread = (chat?.unread ?? 0) > 0;
            const ownerName = plan?.ownerId?.name ?? "the owner";
            // Until someone writes in the chat, your interest is the newest message.
            const last = chat?.last ?? { body: interest.message, createdAt: interest.createdAt, mine: true };
            return (
              <li key={interest._id}>
                <article className="panel flex h-full flex-col p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
                          {plan?.title ?? "A deleted plan"}
                        </h2>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground tabular-nums">
                          <span>
                            {interest.status === "accepted" ? `With ${ownerName}` : "Sent"} · {formatDate(last.createdAt)}
                          </span>
                        </p>
                      </div>
                      <StatusBadge status={interest.status} className="shrink-0" />
                    </div>
                    <ChatPreview body={last.body} mine={last.mine} authorName={ownerName} unread={unread} className="mt-4" />
                  </div>

                  {open && (
                    <div className="@container mt-5 space-y-4 border-t pt-4">
                      <Fields items={[{ label: "Owner", value: plan.ownerId?.name }]} />
                      <div className="grid gap-2 @min-[26rem]:grid-cols-2">
                        <Link href={`/plans/${plan._id}`} className={buttonVariants({ size: "lg" })}>
                          Read the full plan
                        </Link>
                        <Link href={`/interests/${interest._id}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                          <MessagesSquare aria-hidden="true" />
                          Open chat<span className="sr-only"> with {ownerName}</span>
                        </Link>
                      </div>
                    </div>
                  )}
                  {interest.status === "accepted" && !open && (
                    <div className="mt-5 space-y-3 border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        {plan?.hiddenByAdmin
                          ? "An administrator has hidden this plan from funders."
                          : "The owner has stopped sharing this plan."}
                      </p>
                      {/* The plan is closed, but the messages you already sent stay readable. */}
                      <Link href={`/interests/${interest._id}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                        Read the conversation
                      </Link>
                    </div>
                  )}
                  {interest.status === "pending" && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <p className="text-sm text-muted-foreground">Waiting for the owner to answer. You will see their answer here.</p>
                      <DeleteButton
                        url={`/api/interests/${interest._id}`}
                        label="Withdraw"
                        confirmText="The owner will no longer see your interest. You can send it again later."
                        doneText="Interest withdrawn."
                        icon="undo"
                        size="default"
                      />
                    </div>
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
