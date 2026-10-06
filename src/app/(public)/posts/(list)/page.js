import { CardGrid } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/posts/post-card";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "Experience posts" };

export default async function PostsPage() {
  await connectDB();
  const posts = toPlain(await Post.find({ status: "published" }).sort({ createdAt: -1 }).limit(50).populate("authorId", "name").lean());

  return (
    <>
      <PageHeader title="Experience posts" description="Mentors share what they learned starting and running businesses in the UAE." />
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" text="Mentors' stories appear here." />
      ) : (
        <CardGrid className="grid-cols-1">
          {posts.map((post) => (
            <li key={post._id}>
              <PostCard post={post} authorName={post.authorId?.name ?? "A mentor"} />
            </li>
          ))}
        </CardGrid>
      )}
    </>
  );
}
