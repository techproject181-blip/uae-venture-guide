import { PageSkeleton } from "@/components/loaders/page-skeleton";

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return <PageSkeleton variant="list" />;
}
