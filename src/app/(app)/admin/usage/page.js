import { Fields, Section } from "@/components/document";
import { EmptyState, PageHeader } from "@/components/page-header";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/guards";
import { DAILY_LIMITS, uaeDay, uaeDayAgo } from "@/lib/quota";
import { AiUsage } from "@/models/AiUsage";
import "@/models/User"; // registers the model that populate() reads from

export const metadata = { title: "AI usage" };

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

  return (
    <div className="max-w-3xl">
      <PageHeader title="AI usage" description="Roadmaps made and chat messages sent each day (UAE time)." />

      <Fields
        items={[
          { label: "Roadmaps a day", value: `${DAILY_LIMITS.generations} per user` },
          { label: "Chat messages a day", value: `${DAILY_LIMITS.chatMessages} per user` },
          { label: "Usage kept for", value: "180 days, then deleted" },
        ]}
      />

      {days.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No usage in the last two weeks" />
        </div>
      ) : (
        <>
          {/* Both tables use narrower cells on phones, so all their columns fit without sideways scrolling. */}
          <Section title="Last 14 days" className="mt-10">
            <div className="relative overflow-x-auto panel">
              <table className="doc-table max-sm:[&_td]:px-3 max-sm:[&_th]:px-3">
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
            </div>
          </Section>

          <Section title="Most active today" className="mt-10">
            {today.length === 0 ? (
              <p className="text-muted-foreground">Nobody has used the roadmap planner or chat today.</p>
            ) : (
              <div className="relative overflow-x-auto panel">
                <table className="doc-table max-sm:[&_td]:px-3 max-sm:[&_th]:px-3">
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
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
