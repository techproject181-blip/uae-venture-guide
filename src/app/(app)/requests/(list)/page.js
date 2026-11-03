import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Panel, Stack } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { ChatPreview } from "@/components/requests/chat-preview";
import { InterestList } from "@/components/requests/interest-list";
import { RequestActions } from "@/components/requests/request-actions";
import { StatusBadge } from "@/components/status-badge";
import { DeleteButton } from "@/components/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { listInterestsForOwner } from "@/lib/funding";
import { interestChats, requestChats } from "@/lib/inbox";
import { MentorRequest } from "@/models/MentorRequest";
import "@/models/Plan"; // registers the models that populate() reads from
import "@/models/User";

export const metadata = { title: "Requests" };

const rowLink = "text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

const STATUS_ORDER = { pending: 0, accepted: 1, completed: 2, declined: 3 };

// Why a mentor cannot open the attached plan: it opens only while they have accepted the request.
const PLAN_NOTE = {
  pending: "(readable once you accept)",
  completed: "(no longer shared)",
  declined: "(not shared with you)",
};

/** Entrepreneurs see the guidance requests they sent and funders' interest in their plans; mentors see requests sent to them. */
export default async function RequestsPage() {
  const user = await requireUser({ roles: ["entrepreneur", "mentor"] });
  const isMentor = user.role === "mentor";

  await connectDB();
  const requests = toPlain(
    await MentorRequest.find(isMentor ? { mentorId: user.id } : { entrepreneurId: user.id })
      .populate("mentorId", "name")
      .populate("entrepreneurId", "name")
      .populate("planId", "title")
      .sort({ createdAt: -1 })
      .lean(),
  ).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const interests = isMentor ? [] : toPlain(await listInterestsForOwner(user.id));
  const showInterests = interests.length > 0;
  // Each conversation's newest message, and whether it holds anything new.
  const [chats, funderChats] = await Promise.all([requestChats(requests, user), interestChats(interests, user)]);

  const list =
    requests.length === 0 ? (
      <EmptyState
        title="No requests yet"
        text={isMentor ? "Requests from entrepreneurs appear here." : "Find a mentor and ask for help with your plan."}
        action={
          !isMentor && (
            <Link href="/mentors" className={buttonVariants({ size: "lg" })}>
              Find a mentor
            </Link>
          )
        }
      />
    ) : (
      <Panel title="Guidance requests" description={isMentor ? undefined : "Open a chat once a mentor accepts."} flush>
        <ul className="divide-y">
          {requests.map((request) => (
            <RequestEntry key={request._id} request={request} isMentor={isMentor} chat={chats.get(request._id)} />
          ))}
        </ul>
      </Panel>
    );

  return (
    <>
      <PageHeader
        title={isMentor ? "Guidance requests" : "Requests"}
        description={
          isMentor
            ? "Entrepreneurs asking for your help. Once you accept, you can talk in a saved chat here and read the attached plan."
            : "Your guidance requests to mentors, and funders' interest in your shared plans."
        }
      />

      <Stack>
        {showInterests && (
          <Panel title="Funder interest in your plans" flush>
            <InterestList interests={interests} chats={funderChats} />
          </Panel>
        )}
        {list}
        {!isMentor && !showInterests && (
          <Panel title="Funder interest in your plans">
            <p className="text-sm text-muted-foreground">
              No funder interest yet. Open a plan and choose <span className="font-medium text-foreground">Share with funders</span> so
              funders can find it.
            </p>
          </Panel>
        )}
      </Stack>
    </>
  );
}

/**
 * One guidance request as a chat row: the other person, the topic and the
 * attached plan, then the newest message, with a dot while it is unread. The
 * buttons sit on the right. The mentor's reply box is a form, so it sits under
 * the row at full width instead of in the narrow right column.
 */
function RequestEntry({ request, isMentor, chat }) {
  const other = isMentor ? request.entrepreneurId : request.mentorId;
  const otherName = other?.name ?? "A removed account";
  const accepted = request.status === "accepted";
  // Accepted and completed requests have a conversation (lib/messages.js); a completed one is read-only.
  const hasChat = accepted || request.status === "completed";
  const plan = request.planId;
  const planReadable = accepted || !isMentor;
  const unread = (chat?.unread ?? 0) > 0;
  // Until someone writes in the chat, the request itself is the newest message.
  const last = chat?.last ?? { body: request.message, createdAt: request.createdAt, mine: !isMentor };

  return (
    <li className="px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="flex min-w-0 flex-1 gap-3.5">
          <Avatar name={otherName} className="size-10 text-xs" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h3 className="text-base font-semibold">{otherName}</h3>
              <StatusBadge status={request.status} />
            </div>

            <p className="mt-0.5 text-sm text-muted-foreground">
              {request.topic} · {formatDate(last.createdAt)}
              {plan && (
                <>
                  {" · "}
                  {planReadable ? (
                    <Link href={`/plans/${plan._id}`} className={rowLink}>
                      {plan.title}
                    </Link>
                  ) : (
                    <>
                      {plan.title} <span>{PLAN_NOTE[request.status]}</span>
                    </>
                  )}
                </>
              )}
            </p>

            <ChatPreview body={last.body} mine={last.mine} authorName={otherName} unread={unread} className="mt-2" />

            {/* A declined request has no chat, so the mentor's reason is shown here. */}
            {request.status === "declined" && request.mentorReply && (
              <p className="mt-2 max-w-prose text-sm whitespace-pre-line text-muted-foreground">
                <span className="font-medium text-foreground">Mentor&apos;s reply: </span>
                {request.mentorReply}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          {hasChat && (
            <Link
              href={`/requests/${request._id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <MessagesSquare aria-hidden="true" />
              Open chat<span className="sr-only"> about {request.topic}</span>
            </Link>
          )}
          {!isMentor && request.status === "pending" && (
            <DeleteButton
              url={`/api/requests/${request._id}`}
              label="Withdraw request"
              confirmText="The mentor will no longer see it. You can send a new request later."
              doneText="Request withdrawn."
              icon="undo"
              size="default"
            />
          )}
          {isMentor && accepted && <RequestActions requestId={request._id} status={request.status} />}
        </div>
      </div>

      {isMentor && request.status === "pending" && (
        <div className="mt-4">
          <RequestActions requestId={request._id} status={request.status} />
        </div>
      )}
    </li>
  );
}
