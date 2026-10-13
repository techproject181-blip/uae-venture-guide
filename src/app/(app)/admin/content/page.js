import Link from "next/link";
import { AdminTabs, TabLinks } from "@/components/admin/admin-tabs";
import { HideButton } from "@/components/admin/hide-button";
import { tableEdges } from "@/components/admin/table-edges";
import { TablePanel } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
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

const PAGE_SIZE = 20;

// The filters behind the All and Hidden views of each list. Only shared plans
// are listed: a plan that is not shared is private to its owner.
const FILTERS = {
  posts: { all: {}, hidden: { status: "hidden" } },
  plans: { all: { shared: true }, hidden: { shared: true, hiddenByAdmin: true } },
};

/** The address of one view of this page. The default view (posts, all, page 1) has no query. */
function contentHref({ tab, show, page }) {
  const query = new URLSearchParams({ ...(tab === "plans" && { tab }), ...(show === "hidden" && { show }), ...(page > 1 && { page }) });
  return query.toString() ? `/admin/content?${query}` : "/admin/content";
}

/** One page of experience posts, newest first, as table rows. */
async function postRows(filter, skip) {
  const posts = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .select("title status createdAt authorId")
    .populate("authorId", "name")
    .lean();
  return toPlain(posts).map((post) => ({
    id: post._id,
    title: post.title,
    href: `/posts/${post._id}`,
    owner: post.authorId?.name ?? "Removed account",
    detail: formatDate(post.createdAt),
    hidden: post.status === "hidden",
    url: `/api/admin/posts/${post._id}`,
    what: "post",
  }));
}

/** One page of shared plans, most recently changed first, as table rows. */
async function planRows(filter, skip) {
  const plans = await Plan.find(filter)
    .sort({ updatedAt: -1, _id: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .select("title sector emirate hiddenByAdmin updatedAt ownerId")
    .populate("ownerId", "name")
    .lean();
  return toPlain(plans).map((plan) => ({
    id: plan._id,
    title: plan.title,
    href: `/plans/${plan._id}`,
    owner: plan.ownerId?.name ?? "Removed account",
    detail: `${labelOf(SECTORS, plan.sector)} · ${labelOf(EMIRATES, plan.emirate)}`,
    hidden: plan.hiddenByAdmin,
    url: `/api/admin/plans/${plan._id}`,
    what: "plan",
  }));
}

/** The administrator hides unsuitable experience posts and shared plans (FR-25). */
export default async function AdminContentPage({ searchParams }) {
  await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const tab = params.tab === "plans" ? "plans" : "posts";
  const show = params.show === "hidden" ? "hidden" : "all";

  await connectDB();
  const [postCount, planCount, hiddenCount] = await Promise.all([
    Post.countDocuments(FILTERS.posts.all),
    Plan.countDocuments(FILTERS.plans.all),
    (tab === "plans" ? Plan : Post).countDocuments(FILTERS[tab].hidden),
  ]);
  const total = show === "hidden" ? hiddenCount : tab === "plans" ? planCount : postCount;
  // A page past the end (for example after showing the last hidden item on it) shows the last page instead.
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.parseInt(params.page, 10) || 1), pages);
  const rows = await (tab === "plans" ? planRows : postRows)(FILTERS[tab][show], (page - 1) * PAGE_SIZE);

  const lists = {
    posts: {
      title: show === "hidden" ? "Hidden posts" : "Experience posts",
      empty: show === "hidden" ? "No posts are hidden." : "No posts yet.",
      note: `${total === 1 ? "1 post" : `${total} posts`}, newest first. A hidden post is seen only by its author and administrators.`,
      owner: "Author",
      date: "Written",
    },
    plans: {
      title: show === "hidden" ? "Hidden shared plans" : "Plans shared with funders",
      empty: show === "hidden" ? "No shared plans are hidden." : "No plans are shared.",
      note: `${total === 1 ? "1 plan" : `${total} plans`}, most recently changed first. A hidden plan leaves the funders' pitch cards, and funders can no longer open it.`,
      owner: "Owner",
      date: "Sector and emirate",
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
          { href: contentHref({ tab: "posts", show }), label: "Experience posts", count: postCount, current: tab === "posts" },
          { href: contentHref({ tab: "plans", show }), label: "Shared plans", count: planCount, current: tab === "plans" },
        ]}
      >
        <TabLinks
          label="Show all or only hidden"
          tabs={[
            { href: contentHref({ tab }), label: "All", current: show === "all" },
            { href: contentHref({ tab, show: "hidden" }), label: "Hidden", count: hiddenCount, current: show === "hidden" },
          ]}
        />
      </AdminTabs>

      {rows.length === 0 ? (
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
              {rows.map((row) => (
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
                    <StatusBadge
                      className="mt-2 sm:hidden"
                      status={row.hidden ? "hidden" : "published"}
                      label={row.hidden ? "Hidden" : "Visible"}
                    />
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

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} href={(n) => contentHref({ tab, show, page: n })} />
    </>
  );
}
