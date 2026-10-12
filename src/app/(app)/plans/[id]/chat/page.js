import { notFound } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Panel, Split } from "@/components/layout";
import { aiEnabled } from "@/lib/ai/openai";
import { toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getPlanForViewer } from "@/lib/plans";
import { quotaLeft } from "@/lib/quota";
import { ChatMessage } from "@/models/ChatMessage";
import { Source } from "@/models/Source";

export const metadata = { title: "Chat" };

// The topics the sample assistant recognises (see src/lib/chat/answer.js). The AI answers them too.
const TOPICS = ["Costs and fees", "Documents", "Visas", "Mainland or free zone", "How long it takes", "Risks", "Tax"];

/** The owner's chat with the assistant about this plan. The history is kept between visits. */
export default async function PlanChatPage({ params }) {
  const user = await requireUser({ roles: ["entrepreneur"] });
  const { id } = await params;
  const found = await getPlanForViewer(id, user);
  if (!found?.isOwner) notFound();

  await connectDB();
  // The newest 200 messages, shown oldest first. A question and its answer are
  // saved together, so _id keeps them in order when their times are the same.
  const newest = await ChatMessage.find({ planId: id }).sort({ createdAt: -1, _id: -1 }).limit(200).lean();
  const messages = toPlain(newest.reverse());
  const sourceIds = [...new Set(messages.flatMap((message) => message.sourceIds))];
  // Only active sources are linked: an administrator turns off a source that is no longer right.
  const sources = await Source.find({ _id: { $in: sourceIds }, active: true })
    .select("title url")
    .lean();
  const sourcesById = Object.fromEntries(sources.map((s) => [String(s._id), { title: s.title, url: s.url }]));
  // Only whether the AI is on reaches the page, never the key.
  const ai = aiEnabled();

  const aside = (
    <>
      <Panel title="What it can answer">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {ai
            ? "An AI model (ChatGPT) writes each answer from your roadmap, budget and documents, and the official sources. " +
              "It says so when a question is outside what the plan covers."
            : "The assistant reads your roadmap, budget and documents, and the official sources. " +
              "It says so when a question is outside what the plan covers."}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {TOPICS.map((topic) => (
            <li key={topic} className="rounded-full border bg-secondary/60 px-3 py-1">
              {topic}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );

  return (
    <Split aside={aside}>
      <ChatPanel
        planId={id}
        messages={messages}
        sources={sourcesById}
        left={await quotaLeft(user.id, "chatMessages")}
        description="Answers use your roadmap and the official sources only."
        ai={ai}
      />
    </Split>
  );
}
