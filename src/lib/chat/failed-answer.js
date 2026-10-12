// The sentence an AI answer ends with when the AI stopped part-way. Nothing was
// saved then, so the chat page shows it as an error and puts the question back
// in the box. It is kept here, outside the server-only chat code, because the
// API route sends it and the page in the browser looks for it.
export const FAILED_ANSWER = "Sorry, the assistant could not finish this answer, so it was not saved. Please ask again.";
