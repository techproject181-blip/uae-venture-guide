import Link from "next/link";
import { redirect } from "next/navigation";
import { Fields } from "@/components/document";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "Waiting for approval" };

export default async function PendingPage() {
  const user = await requireUser({ allowPending: true });
  if (user.status === "active") redirect("/dashboard");

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Your account is waiting for approval"
        description={`An administrator checks every ${user.role} account before it can be used.`}
      />
      <Fields
        items={[
          { label: "Name", value: user.name },
          { label: "Account", value: ROLE_LABELS[user.role] },
          { label: "Status", value: <StatusBadge status="pending" label="Waiting" /> },
        ]}
      />
      <p className="mt-8">While you wait, complete your profile so the administrator can review it.</p>
      <Link href="/profile" className={buttonVariants({ size: "lg", className: "mt-4" })}>
        Complete your profile
      </Link>
    </div>
  );
}
