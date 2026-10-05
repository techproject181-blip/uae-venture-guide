import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { DeleteButton } from "@/components/delete-button";
import { Fields } from "@/components/document";
import { Markdown } from "@/components/posts/markdown";
import { PostChart } from "@/components/posts/post-chart";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { Post } from "@/models/Post";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "Experience post" };

export default async function PostPage({ params }) {
  const { id } = await params;
  await connectDB();
  const raw = await Post.findById(id).populate("authorId", "name").lean().catch(() => null);
  const viewer = await getCurrentUser();
  const isAuthor = raw && viewer && String(raw.authorId?._id) === viewer.id;
  // A hidden post is gone for everyone except its author and administrators.
  if (!raw || (raw.status !== "published" && !isAuthor && viewer?.role !== "admin")) notFound();
  const post = toPlain(raw);
  const author = post.authorId?.name ?? "A mentor";

  return (
    <article className="max-w-2xl">
      <BackLink href="/posts">All posts</BackLink>
      {post.status === "hidden" && (
        <p role="alert" className="mb-6 rounded-lg border border-destructive/30 bg-destructive-surface px-4 py-3 text-sm text-destructive">
          An administrator has hidden this post. Only you and administrators can see it.
        </p>
      )}

      <div className="border-b pb-6">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2.25rem]">{post.title}</h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <Fields
            items={[
              { label: "Author", value: author },
              { label: "Published", value: formatDate(post.createdAt) },
            ]}
          />
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/my-posts/${post._id}/edit`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
              <DeleteButton url={`/api/posts/${post._id}`} confirmText="Delete this post for good?" redirectTo="/my-posts" doneText="Post deleted." />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        <Markdown>{post.body}</Markdown>
      </div>

      {post.chart && <PostChart chart={post.chart} />}

      {post.images.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {post.images.map((image) => (
            <figure key={image.url} className="overflow-hidden panel">
              <div className="relative aspect-4/3 bg-secondary">
                {/* unoptimized: pictures come from any address the mentor pastes */}
                <Image src={image.url} alt={image.alt} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="border-t px-3 py-2 text-sm text-muted-foreground">{image.alt}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </article>
  );
}
