import { CardGridSkeleton, CountSkeleton, FilterSkeleton, HeaderSkeleton, SkeletonPage, SourceCardSkeleton } from "@/components/skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-64" lines={2} />
      <FilterSkeleton fields={3} grid="md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_8rem]" />
      <CountSkeleton />
      <CardGridSkeleton card={SourceCardSkeleton} />
    </SkeletonPage>
  );
}
