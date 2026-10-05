import { notFound } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Section } from "@/components/document";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
import { quotaLeft } from "@/lib/quota";
import { ChatMessage } from "@/models/ChatMessage";
import { Source } from "@/models/Source";

export const metadata = { title: "Chat" };

/** The owner's chat with the assistant about this plan. The history is kept between visits. */
export default async function PlanChatPage({ params }) {
  const user = await requireUser({ roles: ["entrepreneur"] });
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found?.isOwner) notFound();

  await connectDB();
  const messages = toPlain(await ChatMessage.find({ planId: id }).sort({ createdAt: 1 }).limit(200).lean());
  const sourceIds = [...new Set(messages.flatMap((message) => message.sourceIds))];
  const sources = await Source.find({ _id: { $in: sourceIds } }).select("title url").lean();
  const sourcesById = Object.fromEntries(sources.map((s) => [String(s._id), { title: s.title, url: s.url }]));

  return (
    <Section
      title="Ask about this plan"
      description="Answers use your roadmap and the official sources only."
      className="max-w-3xl border-t-0 pt-0"
    >
      <ChatPanel planId={id} messages={messages} sources={sourcesById} left={await quotaLeft(user.id, "chatMessages")} />
    </Section>
  );
}
