import { cn } from "@/lib/utils";

// The pieces that make a conversation row in the request and interest lists
// read like a chat inbox. Whether a conversation is new comes from lib/inbox.js.

/**
 * The newest message as up to two lines: "You: …" or "Omar: …". Bold and dark
 * while it is unread, quiet once read; screen readers hear "New message" first.
 */
export function ChatPreview({ body, mine, authorName, unread = false, className }) {
  const who = mine ? "You" : (authorName ?? "").split(" ")[0] || "They";
  return (
    <p
      className={cn(
        "line-clamp-2 max-w-prose text-sm whitespace-pre-line",
        unread ? "font-medium text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {unread && <span className="sr-only">New message. </span>}
      <span className={unread ? "font-semibold" : "font-medium text-foreground/80"}>{who}:</span> {body}
    </p>
  );
}
