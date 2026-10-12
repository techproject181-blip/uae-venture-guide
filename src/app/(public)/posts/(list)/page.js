import { CardGrid } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/posts/post-card";
import { toPlain } from "@/lib/api";
import { listPosts, POSTS_PER_PAGE } from "@/lib/community";

export const metadata = { title: "Experience posts" };

export default async function PostsPage({ searchParams }) {
  const params = await searchParams;
  const found = await listPosts({ page: Math.max(1, Number.parseInt(params.page, 10) || 1) });
  const { total, page } = found;
  const posts = toPlain(found.posts);

  return (
    <>
      <PageHeader title="Experience posts" description="Mentors share what they learned starting and running businesses in the UAE." />
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" text="Mentors' stories appear here." />
      ) : (
        <>
          <CardGrid className="grid-cols-1">
            {posts.map((post) => (
              <li key={post._id}>
                <PostCard post={post} authorName={post.authorId?.name ?? "A mentor"} />
              </li>
            ))}
          </CardGrid>
          <Pagination page={page} total={total} pageSize={POSTS_PER_PAGE} href={(n) => (n > 1 ? `/posts?page=${n}` : "/posts")} />
        </>
      )}
    </>
  );
}
