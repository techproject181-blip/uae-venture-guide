// The OpenAI (ChatGPT) API, called with plain fetch. When OPENAI_API_KEY is set,
// the roadmap planner and the plan assistant use it; without a key the app keeps
// to its built-in sample mode. The key is read only here, on the server, and is
// never sent to the browser.
//
// Every request goes to the Responses API. A JSON answer comes back in one
// piece (generateJson); a text answer can arrive piece by piece (streamText).

const RESPONSES_URL = "https://api.openai.com/v1/responses";

// The balanced model. gpt-6-luna is cheaper, and gpt-6-astra the most capable.
const DEFAULT_MODEL = "gpt-6-luna";

/** Whether the AI is connected: true when OPENAI_API_KEY is set. */
export function aiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** The model to ask: OPENAI_MODEL, or gpt-6-luna when it is not set. */
export function aiModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

/**
 * Asks the model for an answer that matches `schema` (a strict JSON Schema
 * called `name`) and returns it as an object. Throws a clear error when OpenAI
 * cannot be reached or answers with an error, when the model refuses or takes
 * too long, and when the answer is not valid JSON.
 */
export async function generateJson({ name, instructions, input, schema, timeoutMs = 100_000 }) {
  const format = { type: "json_schema", name, strict: true, schema };
  const response = await send({ model: aiModel(), instructions, input, text: { format } }, timeoutMs);
  const body = await response.json().catch((error) => {
    throw error.name === "SyntaxError" ? new Error("OpenAI sent a reply that is not JSON.") : clearError(error, timeoutMs);
  });
  const text = outputText(body);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The model's answer is not valid JSON.");
  }
}

/**
 * Asks the model for a plain text answer and yields it piece by piece, as the
 * model writes it. Throws a clear error when the request fails, when OpenAI
 * reports an error part-way, and when the answer stops before it is complete.
 */
export async function* streamText({ instructions, input, timeoutMs = 50_000 }) {
  const response = await send({ model: aiModel(), instructions, input, stream: true }, timeoutMs);
  try {
    for await (const event of serverSentEvents(response.body)) {
      switch (event?.type) {
        case "response.output_text.delta":
          if (typeof event.delta === "string" && event.delta) yield event.delta;
          break;
        case "response.completed":
          return;
        case "response.failed":
          throw new Error(`OpenAI could not finish the answer: ${event.response?.error?.message ?? "no reason given"}`);
        case "error":
          throw new Error(`OpenAI stopped with an error: ${event.message ?? event.error?.message ?? "no reason given"}`);
        // Other events (the answer starting, a part being added…) are not needed.
      }
    }
  } catch (error) {
    throw clearError(error, timeoutMs);
  }
  // The stream closed without "response.completed", so the answer may be cut short.
  throw new Error("OpenAI's answer stopped before it was complete.");
}

/** Posts `body` to the Responses API and returns the response. Throws a clear error when the request fails. */
async function send(body, timeoutMs) {
  if (!aiEnabled()) throw new Error("OPENAI_API_KEY is not set.");
  let response;
  try {
    response = await fetch(RESPONSES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY.trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Stops the request when it takes too long, even while a stream is still arriving.
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw clearError(error, timeoutMs);
  }
  if (!response.ok) {
    // OpenAI says what went wrong in { error: { message } }.
    const reason = await response.json().then(
      (json) => json?.error?.message,
      () => null,
    );
    throw new Error(`OpenAI answered with HTTP ${response.status}${reason ? `: ${reason}` : ""}`);
  }
  return response;
}

/**
 * The text of a finished answer: the "output_text" parts of its "message"
 * items (the SDKs call this output_text). A refusal becomes an error.
 */
function outputText(body) {
  if (body?.status === "failed") throw new Error(`OpenAI could not answer: ${body.error?.message ?? "no reason given"}`);
  if (body?.status === "incomplete") {
    throw new Error(`OpenAI stopped before the answer was complete: ${body.incomplete_details?.reason ?? "no reason given"}`);
  }
  const items = Array.isArray(body?.output) ? body.output : [];
  const parts = items.filter((item) => item?.type === "message").flatMap((item) => item.content ?? []);
  const refusal = parts.find((part) => part?.type === "refusal");
  if (refusal) throw new Error(`The model refused to answer: ${refusal.refusal ?? "no reason given"}`);
  const text = parts
    .filter((part) => part?.type === "output_text")
    .map((part) => part.text ?? "")
    .join("");
  if (!text) throw new Error("The model's answer has no text.");
  return text;
}

/**
 * The events of a server-sent event stream (`body`, a stream of bytes), each
 * read from its "data:" lines as JSON. A blank line ends each event; other
 * lines, such as "event:", are skipped.
 */
async function* serverSentEvents(body) {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const bytes of body) {
    // A piece of the stream can stop in the middle of an event, or even of a
    // letter, so text waits in the buffer until the blank line after it arrives.
    buffer = (buffer + decoder.decode(bytes, { stream: true })).replaceAll("\r\n", "\n");
    let end;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const event = parseEvent(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
      if (event) yield event;
    }
  }
  // The last event may end without a blank line.
  const last = parseEvent(buffer + decoder.decode());
  if (last) yield last;
}

/** One event's data, read as JSON, or null when it has no "data:" lines. */
function parseEvent(block) {
  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).replace(/^ /, ""))
    .join("\n");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    throw new Error("OpenAI sent an event that is not valid JSON.");
  }
}

/** Says what happened when a request or a stream fails: it took too long, or the connection broke. */
function clearError(error, timeoutMs) {
  if (error?.name === "TimeoutError") return new Error(`OpenAI did not answer within ${timeoutMs / 1000} seconds.`, { cause: error });
  if (error instanceof TypeError) return new Error(`The connection to OpenAI failed: ${error.message}`, { cause: error });
  return error;
}
