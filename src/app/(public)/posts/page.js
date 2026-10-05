import { EmptyState, PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/posts/post-card";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "Experience posts" };

export default async function PostsPage() {
  await connectDB();
  const posts = toPlain(
    await Post.find({ status: "published" }).sort({ createdAt: -1 }).limit(50).populate("authorId", "name").lean(),
  );

  return (
    <div className="max-w-3xl">
      <PageHeader title="Experience posts" description="Mentors share what they learned starting and running businesses in the UAE." />
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" text="Mentors' stories appear here." />
      ) : (
        <ul className="-mt-3 divide-y border-b">
          {posts.map((post) => (
            <li key={post._id}>
              <PostCard post={post} authorName={post.authorId?.name ?? "A mentor"} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
