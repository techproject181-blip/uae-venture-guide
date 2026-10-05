import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Section } from "@/components/document";
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
  const sources = await Source.find({ active: true, emirate: { $in: [plan.emirate, null] } }).sort({ title: 1 }).lean();
  const used = new Set(plan.tasks.flatMap((task) => task.sourceIds));
  const groups = [
    { key: "used", title: "Used in your roadmap", sources: sources.filter((source) => used.has(String(source._id))) },
    { key: "more", title: `More sources for ${labelOf(EMIRATES, plan.emirate)}`, sources: sources.filter((source) => !used.has(String(source._id))) },
  ].filter((group) => group.sources.length > 0);

  return (
    <Section
      title="Official sources"
      description="The government and free zone pages behind the steps and fees in this plan."
      className="max-w-3xl border-t-0 pt-0"
    >
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`sources-${group.key}`} className="mt-8 first:mt-2">
          <h3 id={`sources-${group.key}`} className="text-lg">
            {group.title}
          </h3>
          <ul className="mt-2 divide-y border-y">
            {group.sources.map((source) => (
              <SourceRow key={String(source._id)} source={source} />
            ))}
          </ul>
        </section>
      ))}
    </Section>
  );
}

/** One source: its title as a link, who publishes it, what it covers and when it was last checked. */
function SourceRow({ source }) {
  return (
    <li className="py-5">
      <h4 className="font-bold">
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
