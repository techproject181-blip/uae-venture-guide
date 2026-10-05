import { cn } from "@/lib/utils";

// One legend for the whole app. Each tone means one thing everywhere:
const TONES = {
  official: "border-double border-[3px] border-seal bg-seal-surface text-seal-ink", // a fee checked against an official page: a double-ruled seal
  done: "border-done bg-done-surface text-done", // finished, approved or accepted
  waiting: "border-slate-400 bg-slate-50 text-slate-700", // waiting for someone
  stopped: "border-destructive bg-destructive-surface text-destructive", // declined, suspended, hidden or failed
  quiet: "border-border text-muted-foreground", // not started, or just a note
};

/**
 * A small rubber-stamp label, such as OFFICIAL or DONE. The words always say
 * what it means, so colour is never the only signal. `pressed` plays the
 * stamping movement once, when a step has just been marked done.
 */
export function Stamp({ tone = "quiet", pressed = false, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border-[1.5px] px-1.5 py-[3px] text-[0.6875rem] leading-none font-bold tracking-[0.08em] whitespace-nowrap uppercase",
        TONES[tone],
        pressed && "stamp-press",
        className,
      )}
    >
      {children}
    </span>
  );
}
