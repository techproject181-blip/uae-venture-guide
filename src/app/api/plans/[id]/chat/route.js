import { readBody, requireApiUser, route } from "@/lib/api";
import { answerQuestion } from "@/lib/chat/answer";
import { findOwnPlan } from "@/lib/plans";
import { consumeQuota } from "@/lib/quota";
import { chatSchema } from "@/lib/schemas/plans";
import { ChatMessage } from "@/models/ChatMessage";

// POST /api/plans/:id/chat  { message }: ask the assistant about the plan. Owner only.
// The answer comes back as a text stream, so the page can show it as it arrives.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const { message } = await readBody(request, chatSchema);
  const plan = await findOwnPlan(id, user);
  await consumeQuota(user.id, "chatMessages"); // counts against the daily limit, or answers 429

  await ChatMessage.create({ planId: plan._id, role: "user", content: message });
  const answer = await answerQuestion(plan.toObject(), message);
  await ChatMessage.create({ planId: plan._id, role: "assistant", content: answer.text, sourceIds: answer.sourceIds });

  // The sample assistant has its whole answer at once; it is still sent a few
  // words at a time, the way an AI provider streams, so the page works the
  // same when a real one is connected.
  const encoder = new TextEncoder();
  const pieces = answer.text.match(/\S+\s*/g) ?? [];
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < pieces.length; i += 3) {
        controller.enqueue(encoder.encode(pieces.slice(i, i + 3).join("")));
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
});
