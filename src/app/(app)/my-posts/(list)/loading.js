import { CardGridSkeleton, HeaderSkeleton, PostCardSkeleton, SkeletonPage } from "@/components/skeleton";

/** The writer's own list leaves out the author line. */
function OwnPostSkeleton() {
  return <PostCardSkeleton author={false} />;
}

// Shown while the page loads. It sits in its own folder, so it covers only this
// page: a loading screen above a page that can answer "not found" would make
// that page answer 200 instead of 404.
export default function Loading() {
  return (
    <SkeletonPage>
      <HeaderSkeleton titleWidth="w-40" actions={1} />
      <CardGridSkeleton card={OwnPostSkeleton} />
    </SkeletonPage>
  );
}
