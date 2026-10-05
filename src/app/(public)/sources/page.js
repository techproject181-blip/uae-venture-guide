import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { SourceCard } from "@/components/source-card";
import { Button } from "@/components/ui/button";
import { EMIRATES, SOURCE_CATEGORIES, valuesOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Source } from "@/models/Source";

export const metadata = { title: "Official sources" };

const controlClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function SourcesPage({ searchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const emirate = valuesOf(EMIRATES).includes(params.emirate) ? params.emirate : "";
  const category = valuesOf(SOURCE_CATEGORIES).includes(params.category) ? params.category : "";

  // Federal sources apply in every emirate, so they show with any emirate filter.
  const query = { active: true };
  if (q) query.$text = { $search: q };
  if (emirate) query.emirate = { $in: [emirate, null] };
  if (category) query.categories = category;

  await connectDB();
  const sources = await Source.find(query, q ? { score: { $meta: "textScore" } } : {})
    .sort(q ? { score: { $meta: "textScore" } } : { emirate: 1, title: 1 })
    .limit(60)
    .lean();
  const filtered = Boolean(q || emirate || category);

  return (
    <>
      <PageHeader
        title="Official sources"
        description="Government and free zone pages about licences, visas, tax and funding. Fees marked Official in a roadmap come from these pages."
      />

      {/* A plain GET form: the filters live in the address, so results can be shared and work without JavaScript. */}
      <form role="search" className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] md:items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="q">
            Search sources
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Search, for example trade licence" className={controlClass} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="emirate">
            Emirate
          </label>
          <select id="emirate" name="emirate" defaultValue={emirate} className={`${controlClass} cursor-pointer`}>
            <option value="">All emirates</option>
            {EMIRATES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="category">
            Topic
          </label>
          <select id="category" name="category" defaultValue={category} className={`${controlClass} cursor-pointer`}>
            <option value="">All topics</option>
            {SOURCE_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" variant="outline">
          Search
        </Button>
      </form>

      {sources.length === 0 ? (
        <EmptyState
          title={filtered ? "No sources match" : "No sources yet"}
          text={filtered ? "Try fewer words or another filter." : "The administrator has not added any official sources yet."}
          action={
            filtered && (
              <Link href="/sources" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
                Clear the filters
              </Link>
            )
          }
        />
      ) : (
        <>
          <p className="mb-2 text-sm text-muted-foreground" role="status">
            {sources.length} {sources.length === 1 ? "source" : "sources"}
          </p>
          <ul className="divide-y border-y">
            {sources.map((source) => (
              <li key={String(source._id)}>
                <SourceCard source={source} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
