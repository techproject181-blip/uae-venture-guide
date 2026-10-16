import { Bone, HeaderSkeleton, SkeletonPage, TableSkeleton, TabsSkeleton } from "@/components/skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-64" lines={2} />
      <TabsSkeleton tabs={4} right={<Bone className="h-9 w-32 rounded-lg" />} />
      <TableSkeleton
        columns={[
          { head: "w-16" },
          { hide: "hidden md:table-cell", width: "w-20" },
          { width: "w-16" },
          { hide: "hidden md:table-cell", width: "w-24" },
          { hide: "hidden md:table-cell", width: "w-6" },
        ]}
      />
    </SkeletonPage>
  );
}
