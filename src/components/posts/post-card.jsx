import Link from "next/link";
import { ChartColumn, Image as ImageIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatDate } from "@/lib/format";

/** The start of a post's text, without headings or Markdown marks. */
export function postExcerpt(body) {
  return body
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join(" ")
    .replace(/[#*_>`[\]()-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

/**
 * A post as a card for a CardGrid: author and date, the title, the start of
 * the text, and whether it has a chart or pictures. The title's link
 * stretches over the whole card. Without `authorName` (the writer's own list)
 * the author line is left out. `badge` sits beside the date and `actions`
 * at the bottom right, above the stretched link.
 */
export function PostCard({ post, authorName, badge, actions }) {
  const pictures = post.images?.length ?? 0;

  return (
    <article className="group panel panel-link relative flex h-full flex-col p-5 sm:p-6">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-muted-foreground">
          {authorName && (
            <>
              <Avatar name={authorName} className="size-7 text-[0.6875rem]" />
              <span className="font-medium text-foreground">{authorName}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="tabular-nums">{formatDate(post.createdAt)}</span>
          {badge}
        </div>
        <h2 className="mt-3 line-clamp-2 text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
          <Link
            href={`/posts/${post._id}`}
            className="outline-none group-hover:text-primary after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{postExcerpt(post.body)}…</p>
      </div>

      <div className="mt-5 flex min-h-8 flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
        {post.chart && (
          <span className="inline-flex items-center gap-1.5">
            <ChartColumn className="size-4" aria-hidden="true" />
            Has a chart
          </span>
        )}
        {pictures > 0 && (
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <ImageIcon className="size-4" aria-hidden="true" />
            {pictures} {pictures === 1 ? "picture" : "pictures"}
          </span>
        )}
        {!post.chart && pictures === 0 && <span>Text only</span>}
        {actions && <div className="relative z-10 ml-auto flex gap-2">{actions}</div>}
      </div>
    </article>
  );
}
