import { notFound } from "next/navigation";
import { UserActions } from "@/components/admin/user-actions";
import { BackLink } from "@/components/back-link";
import { Fields, Section } from "@/components/document";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EMIRATES, EXPERTISE, FUNDER_TYPES, ROLE_LABELS, SECTORS, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatAedRange, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";

export const metadata = { title: "Review user" };

/** The administrator reads a user's profile before approving or suspending the account. */
export default async function AdminUserPage({ params }) {
  const admin = await requireUser({ roles: ["admin"] });
  const { id } = await params;

  await connectDB();
  const user = await User.findById(id).select("name email role status createdAt").lean().catch(() => null);
  if (!user) notFound();
  const Profile = user.role === "mentor" ? MentorProfile : user.role === "funder" ? FunderProfile : null;
  const profile = Profile && (await Profile.findOne({ userId: id }).lean());
  const canChange = user.role !== "admin" && id !== admin.id;

  const rows =
    user.role === "mentor" && profile
      ? [
          ["Headline", profile.headline],
          ["Experience", `${profile.yearsExperience} years`],
          ["Can help with", profile.expertise.map((a) => labelOf(EXPERTISE, a)).join(", ")],
          ["Emirates", profile.emirates.map((e) => labelOf(EMIRATES, e)).join(", ")],
          ["LinkedIn", profile.linkedinUrl ?? "Not given"],
          ["About", profile.bio],
        ]
      : user.role === "funder" && profile
        ? [
            ["Organisation", profile.organization],
            ["Type", labelOf(FUNDER_TYPES, profile.funderType)],
            ["Invests", formatAedRange(profile.ticketMinAed, profile.ticketMaxAed)],
            ["Sectors", profile.sectors.map((s) => labelOf(SECTORS, s)).join(", ")],
            ["What they look for", profile.bio],
          ]
        : [];

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/users">All users</BackLink>
      <PageHeader title={user.name} />

      <Fields
        items={[
          { label: "Email", value: <span className="wrap-anywhere">{user.email}</span> },
          { label: "Role", value: ROLE_LABELS[user.role] },
          { label: "Status", value: <StatusBadge status={user.status} /> },
          { label: "Joined", value: formatDate(user.createdAt) },
        ]}
      />

      {canChange && <UserActions userId={id} status={user.status} className="mt-6 justify-start" />}

      {Profile && (
        <Section title="Profile" className="mt-10">
          {profile ? (
            <dl className="divide-y border-y">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-6">
                  <dt className="field-label">{label}</dt>
                  <dd className="whitespace-pre-line wrap-anywhere">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted-foreground">This user has not filled in a profile yet.</p>
          )}
        </Section>
      )}
    </div>
  );
}
