import { PageHeader, Split } from "@/components/layout";
import { FunderProfileForm, MentorProfileForm } from "@/components/profile/profile-forms";
import { ProfileAside } from "@/components/profile/profile-preview";
import { StatusBadge } from "@/components/status-badge";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";

export const metadata = { title: "Your profile" };

/** Mentors and funders edit their profile here, also while they wait for approval. */
export default async function ProfilePage() {
  const user = await requireUser({ roles: ["mentor", "funder"], allowPending: true });
  const isMentor = user.role === "mentor";

  await connectDB();
  const Profile = isMentor ? MentorProfile : FunderProfile;
  const found = await Profile.findOne({ userId: user.id }).lean();
  const profile = found && toPlain(found);

  return (
    <>
      <PageHeader
        title="Your profile"
        description={
          isMentor
            ? "Founders see this in the mentor directory before they ask you for guidance."
            : "Plan owners see this when you send them an interest request."
        }
      >
        {user.status === "pending" && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <StatusBadge status="pending" label="Waiting for approval" />
            The administrator reads this profile before approving your account.
          </p>
        )}
      </PageHeader>
      <Split aside={<ProfileAside role={user.role} name={user.name} profile={profile} />}>
        {isMentor ? <MentorProfileForm name={user.name} profile={profile} /> : <FunderProfileForm name={user.name} profile={profile} />}
      </Split>
    </>
  );
}
