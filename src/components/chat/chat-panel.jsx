"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Send } from "lucide-react";
import { FormAlert } from "@/components/form/form-alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["What will this cost me?", "Which documents do I still need?", "How long will it take?", "Mainland or free zone?"];

/** The chat about one plan: history, the answer streaming in, and the question box. */
export function ChatPanel({ planId, messages, sources, left }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState(null); // { question, answer } while an answer streams in
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  async function ask(question) {
    if (question.trim().length < 2) {
      setError("Type a question.");
      return;
    }
    setError(null);
    setDraft("");
    setLive({ question, answer: "" });
    try {
      const response = await fetch(`/api/plans/${planId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Please try again.");
        setLive(null);
        setDraft(question);
        return;
      }
      // Read the answer piece by piece as it arrives.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setLive({ question, answer });
      }
      // Reload the saved history and drop the live copy in one step, so nothing flickers.
      startTransition(() => {
        router.refresh();
        setLive(null);
      });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setLive(null);
      setDraft(question);
    }
  }

  const empty = messages.length === 0 && !live;
  return (
    <div className="panel">
      {/* The conversation reads like minutes: each question, then its answer, split by thin rules. */}
      <div role="log" aria-live="polite" aria-busy={Boolean(live)} className={cn("max-h-[60vh] overflow-y-auto", !empty && "border-b px-5 py-2")}>
        {messages.map((message) => (
          <Message key={message._id} role={message.role} text={message.content} sources={message.sourceIds.map((id) => sources[id]).filter(Boolean)} />
        ))}
        {live && (
          <>
            <Message role="user" text={live.question} />
            <Message role="assistant" text={live.answer || "Thinking…"} />
          </>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {empty && (
          <div className="mb-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="min-h-11 rounded-full border border-slate-300 bg-card px-4 text-sm font-medium transition-colors duration-150 outline-none hover:border-primary hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <FormAlert>{error}</FormAlert>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
        >
          <label htmlFor="chat-message" className="sr-only">Your question</label>
          <input
            id="chat-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={1000}
            placeholder="Ask about costs, documents, visas…"
            disabled={Boolean(live)}
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" size="lg" disabled={Boolean(live)}>
            <Send aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">{left} questions left today. Answers are guidance, not legal or financial advice.</p>
      </div>
    </div>
  );
}

function Message({ role, text, sources = [] }) {
  const mine = role === "user";
  return (
    <div className={cn("py-3", mine && "border-t pt-5 first:border-t-0 first:pt-3")}>
      <p className="field-label">{mine ? "You asked" : "Answer"}</p>
      <div className={cn("mt-1 max-w-2xl", mine && "font-medium")}>
        <ChatText text={text} />
      </div>
      {sources.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2"
              >
                {source.title}
                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Plain text with blank-line paragraphs and "- " bullet lines. */
function ChatText({ text }) {
  return text.split("\n\n").map((block, i) => {
    const lines = block.split("\n");
    const bullets = lines.filter((line) => line.startsWith("- "));
    const intro = lines.filter((line) => !line.startsWith("- ")).join(" ");
    return (
      <div key={i} className={cn(i > 0 && "mt-3")}>
        {intro && <p className="leading-relaxed">{intro}</p>}
        {bullets.length > 0 && (
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {bullets.map((line, j) => (
              <li key={j}>{line.slice(2)}</li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
