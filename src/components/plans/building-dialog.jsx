"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { RoadLoader } from "@/components/loaders/road-loader";

/**
 * While a roadmap is being built again (a new version, or "Try again" on a
 * failed plan), the road animation from the new-plan page sits in the middle
 * of the screen over a dimmed page, so it is clear the app is working. It has
 * no close button and Escape does nothing: it goes away by itself once the
 * roadmap is ready, which takes up to a minute with the AI.
 */
export function BuildingDialog({ open, title }) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card px-6 py-8 text-center shadow-window transition-[opacity,scale] duration-200 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <RoadLoader label="Finding the steps, fees and documents for your business…" className="mt-6" />
          <AlertDialog.Description className="mt-4 text-sm text-muted-foreground">
            This can take up to a minute. Please keep this page open.
          </AlertDialog.Description>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
