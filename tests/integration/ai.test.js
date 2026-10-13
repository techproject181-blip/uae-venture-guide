import mongoose from "mongoose";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { sourcesForQuestion } from "@/lib/chat/answer";
import { FAILED_ANSWER } from "@/lib/chat/failed-answer";
import { createPlanWithRoadmap, rebuildRoadmap } from "@/lib/plans";
import { quotaLeft } from "@/lib/quota";
import { generateRoadmap } from "@/lib/roadmap/generate";
import { ChatMessage } from "@/models/ChatMessage";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import { setupTestDatabase } from "../helpers/database";
import { addReferenceData, intake } from "../helpers/reference-data";

// The roadmap planner and the chat assistant with the AI connected. `fetch` is
// stubbed with canned OpenAI answers, so no request leaves the computer and no
// real key is needed. Each test turns the AI on or off itself.

// The chat route reads the signed-in user from the session cookie; here the
// tests choose who is signed in instead.
const session = vi.hoisted(() => ({ user: null }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => session.user }));

const { POST: chat } = await import("@/app/api/plans/[id]/chat/route");

setupTestDatabase("ai");

let sources, fees, owner, plan;
beforeAll(async () => {
  ({ sources, fees } = await addReferenceData());
  const user = await User.create({
    name: "Test founder",
    email: `founder-${Math.random()}@test.local`,
    passwordHash: "x",
    role: "entrepreneur",
    status: "active",
  });
  // The user object the app passes around after sign-in (see lib/session.js).
  owner = { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status };
  // The plan to chat about, made by the sample planner, which needs no AI.
  vi.stubEnv("OPENAI_API_KEY", "");
  const answers = intake();
  plan = await Plan.create({ ...answers, ...(await generateRoadmap(answers)), ownerId: user._id, status: "ready" });
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Turns the AI on with a test key and the default model, and answers every OpenAI request with `reply()`. Returns the fetch stub. */
function connectAi(reply) {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("OPENAI_MODEL", "");
  const fetch = vi.fn(async () => reply());
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

/** A finished Responses API answer whose text is `text`. */
function finished(text) {
  return Response.json({
    id: "resp_1",
    object: "response",
    status: "completed",
    output: [
      { id: "msg_1", type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text, annotations: [] }] },
    ],
  });
}

/**
 * A roadmap as the model might write it for the test plan: one supplied fee with
 * the wrong amounts, fees and sources it was never given, and one supplied fee
 * and source used correctly.
 */
function roadmapAnswer(fields = {}) {
  const step = (fields) => ({
    description: "What to do.",
    authority: "",
    feeId: null,
    sourceId: null,
    estimateMinAed: 0,
    estimateMaxAed: 0,
    recurrence: "one_time",
    days: 3,
    budgetCategory: "licensing",
    budgetLabel: "",
    ...fields,
  });
  return JSON.stringify({
    summary: "A plan to open a small karak café in Dubai, from choosing the activity to the first customers.",
    recommendedJurisdiction: "mainland",
    jurisdictionReason: "Your customers will visit in person, which is what a mainland licence is for.",
    tasks: [
      step({
        phase: "prepare",
        title: "Reserve your trade name",
        feeId: String(fees.dubaiTradeName._id),
        estimateMinAed: 50,
        estimateMaxAed: 99999,
        recurrence: "monthly",
        budgetLabel: "Trade name reservation",
      }),
      // Abu Dhabi's fee, and an inactive one: neither was given for a Dubai plan.
      step({
        phase: "prepare",
        title: "Get initial approval",
        feeId: String(fees.inactiveApproval._id),
        estimateMinAed: 100,
        estimateMaxAed: 500,
      }),
      step({
        phase: "licence",
        title: "Pay for your trade licence",
        feeId: String(fees.abuDhabiTradeName._id),
        estimateMinAed: 9000,
        estimateMaxAed: 13000,
      }),
      step({
        phase: "visas",
        title: "Get your Emirates ID",
        feeId: String(fees.emiratesId._id),
        budgetCategory: "visa",
        budgetLabel: "Emirates ID",
      }),
      // An Abu Dhabi source, which was not given either.
      step({
        phase: "launch",
        title: "Plan your launch marketing",
        sourceId: String(sources.added._id),
        estimateMinAed: 2000,
        estimateMaxAed: 8000,
      }),
    ],
    documents: [{ name: "Passport copy", description: "A clear colour copy.", required: true, sourceId: String(sources.det._id) }],
    risks: [
      {
        title: "Costs are higher than planned",
        description: "Fees and rent often rise.",
        likelihood: "medium",
        impact: "high",
        mitigation: "Keep three months of costs in reserve.",
      },
    ],
    ...fields,
  });
}

describe("a roadmap made by the AI", () => {
  test("is saved with official costs only from the fees it was given, with their own amounts and labels", async () => {
    const fetch = connectAi(() => finished(roadmapAnswer()));
    const made = await createPlanWithRoadmap(new mongoose.Types.ObjectId(), intake({ jurisdictionPref: "mainland" }));

    const saved = await Plan.findById(made._id).lean();
    expect(saved).toMatchObject({ status: "ready", generator: "openai:gpt-6-luna", recommendedJurisdiction: "mainland" });
    const task = (title) => saved.tasks.find((t) => t.title === title);
    expect(task("Reserve your trade name")).toMatchObject({
      costBasis: "reference",
      costMinAed: 620,
      costMaxAed: 620,
      feeReferenceId: fees.dubaiTradeName._id,
      sourceIds: [sources.det._id],
    });
    expect(task("Get your Emirates ID")).toMatchObject({ costBasis: "reference", costMaxAed: 370, sourceIds: [sources.icp._id] });
    for (const title of ["Get initial approval", "Pay for your trade licence"]) {
      expect(task(title).costBasis).toBe("estimate");
      expect(task(title).feeReferenceId).toBeUndefined();
    }
    expect(task("Pay for your trade licence")).toMatchObject({ costMinAed: 9000, costMaxAed: 13000 });
    expect(task("Plan your launch marketing").sourceIds).toEqual([]);
    expect(saved.budgetItems.find((item) => item.label === "Trade name reservation")).toMatchObject({
      estimatedAed: 620,
      recurrence: "one_time",
      costBasis: "reference",
      feeReferenceId: fees.dubaiTradeName._id,
    });
    expect(saved.documents[0].sourceId).toEqual(sources.det._id);

    // The model was given the same fees and sources as the sample planner: not
    // another emirate's, and not inactive ones.
    const [, request] = fetch.mock.calls[0];
    expect(request.headers.Authorization).toBe("Bearer test-key");
    const body = JSON.parse(request.body);
    expect(body).toMatchObject({ model: "gpt-6-luna", text: { format: { type: "json_schema", name: "startup_roadmap", strict: true } } });
    for (const given of [fees.dubaiTradeName, fees.dubaiLicence, fees.emiratesId, sources.det, sources.icp]) {
      expect(body.input).toContain(String(given._id));
    }
    for (const notGiven of [fees.abuDhabiTradeName, fees.inactiveApproval, sources.added, sources.inactive]) {
      expect(body.input).not.toContain(String(notGiven._id));
    }
  });

  test.each([
    ["text that is not JSON", () => finished("Here is your roadmap: {")],
    ["a roadmap with no steps", () => finished(roadmapAnswer({ tasks: [] }))],
    [
      "a refusal",
      () =>
        Response.json({
          status: "completed",
          output: [{ type: "message", content: [{ type: "refusal", refusal: "I can't help with that." }] }],
        }),
    ],
    ["an error", () => Response.json({ error: { message: "The server had an error." } }, { status: 500 })],
  ])("is marked failed, without a half-made roadmap, when the AI sends %s", async (_, reply) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    connectAi(reply);
    const made = await createPlanWithRoadmap(new mongoose.Types.ObjectId(), intake());
    expect(await Plan.findById(made._id).lean()).toMatchObject({
      status: "failed",
      failureReason: "The roadmap could not be made. Please try again.",
      tasks: [],
      budgetItems: [],
    });
  });

  test("can be made again with Try again after the AI failed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    connectAi(() => finished("not a roadmap"));
    const made = await createPlanWithRoadmap(new mongoose.Types.ObjectId(), intake());
    expect(made.status).toBe("failed");

    connectAi(() => finished(roadmapAnswer()));
    const retried = await rebuildRoadmap(await Plan.findById(made._id));
    expect(retried.toObject()).toMatchObject({ status: "ready", generator: "openai:gpt-6-luna" });
    expect(retried.tasks).toHaveLength(5);
  });
});

describe("the chat assistant with the AI", () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const sse = (event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  const delta = (text) => ({ type: "response.output_text.delta", item_id: "msg_1", output_index: 0, content_index: 0, delta: text });
  const COMPLETED = { type: "response.completed", response: { id: "resp_1", status: "completed" } };
  const QUESTION = "What does the trade licence cost?";

  /** An OpenAI event stream that the test writes to, one event at a time. */
  function liveEvents() {
    let controller;
    const stream = new ReadableStream({
      start(streamController) {
        controller = streamController;
      },
    });
    return {
      response: new Response(stream, { headers: { "Content-Type": "text/event-stream" } }),
      send: (event) => controller.enqueue(encoder.encode(sse(event))),
      end: () => controller.close(),
    };
  }

  /** Asks the chat route a question as the plan's owner, like the chat page does. */
  function ask(message) {
    session.user = owner;
    const request = new Request(`http://localhost/api/plans/${plan._id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return chat(request, { params: Promise.resolve({ id: String(plan._id) }) });
  }

  beforeEach(async () => {
    await ChatMessage.deleteMany({});
  });

  test("streams each piece of the answer as the AI writes it, then saves the question and answer together", async () => {
    const upstream = liveEvents();
    const fetch = connectAi(() => upstream.response);
    const response = await ask(QUESTION);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    const reader = response.body.getReader();
    const nextPiece = async () => decoder.decode((await reader.read()).value);

    upstream.send({ type: "response.created", response: { status: "in_progress" } });
    upstream.send(delta("Your trade licence costs "));
    // The first piece reaches the page while the AI is still writing, and nothing is saved yet.
    expect(await nextPiece()).toBe("Your trade licence costs ");
    expect(await ChatMessage.countDocuments({ planId: plan._id })).toBe(0);

    upstream.send(delta("AED 15,000 (official)."));
    expect(await nextPiece()).toBe("AED 15,000 (official).");
    upstream.send(COMPLETED);
    upstream.end();
    expect((await reader.read()).done).toBe(true);

    const saved = await ChatMessage.find({ planId: plan._id }).sort({ _id: 1 }).lean();
    expect(saved.map((message) => [message.role, message.content])).toEqual([
      ["user", QUESTION],
      ["assistant", "Your trade licence costs AED 15,000 (official)."],
    ]);
    // Saved with the sources the AI was given: the same ones the sample assistant links.
    const expected = await sourcesForQuestion(plan.toObject(), QUESTION);
    expect(saved[1].sourceIds.map(String)).toEqual(expected.map((source) => String(source._id)));
    expect(saved[1].sourceIds.map(String)).toContain(String(sources.det._id));

    // The model got the plan's facts, with each cost's label, and the sources without their links.
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ model: "gpt-6-luna", stream: true });
    expect(body.input).toContain(QUESTION);
    expect(body.input).toContain("AED 15,000 (official)");
    expect(body.input).toContain("Business licences in Dubai");
    expect(body.input).not.toContain("https://");
  });

  test("ends with a short sorry message and saves nothing when the AI fails part-way, though the question still counts", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failed = { type: "response.failed", response: { status: "failed", error: { message: "The model crashed." } } };
    connectAi(() => new Response(sse(delta("Your trade licence ")) + sse(failed), { headers: { "Content-Type": "text/event-stream" } }));
    const left = await quotaLeft(owner.id, "chatMessages");

    const response = await ask(QUESTION);
    expect(await response.text()).toBe(`Your trade licence \n\n${FAILED_ANSWER}`);
    expect(await ChatMessage.countDocuments({ planId: plan._id })).toBe(0);
    expect(await quotaLeft(owner.id, "chatMessages")).toBe(left - 1);
  });

  test("answers with only the sorry message when OpenAI turns the request down", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    connectAi(() => Response.json({ error: { message: "Incorrect API key provided." } }, { status: 401 }));
    expect(await (await ask("How long will it take?")).text()).toBe(FAILED_ANSWER);
    expect(await ChatMessage.countDocuments({ planId: plan._id })).toBe(0);
  });
});

describe("without an OpenAI key", () => {
  test("the sample planner and the sample assistant answer, and nothing is sent to OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    expect((await generateRoadmap(intake())).generator).toBe("sample-planner-v1");

    await ChatMessage.deleteMany({});
    session.user = owner;
    const request = new Request(`http://localhost/api/plans/${plan._id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "How long will it take?" }),
    });
    const text = await (await chat(request, { params: Promise.resolve({ id: String(plan._id) }) })).text();
    // The page gets exactly the saved answer, which ends with the sample notice.
    const saved = await ChatMessage.find({ planId: plan._id }).sort({ _id: 1 }).lean();
    expect(saved.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(text).toBe(saved[1].content);
    expect(text).toContain("This is a sample answer from the built-in assistant");
    expect(fetch).not.toHaveBeenCalled();
  });
});
