"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Send } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { Spinner } from "@/components/loaders/spinner";
import { Button } from "@/components/ui/button";
import { apiRequest, queryKeys, useApiMutation } from "@/lib/query";
import { cn } from "@/lib/utils";

// How often the page asks for new messages while the tab is in view. The app
// runs on Vercel, where a server cannot hold a connection open (no WebSockets),
// so it asks instead.
const POLL_EVERY_MS = 4000;

// Each ask starts this long before the newest message received so far. The
// server times a message just before saving it, so one can land a moment after
// a later-timed one; the overlap still catches it, and repeats are skipped.
const OVERLAP_MS = 30 * 1000;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "5 Oct · 14:32" in UAE time (UTC+4 all year). Built by hand rather than with
 * Intl, so the server and the browser always print exactly the same text.
 */
function formatTime(iso) {
  const uae = new Date(new Date(iso).getTime() + 4 * 60 * 60 * 1000);
  const hours = String(uae.getUTCHours()).padStart(2, "0");
  const minutes = String(uae.getUTCMinutes()).padStart(2, "0");
  return `${uae.getUTCDate()} ${MONTHS[uae.getUTCMonth()]} · ${hours}:${minutes}`;
}

/** Oldest first: by time, then by id, the same order as the server. ISO times sort correctly as text. */
function byTime(a, b) {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Adds `incoming` to `list`, skipping any message already there, and keeps the list oldest first. */
function merge(list, incoming) {
  const known = new Set(list.map((message) => message.id));
  const fresh = incoming.filter((message) => !known.has(message.id));
  return fresh.length === 0 ? list : [...list, ...fresh].sort(byTime);
}

/**
 * The later of `time` and the newest message in `list` (ISO times, or null).
 * Real messages only: the reply kept on older requests has an id starting with "reply-".
 */
function newestTime(list, time = null) {
  let newest = time;
  for (const message of list) {
    if (!message.id.startsWith("reply-") && (!newest || message.createdAt > newest)) newest = message.createdAt;
  }
  return newest;
}

/**
 * A saved conversation between two people: a founder and a mentor about a
 * request, or a founder and a funder about a plan (pass `apiUrl`): the
 * original request first, then the messages as bubbles (yours on the right),
 * and the box to write in. New messages arrive by asking the server every few
 * seconds while the tab is visible. `closedText` says why a closed conversation
 * is closed; when it closes while the page is open, the server's answer says why.
 */
export function Conversation({
  requestId,
  apiUrl = `/api/requests/${requestId}/messages`,
  closedText,
  opening,
  openingLabel = "Original request",
  initialMessages,
  initialCanSend,
  otherName,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [canSend, setCanSend] = useState(initialCanSend);
  const [closedNote, setClosedNote] = useState(closedText ?? "This conversation is closed.");
  const [draft, setDraft] = useState("");
  const { mutateAsync: sendMessage, isPending: sending } = useApiMutation((body) => apiRequest("POST", apiUrl, { body }));
  const [error, setError] = useState(null);
  const logRef = useRef(null);
  // The newest time among the messages the server listed (the first load and
  // each ask). It only moves forward, and a message you send does not move it,
  // so a message the other person sent just before yours is still asked for.
  const cursor = useRef(newestTime(initialMessages));
  const fieldId = useId();
  const hintId = useId();

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages.length]);

  // Set once the server says the conversation is gone (404), so asking stops.
  const [gone, setGone] = useState(false);

  // One ask for new messages: from a little before the newest one seen so far.
  // Repeats are skipped by merge(). Never throws: a failed ask just waits for the next tick.
  const poll = useCallback(
    async ({ signal } = {}) => {
      const after = cursor.current && new Date(new Date(cursor.current).getTime() - OVERLAP_MS).toISOString();
      const query = after ? `?after=${encodeURIComponent(after)}` : "";
      let result;
      try {
        result = await apiRequest("GET", `${apiUrl}${query}`, undefined, { signal });
      } catch {
        return null; // cancelled: try again on the next tick
      }
      if (!result.ok) {
        if (result.status === 404) setGone(true);
        return null; // offline or a server error: try again on the next tick
      }
      cursor.current = newestTime(result.messages, cursor.current);
      setMessages((list) => merge(list, result.messages));
      setCanSend(result.canSend);
      if (result.closedText) setClosedNote(result.closedText);
      return null;
    },
    [apiUrl],
  );

  // Ask for new messages every few seconds while the tab is visible, and at
  // once when it comes back into view. Stop when the conversation is closed.
  // React Query skips an ask while one is still running, and pauses the
  // interval while the tab is hidden.
  const { refetch } = useQuery({
    queryKey: queryKeys.conversation(apiUrl),
    queryFn: poll,
    enabled: canSend && !gone,
    // The page already has the messages, so do not ask on mount; the first ask comes after one interval.
    initialData: null,
    staleTime: POLL_EVERY_MS,
    gcTime: 0,
    refetchInterval: POLL_EVERY_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    retry: false,
  });

  async function send() {
    const body = draft.trim();
    if (!body) {
      setError("Write a message first.");
      return;
    }
    setError(null);
    const result = await sendMessage(body);
    if (result.status === 409) {
      // The conversation closed after the page loaded; the answer says why.
      setCanSend(false);
      if (result.error) setClosedNote(result.error);
      return;
    }
    if (!result.ok) {
      setError(result.fieldErrors?.body ?? result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setDraft("");
    setMessages((list) => merge(list, [result.message]));
    // Ask at once, so a message the other person sent meanwhile shows up now.
    if (!gone) refetch();
  }

  return (
    <div>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={`Conversation with ${otherName}`}
        tabIndex={0}
        className="max-h-[60vh] min-h-64 space-y-5 overflow-y-auto bg-ink-50 px-4 py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-6"
      >
        <Bubble message={opening} label={openingLabel} />
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {canSend ? "No messages yet. Say hello to start the conversation." : "No messages were sent."}
          </p>
        )}
      </div>

      <div className="border-t p-4 sm:p-5">
        {canSend ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <FormAlert>{error}</FormAlert>
            <label htmlFor={fieldId} className="block text-sm font-medium">
              Message to {otherName}
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id={fieldId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  // Enter sends; Shift+Enter starts a new line. Not while an
                  // input method (for Chinese or Japanese, say) is composing a word.
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    if (!sending) send();
                  }
                }}
                rows={2}
                maxLength={2000}
                aria-describedby={hintId}
                className="max-h-48 min-h-11 min-w-0 flex-1 resize-y rounded-lg border border-input bg-card px-3 py-2.5 text-base leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" size="lg" disabled={sending} aria-busy={sending}>
                {sending ? <Spinner /> : <Send aria-hidden="true" />}
                <span className="sr-only sm:not-sr-only">{sending ? "Sending…" : "Send"}</span>
              </Button>
            </div>
            <p id={hintId} className="text-sm text-muted-foreground">
              Press Enter to send, Shift + Enter for a new line. Messages are saved here for both of you.
            </p>
          </form>
        ) : (
          <div className="flex gap-3 rounded-lg border border-dashed border-ink-300 bg-ink-50 p-4 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{closedNote} You can still read every message here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** One message: yours on the right in emerald, theirs on the left on white. */
function Bubble({ message, label }) {
  const { mine } = message;
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-line wrap-anywhere sm:max-w-[75%]",
          mine ? "rounded-br-md bg-primary text-primary-foreground" : "panel rounded-bl-md",
        )}
      >
        {label && (
          <p
            className={cn(
              "mb-1 text-xs font-semibold tracking-[0.04em] uppercase",
              mine ? "text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
        )}
        {message.body}
      </div>
      <p className="mt-1 px-1 text-xs text-muted-foreground">
        <span className="font-medium">{mine ? "You" : message.authorName}</span> ·{" "}
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
      </p>
    </div>
  );
}
