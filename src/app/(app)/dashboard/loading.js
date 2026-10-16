import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// Shown for the moment before the page knows the user's role. The page then
// swaps in that role's own outline (see page.js), which starts the same way:
// a greeting with one button, then four numbers.
export default function Loading() {
  return <DashboardSkeleton />;
}
