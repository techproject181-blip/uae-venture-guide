import { AdminOverview } from "@/components/admin/admin-overview";
import { EntrepreneurDashboard, FunderDashboard, MentorDashboard } from "@/components/dashboard/role-dashboards";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "Dashboard" };

const DASHBOARDS = {
  entrepreneur: EntrepreneurDashboard,
  mentor: MentorDashboard,
  funder: FunderDashboard,
  admin: AdminOverview,
};

/** Each role's dashboard draws its own greeting, so the line under it can say what matters to that role. */
export default async function DashboardPage() {
  const user = await requireUser();
  const Dashboard = DASHBOARDS[user.role];

  return <Dashboard user={user} />;
}
