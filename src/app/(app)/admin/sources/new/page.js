import { SourceForm } from "@/components/admin/source-form";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "Add a source" };

export default async function NewSourcePage() {
  await requireUser({ roles: ["admin"] });

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/sources">All sources</BackLink>
      <PageHeader title="Add an official source" description="Check the page yourself before you add it." />
      <div className="panel p-5 sm:p-6">
        <SourceForm />
      </div>
    </div>
  );
}
