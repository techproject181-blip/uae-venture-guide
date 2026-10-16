import { HeaderSkeleton, PanelHeadSkeleton, RowsSkeleton, SkeletonPage } from "@/components/skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-48" lines={2} />
      {/* Both roles see the guidance requests panel: rows with buttons on the right. */}
      <div className="panel overflow-hidden">
        <PanelHeadSkeleton titleWidth="w-44" description />
        <RowsSkeleton rows={4} right="button" padded />
      </div>
    </SkeletonPage>
  );
}
