import { notFound } from "next/navigation";
import { PageHeader, Split } from "@/components/layout";
import { PostForm } from "@/components/posts/post-form";
import { PostFormHelp } from "@/components/posts/post-form-help";
import { StatusBadge } from "@/components/status-badge";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { Post } from "@/models/Post";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }) {
  const user = await requireUser({ roles: ["mentor"] });
  const { id } = await params;
  await connectDB();
  const post = await Post.findOne({ _id: id, authorId: user.id })
    .lean()
    .catch(() => null);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        back={{ href: `/posts/${id}`, label: "Back to the post" }}
        title="Edit your post"
        description={`Published ${formatDate(post.createdAt)}.`}
      >
        {post.status === "hidden" && <StatusBadge status="hidden" label="Hidden by administrator" />}
      </PageHeader>
      <Split aside={<PostFormHelp />}>
        <PostForm post={toPlain(post)} />
      </Split>
    </>
  );
}
