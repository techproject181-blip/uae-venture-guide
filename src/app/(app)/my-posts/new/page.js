import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { PostForm } from "@/components/posts/post-form";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireUser({ roles: ["mentor"] });
  return (
    <div className="max-w-3xl">
      <BackLink href="/my-posts">My posts</BackLink>
      <PageHeader title="Write an experience post" />
      <PostForm />
    </div>
  );
}
