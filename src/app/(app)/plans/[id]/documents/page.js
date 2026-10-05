import { notFound } from "next/navigation";
import { Section } from "@/components/document";
import { DocumentRow } from "@/components/plans/document-row";
import { ProgressBar } from "@/components/plans/plan-bits";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
import { Source } from "@/models/Source";

export const metadata = { title: "Documents" };

export default async function PlanDocumentsPage({ params }) {
  const user = await requireUser();
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found) notFound();
  const { plan, isOwner } = found;

  await connectDB();
  const ids = plan.documents.map((doc) => doc.sourceId).filter(Boolean);
  const sources = await Source.find({ _id: { $in: ids }, active: true }).select("title url").lean();
  const sourcesById = Object.fromEntries(sources.map((s) => [String(s._id), { title: s.title, url: s.url }]));

  const required = plan.documents.filter((doc) => doc.required);
  const optional = plan.documents.filter((doc) => !doc.required);
  const ready = required.filter((doc) => doc.obtained).length;
  const percent = required.length ? Math.round((ready / required.length) * 100) : 0;

  const groups = [
    { key: "required", title: "Required", docs: required },
    { key: "optional", title: "If it applies", docs: optional },
  ].filter((group) => group.docs.length > 0);

  return (
    <Section
      title="Documents"
      description={isOwner ? "Collect these before you apply. Tick each one when you have it." : "Collect these before you apply."}
      className="max-w-3xl border-t-0 pt-0"
    >
      {required.length > 0 && (
        <div className="max-w-sm">
          <ProgressBar percent={percent} label={`${ready} of ${required.length} required documents ready`} />
        </div>
      )}
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`docs-${group.key}`} className="mt-8">
          <h3 id={`docs-${group.key}`} className="text-lg">
            {group.title}
          </h3>
          <ul className="mt-2 divide-y border-y">
            {group.docs.map((doc) => (
              <DocumentRow key={doc._id} planId={plan._id} document={doc} source={sourcesById[doc.sourceId]} canEdit={isOwner} />
            ))}
          </ul>
        </section>
      ))}
    </Section>
  );
}
