import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { rowLink } from "@/components/dashboard/dashboard-bits";
import { EmptyState, PageHeader } from "@/components/page-header";
import { ChatPreview } from "@/components/requests/chat-preview";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { listConversations } from "@/lib/inbox";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

// Who each role talks to, and how a conversation starts for them.
const COPY = {
  entrepreneur: {
    description: "Your chats with mentors and funders, newest first.",
    empty: "A chat opens when a mentor accepts your request, or when you accept a funder's interest.",
  },
  mentor: {
    description: "Your chats with entrepreneurs, newest first.",
    empty: "A chat opens when you accept an entrepreneur's request.",
  },
  funder: {
    description: "Your chats with entrepreneurs, newest first.",
    empty: "A chat opens when an entrepreneur accepts your interest in their plan.",
  },
};

/**
 * Every conversation in one place, the same for entrepreneurs, mentors and
 * funders: who it is with, what it is about, the newest message and how many
 * are new. Requests and interest are still answered on their own pages.
 */
export default async function MessagesPage() {
  const user = await requireUser({ roles: ["entrepreneur", "mentor", "funder"] });
  const conversations = await listConversations(user);
  const copy = COPY[user.role];

  return (
    <>
      <PageHeader title="Messages" description={copy.description} />
      {conversations.length === 0 ? (
        <EmptyState title="No conversations yet" text={copy.empty} />
      ) : (
        <div className="panel overflow-hidden">
          <ul className="divide-y">
            {conversations.map((conversation) => (
              <ConversationRow key={conversation.href} conversation={conversation} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/** One conversation: the whole row opens it. A number on the right says how many messages are new. */
function ConversationRow({ conversation }) {
  const { href, otherName, otherRole, title, closed, last, unread } = conversation;
  return (
    <li className="relative px-5 py-4 transition-colors hover:bg-ink-50/80 sm:px-6 sm:py-5">
      <div className="flex gap-3.5">
        <Avatar name={otherName} className="size-10 text-xs" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-semibold">
              <Link href={href} className={rowLink}>
                {otherName}
              </Link>
            </h2>
            <time
              dateTime={last.createdAt}
              className={cn("shrink-0 text-sm tabular-nums", unread > 0 ? "font-medium text-primary" : "text-muted-foreground")}
            >
              {formatDate(last.createdAt)}
            </time>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {otherRole} · {title}
            {closed && " · Read-only"}
          </p>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <ChatPreview body={last.body} mine={last.mine} authorName={otherName} unread={unread > 0} />
            {unread > 0 && (
              <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                {unread}
                <span className="sr-only"> new</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
