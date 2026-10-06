import { z } from "zod";

// Messages between a founder and a mentor about a guidance request.

export const requestMessageSchema = z.object({
  body: z.string("Write a message.").trim().min(1, "Write a message.").max(2000, "Use 2,000 characters or fewer."),
});

/** The query of GET /api/requests/:id/messages: only messages newer than `after`, when given. */
export const messagesQuerySchema = z.object({
  after: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.iso.datetime("Use a date and time such as YYYY-MM-DDTHH:mm:ss.sssZ.").optional(),
  ),
});
