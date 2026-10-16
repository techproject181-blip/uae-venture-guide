"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest, useApiMutation } from "@/lib/query";

/** Signs out, then goes to the sign-in page. `pending` is true while it runs. */
export function useSignOut() {
  const router = useRouter();
  const { mutateAsync, isPending, isSuccess } = useApiMutation(() => apiRequest("POST", "/api/auth/sign-out"));
  // Stays busy after success too, until the sign-in page has loaded.
  const pending = isPending || isSuccess;

  async function signOut() {
    const result = await mutateAsync();
    // If the cookie was not removed, the user is still signed in, so stay on this page.
    if (!result.ok) {
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
