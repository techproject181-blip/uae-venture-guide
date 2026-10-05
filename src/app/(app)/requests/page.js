import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Fields } from "@/components/document";
import { Panel, Stack } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { InterestList } from "@/components/requests/interest-list";
import { RequestActions } from "@/components/requests/request-actions";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { listInterestsForOwner } from "@/lib/funding";
import { MentorRequest } from "@/models/MentorRequest";
import "@/models/Plan"; // registers the models that populate() reads from
import "@/models/User";

export const metadata = { title: "Requests" };

const STATUS_ORDER = { pending: 0, accepted: 1, completed: 2, declined: 3 };

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

  const list =
    requests.length === 0 ? (
      <EmptyState
        title="No requests yet"
        text={isMentor ? "Requests from founders appear here." : "Find a mentor and ask for help with your plan."}
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
            <RequestEntry key={request._id} request={request} isMentor={isMentor} />
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
            ? "Founders asking for your help. Once you accept, you can talk in a saved chat here and read the attached plan."
            : "Your guidance requests to mentors, and funders' interest in your shared plans."
        }
      />

      <Stack>
        {showInterests && (
          <Panel title="Funder interest in your plans" flush>
            <InterestList interests={interests} />
          </Panel>
        )}
        {list}
      </Stack>
    </>
  );
}

/** One guidance request: who and when, the message, the attached plan, the chat link or reply, and the mentor's buttons. */
function RequestEntry({ request, isMentor }) {
  const other = isMentor ? request.entrepreneurId : request.mentorId;
  const accepted = request.status === "accepted";
  // Accepted and completed requests have a conversation (lib/messages.js); a completed one is read-only.
  const hasChat = accepted || request.status === "completed";
  const plan = request.planId;

  return (
    <li className="px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] font-semibold">{request.topic}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMentor ? "From" : "To"} {other?.name ?? "a removed account"} · {formatDate(request.createdAt)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="mt-3 max-w-prose whitespace-pre-line text-foreground/90">{request.message}</p>

      {plan && (
        <Fields
          className="mt-5"
          items={[
            plan && {
              label: "Attached plan",
              value:
                accepted || !isMentor ? (
                  <Link href={`/plans/${plan._id}`} className="text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
                    {plan.title}
                  </Link>
                ) : (
                  <>
                    {plan.title}{" "}
                    <span className="font-normal text-muted-foreground">
                      {request.status === "pending" ? "(readable once you accept)" : "(no longer shared)"}
                    </span>
                  </>
                ),
            },
          ]}
        />
      )}

      {hasChat && (
        <div className="mt-5">
          <Link href={`/requests/${request._id}`} className={buttonVariants({ variant: accepted ? "default" : "outline", size: "lg" })}>
            <MessagesSquare aria-hidden="true" />
            Open chat<span className="sr-only"> about {request.topic}</span>
          </Link>
        </div>
      )}

      {/* A declined request has no chat, so the mentor's reason is shown here. */}
      {request.status === "declined" && request.mentorReply && (
        <dl className="mt-5">
          <dt className="field-label">Mentor&apos;s reply</dt>
          <dd className="mt-1 max-w-prose whitespace-pre-line">{request.mentorReply}</dd>
        </dl>
      )}

      {isMentor && (request.status === "pending" || accepted) && (
        <div className="mt-6">
          <RequestActions requestId={request._id} status={request.status} />
        </div>
      )}
    </li>
  );
}
