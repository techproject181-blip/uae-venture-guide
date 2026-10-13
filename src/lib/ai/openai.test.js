import { afterEach, describe, expect, test, vi } from "vitest";
import { aiEnabled, aiModel, generateJson, streamText } from "@/lib/ai/openai";

// The OpenAI client with `fetch` stubbed, so no request leaves the computer and
// no real key is needed.

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** Turns the AI on with a test key and the default model, and answers every request with `reply()`. Returns the fetch stub. */
function connect(reply) {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("OPENAI_MODEL", "");
  const fetch = vi.fn(async () => reply());
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

/** A finished Responses API answer whose message holds `content`. */
const finished = (...content) =>
  Response.json({
    id: "resp_1",
    object: "response",
    status: "completed",
    output: [
      { id: "rs_1", type: "reasoning", summary: [] },
      { id: "msg_1", type: "message", role: "assistant", status: "completed", content },
    ],
  });
const outputText = (text) => ({ type: "output_text", text, annotations: [] });

const encoder = new TextEncoder();
const sse = (event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
const delta = (text) => ({ type: "response.output_text.delta", item_id: "msg_1", output_index: 0, content_index: 0, delta: text });
const COMPLETED = { type: "response.completed", response: { id: "resp_1", status: "completed" } };

/** A server-sent event stream of `text`, sent in pieces of `size` bytes, so events (and letters) break across pieces. */
function eventStream(text, size = 5) {
  const bytes = encoder.encode(text);
  const body = new ReadableStream({
    start(controller) {
      for (let i = 0; i < bytes.length; i += size) controller.enqueue(bytes.slice(i, i + size));
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
}

/** Reads every piece into `seen`, so a test can check what arrived before an error. */
async function readAll(pieces, seen = []) {
  for await (const piece of pieces) seen.push(piece);
  return seen;
}

const SCHEMA = { type: "object", additionalProperties: false, required: ["ok"], properties: { ok: { type: "boolean" } } };
const ask = (fields = {}) => generateJson({ name: "check", instructions: "Say ok.", input: "Hello", schema: SCHEMA, ...fields });

describe("the AI switch", () => {
  test("is off without a key or with a blank one, and on with a key", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(aiEnabled()).toBe(false);
    vi.stubEnv("OPENAI_API_KEY", "   ");
    expect(aiEnabled()).toBe(false);
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    expect(aiEnabled()).toBe(true);
  });

  test("uses gpt-6-luna unless OPENAI_MODEL names another model", () => {
    vi.stubEnv("OPENAI_MODEL", "");
    expect(aiModel()).toBe("gpt-6-luna");
    vi.stubEnv("OPENAI_MODEL", "gpt-6.1-sol");
    expect(aiModel()).toBe("gpt-6.1-sol");
  });
});

describe("a JSON answer", () => {
  test("is asked for with a strict JSON Schema and comes back as an object", async () => {
    const fetch = connect(() => finished(outputText('{"ok":true}')));
    expect(await ask()).toEqual({ ok: true });

    const [url, request] = fetch.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(request).toMatchObject({ method: "POST", headers: { Authorization: "Bearer test-key", "Content-Type": "application/json" } });
    expect(JSON.parse(request.body)).toEqual({
      model: "gpt-6-luna",
      instructions: "Say ok.",
      input: "Hello",
      text: { format: { type: "json_schema", name: "check", strict: true, schema: SCHEMA } },
    });
  });

  test("is put together from every text part of the message", async () => {
    connect(() => finished(outputText('{"ok":'), outputText("false}")));
    expect(await ask()).toEqual({ ok: false });
  });

  test("throws a clear error when OpenAI answers with an HTTP error", async () => {
    connect(() => Response.json({ error: { message: "Incorrect API key provided." } }, { status: 401 }));
    await expect(ask()).rejects.toThrow("OpenAI answered with HTTP 401: Incorrect API key provided.");
  });

  test("throws when the model refuses", async () => {
    connect(() => finished({ type: "refusal", refusal: "I can't help with that." }));
    await expect(ask()).rejects.toThrow("The model refused to answer: I can't help with that.");
  });

  test("throws when the answer is not valid JSON", async () => {
    connect(() => finished(outputText("Here is your roadmap: {")));
    await expect(ask()).rejects.toThrow("The model's answer is not valid JSON.");
  });

  test("throws when OpenAI takes too long", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    // Like the real fetch, the request fails with the signal's reason when the time runs out.
    vi.stubGlobal(
      "fetch",
      vi.fn((url, { signal }) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason)))),
    );
    await expect(ask({ timeoutMs: 50 })).rejects.toThrow("OpenAI did not answer within 0.05 seconds.");
  });

  test("throws when OpenAI cannot be reached", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(ask()).rejects.toThrow("The connection to OpenAI failed: fetch failed");
  });

  test("is never asked for without a key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(ask()).rejects.toThrow("OPENAI_API_KEY is not set.");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("a streamed answer", () => {
  test("yields the text as it arrives, skipping the other events, even when events and letters break across pieces", async () => {
    const events = [
      { type: "response.created", response: { status: "in_progress" } },
      delta("Karak café: "),
      delta("AED 15,000–20,000 "),
      delta("(estimate)."),
    ];
    const fetch = connect(() => eventStream([...events, { type: "response.output_text.done", text: "…" }, COMPLETED].map(sse).join("")));
    expect(await readAll(streamText({ instructions: "Answer.", input: "How much?" }))).toEqual([
      "Karak café: ",
      "AED 15,000–20,000 ",
      "(estimate).",
    ]);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      model: "gpt-6-luna",
      instructions: "Answer.",
      input: "How much?",
      stream: true,
    });
  });

  test("reads events with Windows line ends and data split over several lines", async () => {
    connect(() => eventStream('data: {"type": "response.output_text.delta",\r\ndata: "delta": "Hello"}\r\n\r\n' + sse(COMPLETED)));
    expect(await readAll(streamText({ instructions: "", input: "" }))).toEqual(["Hello"]);
  });

  test("throws when OpenAI reports a failure part-way, after the text so far", async () => {
    const failed = {
      type: "response.failed",
      response: { status: "failed", error: { code: "server_error", message: "The model crashed." } },
    };
    connect(() => eventStream(sse(delta("Your licence ")) + sse(failed)));
    const seen = [];
    await expect(readAll(streamText({ instructions: "", input: "" }), seen)).rejects.toThrow(
      "OpenAI could not finish the answer: The model crashed.",
    );
    expect(seen).toEqual(["Your licence "]);
  });

  test("throws on an error event", async () => {
    connect(() => eventStream(sse({ type: "error", code: "rate_limit_exceeded", message: "Rate limit reached." })));
    await expect(readAll(streamText({ instructions: "", input: "" }))).rejects.toThrow("OpenAI stopped with an error: Rate limit reached.");
  });

  test("throws when the stream ends before the answer is complete", async () => {
    connect(() => eventStream(sse(delta("Half an ans"))));
    await expect(readAll(streamText({ instructions: "", input: "" }))).rejects.toThrow("OpenAI's answer stopped before it was complete.");
  });

  test("throws when the answer takes too long to arrive", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    // Like the real fetch, the stream breaks with the signal's reason when the time runs out.
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, { signal }) => {
        const body = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(sse(delta("Hi"))));
            signal.addEventListener("abort", () => controller.error(signal.reason));
          },
        });
        return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
      }),
    );
    await expect(readAll(streamText({ instructions: "", input: "", timeoutMs: 50 }))).rejects.toThrow(
      "OpenAI did not answer within 0.05 seconds.",
    );
  });
});
