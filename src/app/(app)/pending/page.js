import Link from "next/link";
import { redirect } from "next/navigation";
import { Fields } from "@/components/document";
import { PageHeader, Panel, Split } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";

export const metadata = { title: "Waiting for approval" };

const linkClass = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

export default async function PendingPage() {
  const user = await requireUser({ allowPending: true });
  if (user.status === "active") redirect("/dashboard");

  // Only mentors and funders wait for approval, and both have a profile to fill in.
  const Profile = user.role === "funder" ? FunderProfile : user.role === "mentor" ? MentorProfile : null;
  await connectDB();
  const profile = Profile ? await Profile.findOne({ userId: user.id }).select("updatedAt").lean() : null;

  const steps = [
    { title: "Complete your profile", text: "Tell the administrator who you are and how you can help founders." },
    { title: "An administrator reviews it", text: `Every ${user.role} account is checked by hand before it can be used.` },
    { title: "You get an email", text: "Once your account is approved, we email you a link to sign in and start." },
  ];

  return (
    <>
      <PageHeader
        title="Your account is waiting for approval"
        description={`An administrator checks every ${user.role} account before it can be used.`}
      />
      <Split
        aside={
          <>
            <Panel title="What happens next">
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground tabular-nums"
                    >
                      {index + 1}
                    </span>
                    <div className="pt-0.5">
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
            <Panel title="While you wait">
              <p className="text-sm text-muted-foreground">These pages are open to everyone:</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="/sources" className={`inline-flex min-h-11 items-center ${linkClass}`}>
                    Official sources
                  </Link>
                </li>
                <li>
                  <Link href="/mentors" className={`inline-flex min-h-11 items-center ${linkClass}`}>
                    Mentors
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className={`inline-flex min-h-11 items-center ${linkClass}`}>
                    Experience posts
                  </Link>
                </li>
              </ul>
            </Panel>
          </>
        }
      >
        <Panel title="Your account">
          <Fields
            items={[
              { label: "Name", value: user.name },
              { label: "Account", value: ROLE_LABELS[user.role] },
              { label: "Status", value: <StatusBadge status="pending" label="Waiting" /> },
            ]}
          />
        </Panel>
        <Panel
          title="Your profile"
          footer={
            <Link href="/profile" className={buttonVariants({ size: "lg" })}>
              {profile ? "Edit your profile" : "Complete your profile"}
            </Link>
          }
        >
          {profile ? (
            <p>
              Your profile is saved (last changed {formatDate(profile.updatedAt)}). You can still improve it while you wait.
            </p>
          ) : (
            <p>While you wait, complete your profile so the administrator can review it.</p>
          )}
        </Panel>
      </Split>
    </>
  );
}
