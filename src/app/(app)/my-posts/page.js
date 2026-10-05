import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { Post } from "@/models/Post";

export const metadata = { title: "My posts" };

/** "12 Sep 2026 · 2 pictures · Chart" */
function postDetails(post) {
  const pictures = post.images?.length ?? 0;
  return [formatDate(post.createdAt), pictures > 0 && `${pictures} ${pictures === 1 ? "picture" : "pictures"}`, post.chart && "Chart"]
    .filter(Boolean)
    .join(" · ");
}

export default async function MyPostsPage() {
  const user = await requireUser({ roles: ["mentor"] });
  await connectDB();
  const posts = toPlain(await Post.find({ authorId: user.id }).sort({ createdAt: -1 }).lean());

  const newPost = (
    <Link href="/my-posts/new" className={buttonVariants({ size: "lg" })}>
      <Plus aria-hidden="true" />
      New post
    </Link>
  );

  return (
    <>
      <PageHeader title="My posts" description="Share what you learned, so new founders can avoid the same mistakes." actions={posts.length > 0 && newPost} />
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" text="Write about a lesson from your own business journey." action={newPost} />
      ) : (
        <ul className="divide-y border-b">
          {posts.map((post) => (
            // The title link's ::after covers the row, so the whole row opens the post.
            <li key={post._id} className="relative flex flex-col items-start gap-2 py-5 first:pt-0 sm:flex-row sm:justify-between sm:gap-8">
              <div className="min-w-0">
                <h2 className="text-lg">
                  <Link
                    href={`/posts/${post._id}`}
                    className="rounded-xs text-foreground decoration-primary underline-offset-4 outline-none after:absolute after:inset-0 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground tabular-nums">{postDetails(post)}</p>
              </div>
              {post.status === "hidden" && <StatusBadge status="hidden" label="Hidden by administrator" />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
