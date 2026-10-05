import { cn } from "@/lib/utils";

/** A small spinner for busy buttons: an arc that runs round and stretches. It takes the colour of the text around it. */
export function Spinner({ className }) {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true" className={cn("spinner size-4", className)}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.25" />
      <circle className="spinner-arc" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
