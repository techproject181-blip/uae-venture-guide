import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Panel, Split } from "@/components/layout";
import { FactRows } from "@/components/plans/plan-bits";
import { StatusBadge } from "@/components/status-badge";
import { EMIRATES, SOURCE_CATEGORIES, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
import { Source } from "@/models/Source";

export const metadata = { title: "Sources" };

/** The official sources that apply to the plan's emirate, those used in the roadmap first. */
export default async function PlanSourcesPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();
  const { plan } = found;

  await connectDB();
  const sources = await Source.find({ active: true, emirate: { $in: [plan.emirate, null] } })
    .sort({ title: 1 })
    .lean();
  const used = new Set(plan.tasks.flatMap((task) => task.sourceIds));
  const groups = [
    { key: "used", title: "Used in your roadmap", sources: sources.filter((source) => used.has(String(source._id))) },
    {
      key: "more",
      title: `More sources for ${labelOf(EMIRATES, plan.emirate)}`,
      sources: sources.filter((source) => !used.has(String(source._id))),
    },
  ].filter((group) => group.sources.length > 0);

  const usedCount = groups.find((group) => group.key === "used")?.sources.length ?? 0;
  const aside = (
    <Panel title="About these sources" flush>
      <p className="px-5 pt-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pt-6">
        Federal pages and the pages for {labelOf(EMIRATES, plan.emirate)}. Each shows when it was last checked. Sources marked demo are
        sample data, so check the real page before you rely on them.
      </p>
      <div className="mt-4 border-t">
        <FactRows
          rows={[
            { label: "Used in your roadmap", value: usedCount },
            { label: "All sources listed", value: sources.length },
          ]}
        />
      </div>
    </Panel>
  );

  return (
    <Split aside={aside}>
      <Panel title="Official sources" description="The government and free zone pages behind the steps and fees in this plan." flush>
        <div className="divide-y">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`sources-${group.key}`}>
              <h3 id={`sources-${group.key}`} className="border-b bg-ink-50/70 px-5 py-3 font-semibold sm:px-6">
                {group.title}
              </h3>
              <ul className="divide-y">
                {group.sources.map((source) => (
                  <SourceRow key={String(source._id)} source={source} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Panel>
    </Split>
  );
}

/** One source: its title as a link, who publishes it, what it covers and when it was last checked. */
function SourceRow({ source }) {
  return (
    <li className="px-5 py-5 sm:px-6">
      <h4 className="font-semibold">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-start gap-1.5 underline decoration-foreground/30 underline-offset-4 hover:text-primary hover:decoration-current"
        >
          {source.title}
          <ExternalLink className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </h4>
      <p className="mt-1 text-sm text-muted-foreground">
        {source.publisher} · {source.emirate ? labelOf(EMIRATES, source.emirate) : "Federal"}
        {source.categories.length > 0 && ` · ${source.categories.map((category) => labelOf(SOURCE_CATEGORIES, category)).join(", ")}`}
      </p>
      <p className="mt-2 max-w-2xl leading-relaxed">{source.summary}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        Last checked {formatDate(source.verifiedAt)}
        {source.demo && <StatusBadge status="pending" label="Demo, not checked" />}
      </p>
    </li>
  );
}
