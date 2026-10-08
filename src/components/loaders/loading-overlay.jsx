"use client";

import { createPortal } from "react-dom";
import { Spinner } from "@/components/loaders/spinner";

/**
 * Covers the whole screen with a soft veil and a spinner while something
 * finishes, such as signing in. It is drawn on <body> rather than where it is
 * written: inside a form it was measured 20px short of the screen, leaving a
 * strip along the bottom uncovered.
 */
export function LoadingOverlay({ label = "Loading…" }) {
  // It only appears once a form is busy, so there is always a document by then.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 text-sm font-medium shadow-window">
        <Spinner className="size-5 text-primary" />
        <span>{label}</span>
      </div>
    </div>,
    document.body,
  );
}
