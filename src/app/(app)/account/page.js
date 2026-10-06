import { BadgeCheck, CalendarDays, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { AccountDetailsForm, ChangePasswordForm } from "@/components/account/account-forms";
import { Avatar } from "@/components/avatar";
import { PageHeader } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { User } from "@/models/User";

export const metadata = { title: "Profile" };

/** A settings card: an icon, a title and a line under it, then the form. */
function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Every role can see their profile and change their name and password here. */
export default async function AccountPage() {
  const user = await requireUser({ allowPending: true });
  await connectDB();
  const account = await User.findById(user.id).select("name email role status createdAt").lean();

  return (
    <>
      <PageHeader title="Profile" description="Your details and how you sign in." />

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr]">
        <aside className="panel overflow-hidden lg:sticky lg:top-24">
          <div className="h-20 bg-accent" />
          <div className="-mt-10 px-5 pb-5">
            <Avatar name={account.name} className="size-20 border-4 border-card text-xl" />
            <p className="mt-3 text-lg font-semibold">{account.name}</p>
            <p className="truncate text-sm text-muted-foreground">{account.email}</p>
          </div>
          <dl className="divide-y border-t text-sm">
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Role
              </dt>
              <dd className="font-medium">{ROLE_LABELS[account.role]}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="size-4" aria-hidden="true" />
                Status
              </dt>
              <dd>
                <StatusBadge status={account.status} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                Member since
              </dt>
              <dd className="font-medium">{formatDate(account.createdAt)}</dd>
            </div>
          </dl>
        </aside>

        <div className="space-y-6">
          <SettingsCard icon={UserRound} title="Personal details" description="The name other people see on your plans, requests and messages.">
            <AccountDetailsForm name={account.name} email={account.email} />
          </SettingsCard>
          <SettingsCard icon={KeyRound} title="Password" description="Changing it signs you out on your other devices. You stay signed in here.">
            <ChangePasswordForm />
          </SettingsCard>
        </div>
      </div>
    </>
  );
}
