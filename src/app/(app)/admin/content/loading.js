import { HeaderSkeleton, SkeletonPage, TableSkeleton, TabsSkeleton } from "@/components/skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-36" lines={2} />
      <TabsSkeleton tabs={2} right={<TabsSkeleton tabs={2} />} />
      <TableSkeleton
        columns={[
          { head: "w-12" },
          { hide: "hidden md:table-cell", width: "w-24" },
          { hide: "hidden lg:table-cell", width: "w-24" },
          { hide: "hidden sm:table-cell", width: "w-16" },
          { width: "w-16" },
        ]}
      />
    </SkeletonPage>
  );
}
