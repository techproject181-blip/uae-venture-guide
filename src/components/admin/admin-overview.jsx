import Link from "next/link";
import { ArrowRight, BookOpen, FileText, ShieldAlert, UserPlus, Users } from "lucide-react";
import { UserActions } from "@/components/admin/user-actions";
import { Avatar } from "@/components/avatar";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FeeReference } from "@/models/FeeReference";
import { Plan } from "@/models/Plan";
import { Post } from "@/models/Post";
import { Source } from "@/models/Source";
import { User } from "@/models/User";

const ROLE_ORDER = ["entrepreneur", "mentor", "funder", "admin"];

/** One number in the row at the top: an icon, the label, the value and a short line under it. */
function Kpi({ icon: Icon, label, value, hint, href, alert }) {
  return (
    <Link
      href={href}
      className={cn(
        "panel panel-link group flex flex-col gap-4 p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        alert && "border-gold-400 bg-gold-50",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", alert ? "bg-gold-100 text-gold-800" : "bg-accent text-primary")}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <div>
        <p className="font-display text-3xl leading-none font-bold tracking-[-0.02em] tabular-nums">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </div>
    </Link>
  );
}

/** A white box with a title row, used for each block on the overview. */
function Card({ title, action, children, className }) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-4 border-b px-5 py-3.5">
        <h2 className="text-[0.9375rem] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CardLink({ href, children }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

/** The administrator's overview: the numbers that matter, who is waiting, the newest accounts, and the state of sources and content. */
export async function AdminOverview({ user }) {
  await connectDB();
  const [pending, waiting, newest, roleCounts, plans, sharedPlans, hiddenPlans, sources, hiddenSources, demoSources, fees, posts, hiddenPosts] =
    await Promise.all([
      User.countDocuments({ status: "pending" }),
      User.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).select("name email role createdAt").lean(),
      User.find().sort({ createdAt: -1 }).limit(6).select("name email role status createdAt").lean(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Plan.countDocuments(),
      Plan.countDocuments({ shared: true }),
      Plan.countDocuments({ hiddenByAdmin: true }),
      Source.countDocuments({ active: true }),
      Source.countDocuments({ active: false }),
      Source.countDocuments({ demo: true }),
      FeeReference.countDocuments({ active: true }),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "hidden" }),
    ]);

  const byRole = Object.fromEntries(roleCounts.map((row) => [row._id, row.count]));
  const accounts = Object.values(byRole).reduce((sum, n) => sum + n, 0);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Welcome back, ${firstName}. Here is what needs your attention.`}
        actions={
          <Link href="/admin/sources/new" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Add a source
          </Link>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={UserPlus}
          label="Waiting for approval"
          value={pending}
          hint={pending ? "Mentors and funders to review" : "Nobody is waiting"}
          href="/admin/users?status=pending"
          alert={pending > 0}
        />
        <Kpi icon={Users} label="Accounts" value={accounts} hint={`${byRole.entrepreneur ?? 0} founders · ${byRole.mentor ?? 0} mentors`} href="/admin/users?status=all" />
        <Kpi icon={BookOpen} label="Sources shown" value={sources} hint={`${fees} fees in use`} href="/admin/sources" />
        <Kpi icon={FileText} label="Published posts" value={posts} hint={`${plans} plans · ${sharedPlans} shared`} href="/admin/content" />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Waiting for approval" action={pending > waiting.length && <CardLink href="/admin/users?status=pending">See all {pending}</CardLink>}>
            {waiting.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No accounts are waiting. New mentors and funders will appear here.</p>
            ) : (
              <ul className="divide-y">
                {toPlain(waiting).map((account) => (
                  <li key={account._id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={account.name} className="size-9 text-xs" />
                      <div className="min-w-0">
                        <Link href={`/admin/users/${account._id}`} className="font-medium hover:underline">
                          {account.name}
                        </Link>
                        <p className="truncate text-sm text-muted-foreground">
                          {ROLE_LABELS[account.role]} · {account.email}
                        </p>
                      </div>
                    </div>
                    <UserActions userId={account._id} status="pending" className="justify-start sm:justify-end" />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Newest accounts" action={<CardLink href="/admin/users?status=all">All users</CardLink>}>
            <div className="overflow-x-auto">
              <table className="doc-table [&_td]:align-middle">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col" className="hidden sm:table-cell">
                      Role
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col" className="hidden text-right md:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {toPlain(newest).map((account) => (
                    <tr key={account._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={account.name} className="hidden size-8 text-xs sm:flex" />
                          <div className="min-w-0">
                            <Link href={`/admin/users/${account._id}`} className="font-medium hover:underline">
                              {account.name}
                            </Link>
                            <p className="truncate text-muted-foreground">{account.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium">{ROLE_LABELS[account.role]}</span>
                      </td>
                      <td>
                        <StatusBadge status={account.status} />
                      </td>
                      <td className="hidden text-right whitespace-nowrap text-muted-foreground md:table-cell">{formatDate(account.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Accounts by role">
            <ul className="space-y-3 px-5 py-4">
              {ROLE_ORDER.map((role) => {
                const n = byRole[role] ?? 0;
                return (
                  <li key={role}>
                    <div className="flex justify-between text-sm">
                      <span>{ROLE_LABELS[role]}</span>
                      <span className="font-medium tabular-nums">{n}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${accounts ? Math.round((n / accounts) * 100) : 0}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Sources and content">
            <dl className="divide-y text-sm">
              {[
                { label: "Sources shown", value: sources, href: "/admin/sources?show=shown" },
                { label: "Sources hidden", value: hiddenSources, href: "/admin/sources?show=hidden" },
                { label: "Demo sources to check", value: demoSources, href: "/admin/sources?show=demo", warn: demoSources > 0 },
                { label: "Hidden posts", value: hiddenPosts, href: "/admin/content" },
                { label: "Hidden shared plans", value: hiddenPlans, href: "/admin/content?tab=plans" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3">
                  <dt>
                    <Link href={row.href} className="hover:underline">
                      {row.label}
                    </Link>
                  </dt>
                  <dd className={cn("font-medium tabular-nums", row.warn && "rounded-md bg-gold-100 px-2 text-gold-800")}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {demoSources > 0 && (
            <div role="note" className="flex gap-3 rounded-xl border border-gold-400 bg-gold-50 p-4 text-sm">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
              <p>
                <strong className="font-medium">Check the demo sources.</strong> Compare each one with the official page, then untick “demo” so its fees count as
                official.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
