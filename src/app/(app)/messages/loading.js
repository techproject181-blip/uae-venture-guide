import { HeaderSkeleton, RowsSkeleton, SkeletonPage } from "@/components/skeleton";

// Shown while the page loads: the header, then the conversation rows.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-40" />
      <div className="panel overflow-hidden">
        <RowsSkeleton rows={4} padded />
      </div>
    </SkeletonPage>
  );
}
