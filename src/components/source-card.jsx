import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { EMIRATES, SOURCE_CATEGORIES, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/format";

/**
 * One official source as a ruled row: what it is, who publishes it, where it
 * applies and when it was last checked. List these in a `divide-y` list. The
 * row lays itself out by its own width, so it also fits a narrow column.
 */
export function SourceCard({ source }) {
  const where = source.emirate ? labelOf(EMIRATES, source.emirate) : "Federal, all emirates";
  const topics = source.categories.map((category) => labelOf(SOURCE_CATEGORIES, category)).join(", ");

  return (
    <article className="@container py-5">
      <div className="grid gap-x-8 gap-y-2 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <h2 className="text-lg leading-snug">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline decoration-foreground/30 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {source.title}
              <ExternalLink className="ml-1.5 inline size-4 align-[-2px]" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{source.publisher}</p>
        </div>
        <div>
          <p>{source.summary}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{where}</span>
            <span aria-hidden="true">·</span>
            <span>{topics}</span>
            <span aria-hidden="true">·</span>
            <span>Last checked {formatDate(source.verifiedAt)}</span>
            {source.demo && <StatusBadge status="pending" label="Demo, not checked" className="ml-1" />}
          </p>
        </div>
      </div>
    </article>
  );
}
