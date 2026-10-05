"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ConfirmContext = createContext(null);

/**
 * Lets any button ask "Are you sure?" in the app's own dialog instead of the
 * browser's grey box. Wrap the app in <ConfirmProvider>, then:
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "Hide this post?", description: "…", confirmLabel: "Hide", danger: true }))) return;
 */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    setRequest(options);
    setOpen(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function close(answer) {
    resolver.current?.(answer);
    resolver.current = null;
    setOpen(false);
  }

  const danger = Boolean(request?.danger);
  const Icon = danger ? AlertTriangle : HelpCircle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={open} onOpenChange={(next) => !next && close(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-window transition-[opacity,scale] duration-200 ease-out outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="flex gap-4">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  danger ? "bg-danger-50 text-danger-700" : "bg-accent text-primary",
                )}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <AlertDialog.Title className="text-lg font-semibold">{request?.title}</AlertDialog.Title>
                {request?.description && <AlertDialog.Description className="mt-1.5 text-muted-foreground">{request.description}</AlertDialog.Description>}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Close render={<Button variant="outline" size="lg" />}>{request?.cancelLabel ?? "Cancel"}</AlertDialog.Close>
              <Button
                size="lg"
                autoFocus
                onClick={() => close(true)}
                className={danger ? "border-danger-700 bg-danger-700 text-primary-foreground shadow-none hover:bg-danger-700/90" : undefined}
              >
                {request?.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}

/** Returns confirm(options), which resolves to true when the user agrees. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <ConfirmProvider>.");
  return confirm;
}
