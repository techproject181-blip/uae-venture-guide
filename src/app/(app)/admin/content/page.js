import Link from "next/link";
import { HideButton } from "@/components/admin/hide-button";
import { Section } from "@/components/document";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { toPlain } from "@/lib/api";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { Plan } from "@/models/Plan";
import { Post } from "@/models/Post";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "Content" };

/** The administrator hides unsuitable experience posts and shared plans (FR-42). */
export default async function AdminContentPage() {
  await requireUser({ roles: ["admin"] });
  await connectDB();
  const [posts, plans] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).limit(100).populate("authorId", "name").lean(),
    Plan.find({ shared: true })
      .sort({ updatedAt: -1 })
      .limit(100)
      .select("title sector emirate hiddenByAdmin updatedAt ownerId")
      .populate("ownerId", "name")
      .lean(),
  ]);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Content"
        description="Hide posts and shared plans that break the rules. Hidden items stay saved, and you can show them again."
      />

      <div className="space-y-10">
        <ContentList
          title="Experience posts"
          empty="No posts yet."
          rows={toPlain(posts).map((post) => ({
            id: post._id,
            title: post.title,
            href: `/posts/${post._id}`,
            detail: `${post.authorId?.name ?? "Removed account"} · ${formatDate(post.createdAt)}`,
            hidden: post.status === "hidden",
            url: `/api/admin/posts/${post._id}`,
            what: "post",
          }))}
        />
        <ContentList
          title="Plans shared with funders"
          empty="No plans are shared."
          rows={toPlain(plans).map((plan) => ({
            id: plan._id,
            title: plan.title,
            href: `/plans/${plan._id}`,
            detail: `${plan.ownerId?.name ?? "Removed account"} · ${labelOf(SECTORS, plan.sector)} · ${labelOf(EMIRATES, plan.emirate)}`,
            hidden: plan.hiddenByAdmin,
            url: `/api/admin/plans/${plan._id}`,
            what: "plan",
          }))}
        />
      </div>
    </div>
  );
}

/** One ruled list: each item with its state and the button that hides or shows it. */
function ContentList({ title, empty, rows }) {
  // The list carries its own rules, so the section needs no rule above its heading.
  return (
    <Section title={title} className="border-t-0 pt-0">
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y border-y">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <Link href={row.href} className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline">
                  {row.title}
                </Link>
                <p className="text-sm text-muted-foreground">{row.detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <StatusBadge status={row.hidden ? "hidden" : "published"} label={row.hidden ? "Hidden" : "Visible"} />
                <HideButton url={row.url} hidden={row.hidden} what={row.what} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
