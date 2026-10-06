import { notFound } from "next/navigation";
import { UserActions } from "@/components/admin/user-actions";
import { Fields } from "@/components/document";
import { Panel, Split } from "@/components/layout";
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
  const user = await User.findById(id)
    .select("name email role status createdAt")
    .lean()
    .catch(() => null);
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

  const statusNote = {
    pending: "Until you approve it, this user can only fill in their profile.",
    active: "This account can sign in and use the app.",
    suspended: "This account cannot sign in.",
  }[user.status];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/users", label: "All users" }}
        title={user.name}
        description={`${ROLE_LABELS[user.role]} · joined ${formatDate(user.createdAt)}`}
        actions={canChange && <UserActions userId={id} status={user.status} className="justify-start" />}
      >
        <StatusBadge status={user.status} />
      </PageHeader>

      <Split
        aside={
          <>
            <Panel title="Account status">
              {statusNote && <p className="text-sm text-muted-foreground">{statusNote}</p>}
              {canChange ? (
                <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
                  <div>
                    <dt className="font-medium">Approve</dt>
                    <dd className="text-muted-foreground">Makes the account active and emails the user that they can sign in.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Reject or Suspend</dt>
                    <dd className="text-muted-foreground">Suspends the account. The user is signed out at once and cannot sign in.</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Reactivate</dt>
                    <dd className="text-muted-foreground">Makes a suspended account active again.</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {user.role === "admin" ? "Administrator accounts cannot be changed here." : "You cannot change your own account."}
                </p>
              )}
            </Panel>
          </>
        }
      >
        <Panel title="Account">
          <Fields
            items={[
              { label: "Email", value: <span className="wrap-anywhere">{user.email}</span> },
              { label: "Role", value: ROLE_LABELS[user.role] },
              { label: "Joined", value: formatDate(user.createdAt) },
            ]}
          />
        </Panel>

        {Profile && (
          <Panel
            title="Profile"
            description={
              user.role === "mentor" ? "What founders see in the mentor directory." : "What owners read when this funder sends interest."
            }
            flush={Boolean(profile)}
          >
            {profile ? (
              <dl className="divide-y">
                {rows.map(([label, value]) => (
                  <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-6 sm:px-6">
                    <dt className="field-label">{label}</dt>
                    <dd className="whitespace-pre-line wrap-anywhere">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted-foreground">This user has not filled in a profile yet.</p>
            )}
          </Panel>
        )}
      </Split>
    </>
  );
}
