import { PageHeader } from "@/components/page-header";
import { FunderProfileForm, MentorProfileForm } from "@/components/profile/profile-forms";
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
  const profile = await Profile.findOne({ userId: user.id }).lean();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Your profile"
        description={
          isMentor
            ? "Founders see this in the mentor directory before they ask you for guidance."
            : "Plan owners see this when you send them an interest request."
        }
      />
      {user.status === "pending" && (
        <div className="mb-8 flex flex-col items-start gap-2 rounded-xl border border-primary/15 bg-accent px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
          <StatusBadge status="pending" label="Waiting for approval" />
          <p className="text-sm">The administrator reads this profile before approving your account.</p>
        </div>
      )}
      {isMentor ? (
        <MentorProfileForm name={user.name} profile={profile && toPlain(profile)} />
      ) : (
        <FunderProfileForm name={user.name} profile={profile && toPlain(profile)} />
      )}
    </div>
  );
}
