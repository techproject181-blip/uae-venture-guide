import Link from "next/link";
import { formatDate } from "@/lib/format";

/**
 * A post in a list, as one ruled row: title, author, date and the start of
 * the text. The title's link stretches over the whole row. List these in a
 * `divide-y` list.
 */
export function PostCard({ post, authorName }) {
  // The start of the text, without headings or Markdown marks.
  const preview = post.body
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join(" ")
    .replace(/[#*_>`[\]()-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  const pictures = post.images?.length ?? 0;
  const extras = [post.chart && "Has a chart", pictures > 0 && `${pictures} ${pictures === 1 ? "picture" : "pictures"}`].filter(Boolean);

  return (
    <article className="group relative py-5">
      <h2 className="text-lg leading-snug">
        <Link
          href={`/posts/${post._id}`}
          className="outline-none group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {post.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {authorName} · {formatDate(post.createdAt)}
        {extras.length > 0 && ` · ${extras.join(" · ")}`}
      </p>
      <p className="mt-2 line-clamp-2 max-w-[68ch] text-muted-foreground">{preview}…</p>
    </article>
  );
}
