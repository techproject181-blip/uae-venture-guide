import { AccountDetailsForm, ChangePasswordForm } from "@/components/account/account-forms";
import { PageHeader, Panel, Stack } from "@/components/layout";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { User } from "@/models/User";

export const metadata = { title: "Account" };

/** Every role can change their name and password here. */
export default async function AccountPage() {
  const user = await requireUser({ allowPending: true });
  await connectDB();
  const account = await User.findById(user.id).select("name email role").lean();

  return (
    <>
      <PageHeader title="Account" description={`Your name, email and password. Role: ${ROLE_LABELS[account.role]}.`} />
      <Stack className="max-w-2xl">
        <Panel title="Your details">
          <AccountDetailsForm name={account.name} email={account.email} />
        </Panel>
        <Panel title="Password" description="Use at least 8 characters, with a letter and a number.">
          <ChangePasswordForm />
        </Panel>
      </Stack>
    </>
  );
}
