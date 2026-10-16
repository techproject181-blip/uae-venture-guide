import {
  Bone,
  HeaderSkeleton,
  Line,
  ListPanelSkeleton,
  PanelHeadSkeleton,
  ShortcutsSkeleton,
  SkeletonPage,
  SplitSkeleton,
  StatGridSkeleton,
} from "@/components/skeleton";

// The dashboard's loading screen. Each role sees a different dashboard
// (role-dashboards.jsx and admin-overview.jsx), so each gets its own outline.

/** The "Next step" panel: a title, one line and a full-width button. */
function NextStepSkeleton() {
  return (
    <div className="panel overflow-hidden">
      <PanelHeadSkeleton titleWidth="w-20" />
      <div className="p-5 sm:p-6">
        <Line width="w-3/4" />
        <Line className="mt-1.5 text-sm" width="w-1/2" />
        <Bone className="mt-5 h-11 rounded-lg" />
      </div>
    </div>
  );
}

/** The mentor's "Taking new requests" switch. */
function SwitchSkeleton() {
  return (
    <div className="panel flex items-center justify-between gap-4 p-5">
      <div className="min-w-0 flex-1">
        <Line width="w-36" />
        <Line className="mt-0.5 text-sm" width="w-48" />
      </div>
      <Bone className="h-6 w-11 shrink-0 rounded-full" />
    </div>
  );
}

function RoleSkeleton({ role }) {
  return (
    <>
      <HeaderSkeleton actions={1} />
      <StatGridSkeleton />
      {role === "entrepreneur" && (
        <SplitSkeleton
          aside={
            <>
              <NextStepSkeleton />
              <ShortcutsSkeleton />
            </>
          }
        >
          <ListPanelSkeleton rows={3} right="bar" action={false} />
        </SplitSkeleton>
      )}
      {role === "mentor" && (
        <SplitSkeleton
          aside={
            <>
              <SwitchSkeleton />
              <ShortcutsSkeleton />
            </>
          }
        >
          <ListPanelSkeleton rows={3} right="badge" />
          <ListPanelSkeleton rows={3} right="none" description />
        </SplitSkeleton>
      )}
      {role === "funder" && (
        <SplitSkeleton aside={<ShortcutsSkeleton />}>
          <ListPanelSkeleton rows={3} right="badge" />
          <ListPanelSkeleton rows={3} right="bar" />
        </SplitSkeleton>
      )}
    </>
  );
}

/** The admin overview's title row for each box. */
function CardHead({ width = "w-36" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-5 py-3.5">
      <Line className="text-[0.9375rem]" width={width} />
    </div>
  );
}

function AdminSkeleton() {
  return (
    <>
      <HeaderSkeleton titleWidth="w-40" actions={1} />
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="panel flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <Line className="text-sm" width="w-32" />
              <Bone className="size-9 rounded-lg" />
            </div>
            <div>
              <Line className="font-display text-3xl leading-none" width="w-12" />
              <Line className="mt-2 text-sm" width="w-40" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="panel overflow-hidden">
            <CardHead />
            <ul className="divide-y">
              {[0, 1, 2].map((n) => (
                <li key={n} className="flex items-center gap-3 px-5 py-3.5">
                  <Bone className="size-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Line width="w-36" />
                    <Line className="text-sm" width="w-56" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel overflow-hidden">
            <CardHead width="w-32" />
            <ul className="divide-y">
              {[0, 1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-center gap-3 px-5 py-3 sm:pl-6">
                  <Bone className="hidden size-8 shrink-0 rounded-full sm:block" />
                  <div className="min-w-0 flex-1 text-sm">
                    <Line width="w-36" />
                    <Line width="w-52" />
                  </div>
                  <Bone className="h-5 w-16 shrink-0 rounded-md" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel overflow-hidden">
            <CardHead width="w-32" />
            <div className="space-y-3 px-5 py-4">
              {[0, 1, 2, 3].map((n) => (
                <div key={n}>
                  <Line className="text-sm" width="w-24" />
                  <Bone className="mt-1.5 h-1.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="panel overflow-hidden">
            <CardHead />
            <div className="divide-y text-sm">
              {[0, 1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center justify-between px-5 py-3">
                  <Line width="w-36" />
                  <Line width="w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** The outline of the signed-in user's own dashboard. */
export function DashboardSkeleton({ role }) {
  return <SkeletonPage>{role === "admin" ? <AdminSkeleton /> : <RoleSkeleton role={role} />}</SkeletonPage>;
}
