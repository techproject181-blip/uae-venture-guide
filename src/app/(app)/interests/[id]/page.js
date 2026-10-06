import Link from "next/link";
import { notFound } from "next/navigation";
import { Fields } from "@/components/document";
import { PageHeader, Panel, Split } from "@/components/layout";
import { Conversation } from "@/components/requests/conversation";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { getInterestConversation, listInterestMessages } from "@/lib/interest-messages";
import { User } from "@/models/User";

export const metadata = { title: "Conversation" };

/**
 * The conversation between a plan's owner and a funder, once the owner has
 * accepted the funder's interest. Only the two of them see it (see
 * lib/interest-messages.js).
 */
export default async function InterestConversationPage({ params }) {
  const user = await requireUser({ roles: ["entrepreneur", "funder"] });
  const { id } = await params;
  const conversation = await getInterestConversation(id, user);
  if (!conversation) notFound();
  const { interest, plan, isFunder, canSend } = conversation;

  const [people, messages] = await Promise.all([
    User.find({ _id: { $in: [interest.funderId, plan.ownerId] } }).select("name").lean(),
    listInterestMessages(interest, user.id),
  ]);
  const nameOf = (userId) => people.find((person) => String(person._id) === String(userId))?.name ?? "A removed account";
  const funderName = nameOf(interest.funderId);
  const otherName = isFunder ? nameOf(plan.ownerId) : funderName;

  const opening = {
    id: `opening-${interest._id}`,
    body: interest.message,
    createdAt: new Date(interest.createdAt).toISOString(),
    authorName: funderName,
    mine: isFunder,
  };

  return (
    <>
      <PageHeader
        title={plan.title}
        description={isFunder ? `Your conversation with ${otherName}, the plan's owner.` : `Your conversation with ${otherName}, a funder.`}
        back={isFunder ? { href: "/interests", label: "My interests" } : { href: "/requests", label: "Requests" }}
      />

      <Split
        aside={
          <Panel title="About this conversation">
            <Fields
              items={[
                { label: isFunder ? "Owner" : "Funder", value: otherName },
                { label: "Interest sent", value: formatDate(interest.createdAt) },
                {
                  label: "Plan",
                  value: canSend ? (
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
              {canSend ? "Every message is saved here for both of you." : "The plan is no longer shared. The conversation stays here to read."}
            </p>
          </Panel>
        }
      >
        <Panel title="Conversation" flush>
          {/* The key remounts the conversation when it opens or closes again. */}
          <Conversation
            key={String(canSend)}
            apiUrl={`/api/interests/${interest._id}/messages`}
            closedText="The plan is no longer shared, so the conversation is closed. You can still read every message here."
            openingLabel="Interest message"
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
