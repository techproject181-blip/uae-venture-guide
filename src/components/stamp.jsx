import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// One legend for the whole app. Each tone means one thing everywhere: a soft tint for the label and a stronger dot.
const TONES = {
  official: { box: "bg-seal-surface text-seal-ink ring-seal/25", dot: null }, // a fee checked against an official page, with a tick
  done: { box: "bg-done-surface text-done ring-done/20", dot: "bg-done" }, // finished, approved or accepted
  waiting: { box: "bg-gold-50 text-gold-800 ring-gold-400/40", dot: "bg-gold-500" }, // waiting for someone
  stopped: { box: "bg-destructive-surface text-destructive ring-destructive/20", dot: "bg-destructive" }, // declined, suspended, hidden or failed
  quiet: { box: "bg-ink-50 text-ink-700 ring-ink-200", dot: "bg-ink-400" }, // not started, or just a note
};

/**
 * A small status label, such as Official or Done. The words always say
 * what it means, so colour is never the only signal. `pressed` plays the
 * stamping movement once, when a step has just been marked done.
 */
export function Stamp({ tone = "quiet", pressed = false, className, children }) {
  const { box, dot } = TONES[tone] ?? TONES.quiet;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs leading-none font-medium whitespace-nowrap ring-1 ring-inset",
        box,
        pressed && "stamp-press",
        className,
      )}
    >
      {dot ? (
        <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      ) : (
        <Check className="size-3 shrink-0" strokeWidth={3} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
