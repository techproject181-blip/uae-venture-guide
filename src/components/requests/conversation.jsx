"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Lock, Send } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { Spinner } from "@/components/loaders/spinner";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/form-helpers";
import { cn } from "@/lib/utils";

// How often the page asks for new messages while the tab is in view. The app
// runs on Vercel, where a server cannot hold a connection open (no WebSockets),
// so it asks instead.
const POLL_EVERY_MS = 4000;

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

/** Adds `incoming` to `list`, skipping any message already there, oldest first. */
function merge(list, incoming) {
  const known = new Set(list.map((message) => message.id));
  const fresh = incoming.filter((message) => !known.has(message.id));
  return fresh.length === 0 ? list : [...list, ...fresh];
}

/**
 * The conversation between a founder and a mentor about one request: the
 * original request first, then the messages as bubbles (yours on the right),
 * and the box to write in. New messages arrive by asking the server every few
 * seconds while the tab is visible.
 */
export function Conversation({ requestId, opening, initialMessages, initialCanSend, otherName }) {
  const [messages, setMessages] = useState(initialMessages);
  const [canSend, setCanSend] = useState(initialCanSend);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const logRef = useRef(null);
  const latest = useRef(messages);
  const fieldId = useId();
  const hintId = useId();

  useEffect(() => {
    latest.current = messages;
  }, [messages]);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages.length]);

  const poll = useCallback(
    async (signal) => {
      // Real messages only: the reply kept on older requests has an id starting with "reply-".
      const last = latest.current.findLast((message) => !message.id.startsWith("reply-"));
      const query = last ? `?after=${encodeURIComponent(last.createdAt)}` : "";
      try {
        const response = await fetch(`/api/requests/${requestId}/messages${query}`, { signal, cache: "no-store" });
        if (!response.ok) return response.status === 404 ? "gone" : null;
        const body = await response.json();
        setMessages((list) => merge(list, body.messages));
        setCanSend(body.canSend);
        return body.canSend ? null : "closed";
      } catch {
        return null; // offline or cancelled: try again on the next tick
      }
    },
    [requestId],
  );

  // Ask for new messages every few seconds while the tab is visible, and at
  // once when it comes back into view. Stop when the conversation is closed.
  useEffect(() => {
    if (!canSend) return undefined;
    const controller = new AbortController();
    let busy = false;
    let stopped = false;

    async function tick() {
      if (busy || stopped || document.visibilityState !== "visible") return;
      busy = true;
      const result = await poll(controller.signal);
      busy = false;
      if (result) stopped = true;
    }

    const timer = setInterval(tick, POLL_EVERY_MS);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [canSend, poll]);

  async function send() {
    const body = draft.trim();
    if (!body) {
      setError("Write a message first.");
      return;
    }
    setError(null);
    setSending(true);
    const result = await sendJson("POST", `/api/requests/${requestId}/messages`, { body });
    setSending(false);
    if (!result.ok) {
      setError(result.fieldErrors?.body ?? result.error ?? "Something went wrong. Please try again.");
      if (result.status === 409) setCanSend(false);
      return;
    }
    setDraft("");
    setMessages((list) => merge(list, [result.message]));
  }

  return (
    <div>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={`Conversation with ${otherName}`}
        tabIndex={0}
        className="max-h-[60vh] min-h-64 space-y-5 overflow-y-auto bg-slate-50 px-4 py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-6"
      >
        <Bubble message={opening} label="Original request" />
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
                  // input method (for Arabic or Chinese, say) is composing a word.
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
          <div className="flex gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>This request is completed, so the conversation is closed. You can still read every message here.</p>
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
        {label && <p className={cn("mb-1 text-xs font-semibold tracking-[0.04em] uppercase", mine ? "text-primary-foreground" : "text-muted-foreground")}>{label}</p>}
        {message.body}
      </div>
      <p className="mt-1 px-1 text-xs text-muted-foreground">
        <span className="font-medium">{mine ? "You" : message.authorName}</span> ·{" "}
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
      </p>
    </div>
  );
}
