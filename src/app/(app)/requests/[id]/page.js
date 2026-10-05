import Link from "next/link";
import { notFound } from "next/navigation";
import { Fields } from "@/components/document";
import { PageHeader, Panel, Split } from "@/components/layout";
import { Conversation } from "@/components/requests/conversation";
import { RequestActions } from "@/components/requests/request-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { getConversation, listMessages } from "@/lib/messages";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";

export const metadata = { title: "Conversation" };

/**
 * The conversation between a founder and a mentor about one guidance request.
 * Only the two of them see it, and only once the mentor has accepted; anyone
 * else gets "not found" (see lib/messages.js).
 */
export default async function RequestConversationPage({ params }) {
  const user = await requireUser({ roles: ["entrepreneur", "mentor"] });
  const { id } = await params;
  const conversation = await getConversation(id, user);
  if (!conversation) notFound();
  const { request, isMentor, canSend } = conversation;

  const [people, plan, messages] = await Promise.all([
    User.find({ _id: { $in: [request.entrepreneurId, request.mentorId] } }).select("name").lean(),
    request.planId ? Plan.findById(request.planId).select("title").lean() : null,
    listMessages(request, user.id),
  ]);
  const nameOf = (userId) => people.find((person) => String(person._id) === String(userId))?.name ?? "A removed account";
  const founderName = nameOf(request.entrepreneurId);
  const otherName = isMentor ? founderName : nameOf(request.mentorId);
  // The mentor may open the plan only while the request is accepted (lib/plans.js).
  const planReadable = plan && (!isMentor || request.status === "accepted");

  const opening = {
    id: `opening-${request._id}`,
    body: request.message,
    createdAt: new Date(request.createdAt).toISOString(),
    authorName: founderName,
    mine: !isMentor,
  };

  return (
    <>
      <PageHeader
        title={request.topic}
        description={`${isMentor ? "Guidance request from" : "Your guidance request to"} ${otherName}.`}
        back={{ href: "/requests", label: "All requests" }}
        actions={isMentor && request.status === "accepted" && <RequestActions requestId={String(request._id)} status={request.status} />}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <StatusBadge status={request.status} />
          {planReadable && (
            <Link href={`/plans/${plan._id}`} className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
              Open the plan: {plan.title}
            </Link>
          )}
        </div>
      </PageHeader>

      <Split
        aside={
          <Panel title="About this request">
            <Fields
              items={[
                { label: isMentor ? "Founder" : "Mentor", value: otherName },
                { label: "Sent", value: formatDate(request.createdAt) },
                plan && {
                  label: "Attached plan",
                  value: planReadable ? (
                    <Link href={`/plans/${plan._id}`} className="text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
                      {plan.title}
                    </Link>
                  ) : (
                    <>
                      {plan.title} <span className="font-normal text-muted-foreground">(no longer shared)</span>
                    </>
                  ),
                },
              ]}
            />
            <p className="mt-5 text-sm text-muted-foreground">
              {canSend
                ? "Talk here instead of by email: every message is saved for both of you."
                : "The request is completed. The conversation stays here to read."}
            </p>
          </Panel>
        }
      >
        <Panel title="Conversation" flush>
          {/* key: a fresh start when the status changes, so "Mark as completed" closes the box at once. */}
          <Conversation
            key={request.status}
            requestId={String(request._id)}
            opening={opening}
            initialMessages={messages}
            initialCanSend={canSend}
            otherName={otherName}
          />
        </Panel>
      </Split>
    </>
  );
}
