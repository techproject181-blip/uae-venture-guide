import Link from "next/link";
import { Search } from "lucide-react";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { UserActions } from "@/components/admin/user-actions";
import { tableEdges } from "@/components/admin/table-edges";
import { userStatus } from "@/components/admin/user-status";
import { TablePanel } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/avatar";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { User } from "@/models/User";

export const metadata = { title: "Users" };

const PAGE_SIZE = 20;
// A rejected sign-up is saved as suspended too (see user-status.js), so the
// Suspended tab leaves those out and Rejected lists them.
const FILTERS = [
  { value: "pending", label: "Waiting for approval", query: { status: "pending" }, empty: "Nobody is waiting for approval." },
  { value: "active", label: "Active", query: { status: "active" }, empty: "No active accounts." },
  { value: "suspended", label: "Suspended", query: { status: "suspended", rejected: { $ne: true } }, empty: "No suspended accounts." },
  { value: "rejected", label: "Rejected", query: { status: "suspended", rejected: true }, empty: "No rejected sign-ups." },
  { value: "all", label: "All", query: {}, empty: "No accounts yet." },
];

export default async function AdminUsersPage({ searchParams }) {
  const admin = await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const current = FILTERS.find((f) => f.value === params.status) ?? FILTERS[0];
  const filter = current.value;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";

  await connectDB();
  const query = { ...current.query };
  if (search) {
    // Escape the text so it is matched literally, then look in names and emails.
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: pattern }, { email: pattern }];
  }
  const withSearch = (rest) => `/admin/users?${new URLSearchParams({ ...(search && { q: search }), ...rest })}`;
  const [total, pendingCount] = await Promise.all([User.countDocuments(query), User.countDocuments({ status: "pending" })]);
  // A page past the end (for example after approving the last person on it) shows the last page instead.
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.parseInt(params.page, 10) || 1), pages);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .select("name email role status rejected createdAt")
    .lean();

  return (
    <>
      <PageHeader title="Users" description="Approve new mentors and funders. Suspend accounts that break the rules." />

      <AdminTabs
        label="Filter users"
        tabs={FILTERS.map(({ value, label }) => ({
          href: withSearch({ status: value }),
          label,
          count: value === "pending" ? pendingCount : 0,
          current: filter === value,
        }))}
      >
        <form role="search" action="/admin/users" className="relative w-full md:w-72">
          <input type="hidden" name="status" value={filter} />
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="user-search" className="sr-only">
            Search by name or email
          </label>
          <input
            id="user-search"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by name or email"
            className="h-9 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>
      </AdminTabs>

      {users.length === 0 ? (
        <EmptyState title={search ? `No accounts match “${search}”` : current.empty} />
      ) : (
        <TablePanel title={current.label} description={total === 1 ? "1 account" : `${total} accounts`}>
          <table className={cn("doc-table [&_td]:align-middle", tableEdges)}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col" className="hidden md:table-cell">
                  Role
                </th>
                <th scope="col" className="hidden md:table-cell">
                  Status
                </th>
                <th scope="col" className="hidden md:table-cell">
                  Joined
                </th>
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const id = String(user._id);
                const status = userStatus(user);
                const canChange = user.role !== "admin" && id !== admin.id;
                return (
                  <tr key={id}>
                    <td>
                      <div className="flex items-start gap-3">
                        <Avatar name={user.name} className="mt-0.5 hidden size-8 text-xs sm:flex" />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${id}`}
                            className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline"
                          >
                            {user.name}
                          </Link>
                          <p className="text-muted-foreground wrap-anywhere">{user.email}</p>
                          {/* Phones hide the role, status and joined columns, so those facts sit under the name. */}
                          <div className="mt-2 space-y-2 md:hidden">
                            <p>
                              {ROLE_LABELS[user.role]} · <span className="whitespace-nowrap">joined {formatDate(user.createdAt)}</span>
                            </p>
                            <StatusBadge status={status} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-sm text-ink-700">{ROLE_LABELS[user.role]}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      <StatusBadge status={status} />
                    </td>
                    <td className="hidden whitespace-nowrap md:table-cell">{formatDate(user.createdAt)}</td>
                    <td>
                      {canChange ? (
                        <UserActions userId={id} status={status} />
                      ) : (
                        <p className="text-right text-muted-foreground">No actions</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablePanel>
      )}

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} href={(n) => withSearch({ status: filter, page: n })} />
    </>
  );
}
