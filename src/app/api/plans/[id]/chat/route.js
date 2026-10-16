import { aiEnabled } from "@/lib/ai/openai";
import { ApiError, readBody, requireApiUser, route } from "@/lib/api";
import { streamAnswer } from "@/lib/chat/ai-answer";
import { answerQuestion } from "@/lib/chat/answer";
import { findOwnPlan } from "@/lib/plans";
import { consumeQuota } from "@/lib/quota";
import { chatSchema } from "@/lib/schemas/plans";
import { ChatMessage } from "@/models/ChatMessage";

// An AI answer streams for some seconds. On hosts that limit how long a
// request may run, this one may run for up to a minute.
export const maxDuration = 60;

// POST /api/plans/:id/chat  { message }: ask the assistant about the plan. Owner only.
// The answer comes back as a text stream, so the page can show it as it arrives.
export const POST = route(async (request, { params }) => {
  const user = await requireApiUser("entrepreneur");
  const { id } = await params;
  const { message } = await readBody(request, chatSchema);
  const plan = await findOwnPlan(id, user);
  // There is nothing to answer from until the roadmap is made.
  if (plan.status !== "ready") throw new ApiError(409, "The roadmap is not ready yet.");
  await consumeQuota(user.id, "chatMessages"); // counts against the daily limit, or answers 429

  // With an OpenAI key, each piece of the AI's answer is sent on as soon as it
  // is written; the question and answer are saved once the answer is complete.
  if (aiEnabled()) return textStream(streamAnswer(plan.toObject(), message));

  // The sample assistant: the answer is made first, then saved with the
  // question in one write, so an error never leaves a question without its answer.
  const answer = await answerQuestion(plan.toObject(), message);
  // A plan with many long steps can make a very long answer; it is cut to what a message can hold.
  const text = answer.text.slice(0, 8000);
  await ChatMessage.insertMany([
    { planId: plan._id, role: "user", content: message },
    { planId: plan._id, role: "assistant", content: text, sourceIds: answer.sourceIds },
  ]);
  return textStream(aFewWordsAtATime(text));
});

/** A plain text response that sends each piece from `pieces` (an async generator) as soon as it is ready. */
function textStream(pieces) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await pieces.next();
      if (done) controller.close();
      else controller.enqueue(encoder.encode(value));
    },
    // The page stopped reading (it was closed), so the answer stops too.
    async cancel() {
      await pieces.return();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

// The sample assistant has its whole answer at once; it is still sent a few
// words at a time, the way the AI streams, so the page works the same either way.
async function* aFewWordsAtATime(text) {
  const pieces = text.match(/\S+\s*/g) ?? [];
  for (let i = 0; i < pieces.length; i += 3) {
    yield pieces.slice(i, i + 3).join("");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
