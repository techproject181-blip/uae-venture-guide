import { notFound } from "next/navigation";
import { Panel, Split } from "@/components/layout";
import { DocumentRow } from "@/components/plans/document-row";
import { FactRows, ProgressBar } from "@/components/plans/plan-bits";
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
  const sources = await Source.find({ _id: { $in: ids }, active: true })
    .select("title url")
    .lean();
  const sourcesById = Object.fromEntries(sources.map((s) => [String(s._id), { title: s.title, url: s.url }]));

  const required = plan.documents.filter((doc) => doc.required);
  const optional = plan.documents.filter((doc) => !doc.required);
  const ready = required.filter((doc) => doc.obtained).length;
  const percent = required.length ? Math.round((ready / required.length) * 100) : 0;

  const groups = [
    { key: "required", title: "Required", docs: required },
    { key: "optional", title: "If it applies", docs: optional },
  ].filter((group) => group.docs.length > 0);

  const aside = (
    <Panel title="Your progress" flush>
      {required.length > 0 && (
        <div className="border-b p-5 sm:p-6">
          <ProgressBar percent={percent} label={`${ready} of ${required.length} required documents ready`} />
        </div>
      )}
      <FactRows
        rows={[
          { label: "Required", value: required.length },
          { label: "Ready", value: ready },
          optional.length > 0 && { label: "If it applies", value: optional.length },
        ]}
      />
      <p className="border-t px-5 py-4 text-sm text-muted-foreground sm:px-6">
        Where a document has an official page, the link is under its description.
      </p>
    </Panel>
  );

  return (
    <Split aside={aside}>
      <Panel
        title="Documents"
        description={isOwner ? "Collect these before you apply. Tick each one when you have it." : "Collect these before you apply."}
        flush
      >
        <div className="divide-y">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`docs-${group.key}`}>
              <h3 id={`docs-${group.key}`} className="border-b bg-ink-50/70 px-5 py-3 font-semibold sm:px-6">
                {group.title}
              </h3>
              <ul className="divide-y">
                {group.docs.map((doc) => (
                  <DocumentRow key={doc._id} planId={plan._id} document={doc} source={sourcesById[doc.sourceId]} canEdit={isOwner} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Panel>
    </Split>
  );
}
