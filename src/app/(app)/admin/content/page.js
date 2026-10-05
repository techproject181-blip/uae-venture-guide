import Link from "next/link";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { HideButton } from "@/components/admin/hide-button";
import { tableEdges } from "@/components/admin/table-edges";
import { TablePanel } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { toPlain } from "@/lib/api";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { Plan } from "@/models/Plan";
import { Post } from "@/models/Post";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "Content" };

/** The administrator hides unsuitable experience posts and shared plans (FR-42). */
export default async function AdminContentPage({ searchParams }) {
  await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const tab = params.tab === "plans" ? "plans" : "posts";

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

  const lists = {
    posts: {
      title: "Experience posts",
      empty: "No posts yet.",
      note: "Newest first. A hidden post is seen only by its author and administrators.",
      owner: "Author",
      date: "Written",
      rows: toPlain(posts).map((post) => ({
        id: post._id,
        title: post.title,
        href: `/posts/${post._id}`,
        owner: post.authorId?.name ?? "Removed account",
        detail: formatDate(post.createdAt),
        hidden: post.status === "hidden",
        url: `/api/admin/posts/${post._id}`,
        what: "post",
      })),
    },
    plans: {
      title: "Plans shared with funders",
      empty: "No plans are shared.",
      note: "Most recently changed first. A hidden plan leaves the funders' pitch cards, and funders can no longer open it.",
      owner: "Owner",
      date: "Sector and emirate",
      rows: toPlain(plans).map((plan) => ({
        id: plan._id,
        title: plan.title,
        href: `/plans/${plan._id}`,
        owner: plan.ownerId?.name ?? "Removed account",
        detail: `${labelOf(SECTORS, plan.sector)} · ${labelOf(EMIRATES, plan.emirate)}`,
        hidden: plan.hiddenByAdmin,
        url: `/api/admin/plans/${plan._id}`,
        what: "plan",
      })),
    },
  };
  const list = lists[tab];

  return (
    <>
      <PageHeader
        title="Content"
        description="Hide posts and shared plans that break the rules. Hidden items stay saved, and you can show them again."
      />

      <AdminTabs
        label="Choose content"
        tabs={[
          { href: "/admin/content", label: "Experience posts", count: posts.length, current: tab === "posts" },
          { href: "/admin/content?tab=plans", label: "Shared plans", count: plans.length, current: tab === "plans" },
        ]}
      />

      {list.rows.length === 0 ? (
        <EmptyState title={list.empty} />
      ) : (
        <TablePanel title={list.title} description={list.note}>
          <table className={cn("doc-table [&_td]:align-middle", tableEdges)}>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col" className="hidden md:table-cell">
                  {list.owner}
                </th>
                <th scope="col" className="hidden lg:table-cell">
                  {list.date}
                </th>
                <th scope="col" className="hidden sm:table-cell">
                  Status
                </th>
                <th scope="col" className="text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {list.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={row.href} className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline">
                      {row.title}
                    </Link>
                    {/* Smaller screens hide some columns, so those facts sit under the title. */}
                    <p className="mt-0.5 text-muted-foreground md:hidden">
                      {row.owner} · {row.detail}
                    </p>
                    <p className="mt-0.5 hidden text-muted-foreground md:block lg:hidden">{row.detail}</p>
                    <StatusBadge className="mt-2 sm:hidden" status={row.hidden ? "hidden" : "published"} label={row.hidden ? "Hidden" : "Visible"} />
                  </td>
                  <td className="hidden md:table-cell">{row.owner}</td>
                  <td className="hidden lg:table-cell">{row.detail}</td>
                  <td className="hidden sm:table-cell">
                    <StatusBadge status={row.hidden ? "hidden" : "published"} label={row.hidden ? "Hidden" : "Visible"} />
                  </td>
                  <td className="text-right">
                    <HideButton url={row.url} hidden={row.hidden} what={row.what} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablePanel>
      )}
    </>
  );
}
