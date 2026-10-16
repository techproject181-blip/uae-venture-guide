import { Bone, HeaderSkeleton, SkeletonPage, TableSkeleton, TabsSkeleton } from "@/components/skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-28" />
      <TabsSkeleton tabs={5} right={<Bone className="h-9 w-full rounded-lg md:w-72" />} />
      <TableSkeleton
        avatar
        columns={[
          { head: "w-12" },
          { hide: "hidden md:table-cell", width: "w-20" },
          { hide: "hidden md:table-cell", width: "w-20" },
          { hide: "hidden md:table-cell", width: "w-24" },
          { width: "w-28" },
        ]}
      />
    </SkeletonPage>
  );
}
