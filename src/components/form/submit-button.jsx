"use client";

import { useSyncExternalStore } from "react";
import { Spinner } from "@/components/loaders/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const noSubscription = () => () => {};

/** False in the HTML the server sends, true once the page's JavaScript is running. */
function useReady() {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

/**
 * A form's main button. It stays disabled until the page's JavaScript is
 * running: pressed earlier, the browser would send the form by itself, with
 * the typed values (a password too) in the address. While the form is
 * sending, it shows a spinner and cannot be pressed twice.
 */
export function SubmitButton({ pending, pendingText, children, className, ...props }) {
  const ready = useReady();
  return (
    // Before the page is ready the button looks normal (it is only faded while sending).
    <Button type="submit" size="lg" disabled={pending || !ready} className={cn(!ready && "disabled:opacity-100", className)} {...props}>
      {pending && <Spinner />}
      {pending ? pendingText : children}
    </Button>
  );
}
