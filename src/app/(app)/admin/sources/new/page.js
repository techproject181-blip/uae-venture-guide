import { SourceForm } from "@/components/admin/source-form";
import { Panel, Split } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "Add a source" };

export default async function NewSourcePage() {
  await requireUser({ roles: ["admin"] });

  return (
    <>
      <PageHeader
        back={{ href: "/admin/sources", label: "All sources" }}
        title="Add an official source"
        description="Check the page yourself before you add it."
      />
      <Split
        aside={
          <>
            <Panel title="Before you add it">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground marker:text-ink-300">
                <li>Use the government or free zone page itself, not a news story or a consultant’s summary.</li>
                <li>Choose the emirate the page covers. Federal pages apply to every emirate.</li>
                <li>Set “Last checked on” to the day you read the page.</li>
                <li>Tick “demo” only for sample data nobody has checked. Users see a Demo label next to it.</li>
              </ul>
            </Panel>
            <Panel title="What happens next">
              <p className="text-sm text-muted-foreground">
                The source’s own page opens. Add the fees it lists there, so roadmaps can mark those costs as official.
              </p>
            </Panel>
          </>
        }
      >
        <Panel title="Source details">
          <SourceForm />
        </Panel>
      </Split>
    </>
  );
}
