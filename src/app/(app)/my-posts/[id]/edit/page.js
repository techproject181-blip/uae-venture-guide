import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { PostForm } from "@/components/posts/post-form";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { Post } from "@/models/Post";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }) {
  const user = await requireUser({ roles: ["mentor"] });
  const { id } = await params;
  await connectDB();
  const post = await Post.findOne({ _id: id, authorId: user.id }).lean().catch(() => null);
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <BackLink href={`/posts/${id}`}>Back to the post</BackLink>
      <PageHeader title="Edit your post" />
      <PostForm post={toPlain(post)} />
    </div>
  );
}
