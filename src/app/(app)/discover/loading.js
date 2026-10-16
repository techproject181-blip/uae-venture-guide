import { CardGridSkeleton, CountSkeleton, FilterSkeleton, HeaderSkeleton, PitchCardSkeleton, SkeletonPage } from "@/components/skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-40" lines={2} />
      <FilterSkeleton grid="md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem]" />
      <CountSkeleton />
      <CardGridSkeleton cols={2} count={4} card={PitchCardSkeleton} />
    </SkeletonPage>
  );
}
