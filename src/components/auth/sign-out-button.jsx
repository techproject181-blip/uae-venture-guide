"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/form-helpers";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await postJson("/api/auth/sign-out");
    router.replace("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="lg" onClick={signOut} disabled={pending} className="max-sm:h-10 max-sm:px-3 max-sm:[&_svg]:hidden">
      <LogOut aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
