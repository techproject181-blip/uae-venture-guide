import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { CardGrid } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/posts/post-card";
import { StatusBadge } from "@/components/status-badge";
import { DeleteButton } from "@/components/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Post } from "@/models/Post";

export const metadata = { title: "My posts" };

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
        <CardGrid className="grid-cols-1">
          {posts.map((post) => (
            <li key={post._id}>
              <PostCard
                post={post}
                badge={post.status === "hidden" && <StatusBadge status="hidden" label="Hidden by administrator" />}
                actions={
                  <div className="-my-2 flex items-center gap-1">
                    <Link href={`/my-posts/${post._id}/edit`} className={buttonVariants({ variant: "ghost", size: "lg", className: "px-3 text-sm text-muted-foreground" })}>
                      <Pencil aria-hidden="true" />
                      Edit
                      <span className="sr-only">{post.title}</span>
                    </Link>
                    <DeleteButton url={`/api/posts/${post._id}`} confirmText={`“${post.title}” is deleted for good.`} doneText="Post deleted." size="default" />
                  </div>
                }
              />
            </li>
          ))}
        </CardGrid>
      )}
    </>
  );
}
