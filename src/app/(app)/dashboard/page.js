import { Suspense } from "react";
import { AdminOverview } from "@/components/admin/admin-overview";
import { EntrepreneurDashboard, FunderDashboard, MentorDashboard } from "@/components/dashboard/role-dashboards";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "Dashboard" };

const DASHBOARDS = {
  entrepreneur: EntrepreneurDashboard,
  mentor: MentorDashboard,
  funder: FunderDashboard,
  admin: AdminOverview,
};

/**
 * Each role's dashboard draws its own greeting, so the line under it can say what matters to that role.
 * Each role's dashboard also has its own shape, so its loading outline is chosen here, once the role is known
 * (loading.js cannot know it, and only covers the moment before).
 */
export default async function DashboardPage() {
  const user = await requireUser();
  const Dashboard = DASHBOARDS[user.role];

  return (
    <Suspense fallback={<DashboardSkeleton role={user.role} />}>
      <Dashboard user={user} />
    </Suspense>
  );
}
