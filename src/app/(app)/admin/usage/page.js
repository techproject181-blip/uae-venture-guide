import { tableEdges } from "@/components/admin/table-edges";
import { Panel, Split, Stat, StatGrid, TablePanel } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { DAILY_LIMITS, uaeDay, uaeDayAgo } from "@/lib/quota";
import { cn } from "@/lib/utils";
import { AiUsage } from "@/models/AiUsage";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "AI usage" };

// Both tables use narrower cells on phones, so all their columns fit without sideways scrolling.
const narrowTable = cn("doc-table", tableEdges, "max-sm:[&_td]:px-3 max-sm:[&_th]:px-3");

/** Roadmaps and chat messages per day for the last two weeks, and today's busiest users. */
export default async function AdminUsagePage() {
  await requireUser({ roles: ["admin"] });
  await connectDB();

  const since = uaeDayAgo(13);
  const [days, today] = await Promise.all([
    AiUsage.aggregate([
      { $match: { day: { $gte: since } } },
      { $group: { _id: "$day", generations: { $sum: "$generations" }, chatMessages: { $sum: "$chatMessages" }, users: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),
    AiUsage.find({ day: uaeDay() }).sort({ chatMessages: -1, generations: -1 }).limit(10).populate("userId", "name email").lean(),
  ]);
  const todayTotals = days.find((day) => day._id === uaeDay()) ?? { generations: 0, chatMessages: 0 };
  const sum = (field) => days.reduce((total, day) => total + day[field], 0);

  return (
    <>
      <PageHeader title="AI usage" description="Roadmaps made and chat messages sent each day (UAE time)." />

      <StatGrid className="mb-6 lg:mb-8">
        <Stat label="Roadmaps today" value={todayTotals.generations} />
        <Stat label="Chat messages today" value={todayTotals.chatMessages} />
        <Stat label="Roadmaps, 14 days" value={sum("generations")} />
        <Stat label="Chat, 14 days" value={sum("chatMessages")} />
      </StatGrid>

      <Split
        aside={
          <Panel title="Daily limits">
            <dl className="divide-y text-sm">
              {[
                ["Roadmaps a day", `${DAILY_LIMITS.generations} per user`],
                ["Chat messages a day", `${DAILY_LIMITS.chatMessages} per user`],
                ["Usage kept for", "180 days, then deleted"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              When someone reaches a limit, they are asked to try again the next day. The count starts again at midnight UAE time.
            </p>
          </Panel>
        }
      >
        {days.length === 0 ? (
          <EmptyState title="No usage in the last two weeks" />
        ) : (
          <>
            <TablePanel title="Last 14 days" description="Days with no use are left out.">
              <table className={narrowTable}>
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col" className="text-right">Roadmaps</th>
                    <th scope="col" className="text-right">Chat messages</th>
                    <th scope="col" className="text-right">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day._id}>
                      <td className="whitespace-nowrap">{formatDate(day._id)}</td>
                      <td className="text-right">{day.generations}</td>
                      <td className="text-right">{day.chatMessages}</td>
                      <td className="text-right">{day.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablePanel>

            {today.length === 0 ? (
              <Panel title="Most active today">
                <p className="text-muted-foreground">Nobody has used the roadmap planner or chat today.</p>
              </Panel>
            ) : (
              <TablePanel title="Most active today" description="The ten busiest accounts, against each daily limit.">
                <table className={narrowTable}>
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col" className="text-right">Roadmaps</th>
                      <th scope="col" className="text-right">Chat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {today.map((row) => (
                      <tr key={String(row._id)}>
                        <td>
                          <p className="font-medium">{row.userId?.name ?? "Deleted account"}</p>
                          <p className="text-muted-foreground wrap-anywhere">{row.userId?.email}</p>
                        </td>
                        <td className="text-right whitespace-nowrap">
                          {row.generations} / {DAILY_LIMITS.generations}
                        </td>
                        <td className="text-right whitespace-nowrap">
                          {row.chatMessages} / {DAILY_LIMITS.chatMessages}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TablePanel>
            )}
          </>
        )}
      </Split>
    </>
  );
}
