import { ExternalLink, Landmark, MapPin } from "lucide-react";
import { Chips } from "@/components/mentors/chips";
import { StatusBadge } from "@/components/status-badge";
import { EMIRATES, SOURCE_CATEGORIES, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/format";

/**
 * One official source as a card for a CardGrid: who publishes it, the page's
 * title (a link to the official page, stretched over the card), a short
 * summary, where it applies, its topics and when it was last checked.
 */
export function SourceCard({ source }) {
  const where = source.emirate ? labelOf(EMIRATES, source.emirate) : "Federal, all emirates";
  const topics = source.categories.map((category) => labelOf(SOURCE_CATEGORIES, category));

  return (
    <article className="group panel panel-link relative flex h-full flex-col p-5 sm:p-6">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground">
            <Landmark className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{source.publisher}</span>
          </p>
          {source.demo && <StatusBadge status="pending" label="Demo, not checked" className="shrink-0" />}
        </div>
        <h2 className="mt-3 text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="outline-none group-hover:text-primary after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {source.title}
            <ExternalLink className="ml-1.5 inline size-4 align-[-2px] text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{source.summary}</p>
        {topics.length > 0 && <Chips className="mt-4" label="Topics" items={topics} />}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {where}
        </span>
        <span className="tabular-nums">Last checked {formatDate(source.verifiedAt)}</span>
      </div>
    </article>
  );
}
