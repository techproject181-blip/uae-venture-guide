"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/form-helpers";

/** Signs out, then goes to the sign-in page. `pending` is true while it runs. */
export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const result = await postJson("/api/auth/sign-out");
    // If the cookie was not removed, the user is still signed in, so stay on this page.
    if (!result.ok) {
      setPending(false);
      toast.error(result.error ?? "Could not sign out. Please try again.");
      return;
    }
    router.replace("/sign-in");
    router.refresh();
  }

  return { signOut, pending };
}

export function SignOutButton({ className }) {
  const { signOut, pending } = useSignOut();

  return (
    <Button variant="outline" size="lg" onClick={signOut} disabled={pending} className={className}>
      <LogOut aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
