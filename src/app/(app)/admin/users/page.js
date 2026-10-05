import Link from "next/link";
import { UserActions } from "@/components/admin/user-actions";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { User } from "@/models/User";

export const metadata = { title: "Users" };

const PAGE_SIZE = 20;
const FILTERS = [
  { value: "pending", label: "Waiting for approval", empty: "Nobody is waiting for approval." },
  { value: "active", label: "Active", empty: "No active accounts." },
  { value: "suspended", label: "Suspended", empty: "No suspended accounts." },
  { value: "all", label: "All", empty: "No accounts yet." },
];

export default async function AdminUsersPage({ searchParams }) {
  const admin = await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const filter = FILTERS.some((f) => f.value === params.status) ? params.status : "pending";
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);

  await connectDB();
  const query = filter === "all" ? {} : { status: filter };
  const [users, total, pendingCount] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .select("name email role status createdAt")
      .lean(),
    User.countDocuments(query),
    User.countDocuments({ status: "pending" }),
  ]);

  return (
    <>
      <PageHeader title="Users" description="Approve new mentors and funders. Suspend accounts that break the rules." />

      <nav aria-label="Filter users" className="-mx-3 mb-4 flex flex-wrap">
        {FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={`/admin/users?status=${value}`}
            aria-current={filter === value ? "page" : undefined}
            className={cn(
              "border-b-2 px-3 py-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              filter === value ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {value === "pending" && pendingCount > 0 && <span className="tabular-nums"> ({pendingCount})</span>}
          </Link>
        ))}
      </nav>

      {users.length === 0 ? (
        <EmptyState title={FILTERS.find((f) => f.value === filter).empty} />
      ) : (
        <div className="relative overflow-x-auto panel">
          <table className="doc-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col" className="hidden md:table-cell">Role</th>
                <th scope="col" className="hidden md:table-cell">Status</th>
                <th scope="col" className="hidden md:table-cell">Joined</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const id = String(user._id);
                const canChange = user.role !== "admin" && id !== admin.id;
                return (
                  <tr key={id}>
                    <td>
                      <Link href={`/admin/users/${id}`} className="font-medium text-foreground decoration-primary underline-offset-4 hover:underline">
                        {user.name}
                      </Link>
                      <p className="text-muted-foreground wrap-anywhere">{user.email}</p>
                      {/* Phones hide the role, status and joined columns, so those facts sit under the name. */}
                      <div className="mt-2 space-y-2 md:hidden">
                        <p>
                          {ROLE_LABELS[user.role]} · <span className="whitespace-nowrap">joined {formatDate(user.createdAt)}</span>
                        </p>
                        <StatusBadge status={user.status} />
                      </div>
                    </td>
                    <td className="hidden md:table-cell">{ROLE_LABELS[user.role]}</td>
                    <td className="hidden md:table-cell">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="hidden whitespace-nowrap md:table-cell">{formatDate(user.createdAt)}</td>
                    <td>
                      {canChange ? (
                        <UserActions userId={id} status={user.status} />
                      ) : (
                        <p className="text-right text-muted-foreground">No actions</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} href={(n) => `/admin/users?status=${filter}&page=${n}`} />
    </>
  );
}
