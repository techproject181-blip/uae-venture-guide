import { PageHeader, Split } from "@/components/layout";
import { PostForm } from "@/components/posts/post-form";
import { PostFormHelp } from "@/components/posts/post-form-help";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireUser({ roles: ["mentor"] });
  return (
    <>
      <PageHeader
        back={{ href: "/my-posts", label: "My posts" }}
        title="Write an experience post"
        description="A lesson from your own business, for founders starting out in the UAE."
      />
      <Split aside={<PostFormHelp />}>
        <PostForm />
      </Split>
    </>
  );
}
