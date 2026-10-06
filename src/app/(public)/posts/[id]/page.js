import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { HideButton } from "@/components/admin/hide-button";
import { DeleteButton } from "@/components/delete-button";
import { ListPanel, PageHeader, Panel, Split } from "@/components/layout";
import { Markdown } from "@/components/posts/markdown";
import { PostChart } from "@/components/posts/post-chart";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { getMentor } from "@/lib/community";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { Post } from "@/models/Post";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "Experience post" };

const linkClass = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

export default async function PostPage({ params }) {
  const { id } = await params;
  await connectDB();
  const raw = await Post.findById(id)
    .populate("authorId", "name")
    .lean()
    .catch(() => null);
  const viewer = await getCurrentUser();
  const isAuthor = raw && viewer && String(raw.authorId?._id) === viewer.id;
  // A hidden post is gone for everyone except its author and administrators.
  if (!raw || (raw.status !== "published" && !isAuthor && viewer?.role !== "admin")) notFound();
  const post = toPlain(raw);
  const author = post.authorId?.name ?? "A mentor";
  const authorId = post.authorId?._id;

  // The author's mentor profile (only listed while their account is active) and their other posts.
  const [mentor, others] = authorId
    ? await Promise.all([
        getMentor(authorId),
        Post.find({ authorId, status: "published", _id: { $ne: post._id } })
          .select("title createdAt")
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),
      ])
    : [null, []];

  return (
    <>
      <PageHeader
        back={{ href: "/posts", label: "All posts" }}
        title={post.title}
        description={`By ${author} · ${formatDate(post.createdAt)}`}
        actions={
          viewer?.role === "admin" && !isAuthor ? (
            <HideButton url={`/api/admin/posts/${post._id}`} hidden={post.status === "hidden"} what="post" />
          ) : (
            isAuthor && (
              <>
                <Link href={`/my-posts/${post._id}/edit`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
                <DeleteButton
                  url={`/api/posts/${post._id}`}
                  confirmText="Delete this post for good?"
                  redirectTo="/my-posts"
                  doneText="Post deleted."
                />
              </>
            )
          )
        }
      >
        {post.status === "hidden" && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive-surface px-4 py-3 text-sm text-destructive">
            An administrator has hidden this post. Only you and administrators can see it.
          </p>
        )}
      </PageHeader>

      <Split
        aside={
          <>
            <Panel title="About the author">
              <div className="flex items-center gap-3.5">
                <Avatar name={author} className="size-12 text-sm" />
                <div className="min-w-0">
                  <p className="font-semibold">{author}</p>
                  {mentor?.headline && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{mentor.headline}</p>}
                </div>
              </div>
              {mentor && (
                <Link
                  href={`/mentors/${authorId}`}
                  className={buttonVariants({ variant: "outline", size: "lg", className: "mt-5 w-full" })}
                >
                  See {author.split(" ")[0]}&rsquo;s mentor profile
                </Link>
              )}
            </Panel>

            {others.length > 0 ? (
              <ListPanel
                title={`More from ${author.split(" ")[0]}`}
                actions={
                  <Link href="/posts" className={`text-sm ${linkClass}`}>
                    All posts
                  </Link>
                }
              >
                {toPlain(others).map((other) => (
                  <li key={other._id} className="relative px-5 py-4 hover:bg-ink-50/70 sm:px-6">
                    <Link
                      href={`/posts/${other._id}`}
                      className="line-clamp-2 font-medium outline-none after:absolute after:inset-0 hover:text-primary focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
                    >
                      {other.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground tabular-nums">{formatDate(other.createdAt)}</p>
                  </li>
                ))}
              </ListPanel>
            ) : (
              <Panel title="More posts">
                <p className="text-sm text-muted-foreground">Read what other mentors learned starting businesses in the UAE.</p>
                <Link href="/posts" className={`mt-3 inline-flex min-h-11 items-center ${linkClass}`}>
                  All posts
                </Link>
              </Panel>
            )}
          </>
        }
      >
        <Panel as="article" bodyClassName="sm:px-8 sm:py-7">
          <div className="max-w-[68ch] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Markdown>{post.body}</Markdown>
          </div>
        </Panel>

        {post.chart && <PostChart chart={post.chart} />}

        {post.images.length > 0 && (
          <Panel title="Pictures">
            <div className="grid gap-5 sm:grid-cols-2">
              {post.images.map((image, index) => (
                // The same picture can be added twice, so the index keeps keys unique.
                <figure key={`${index}-${image.url}`}>
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-secondary">
                    {/* unoptimized: pictures come from any address the mentor pastes */}
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-sm text-muted-foreground">{image.alt}</figcaption>
                </figure>
              ))}
            </div>
          </Panel>
        )}
      </Split>
    </>
  );
}
