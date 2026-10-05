import { z } from "zod";
import { EMIRATES, EXPERTISE, FUNDER_TYPES, SECTORS, valuesOf } from "@/lib/constants";
import { checkbox, multiChoice, optionalText, webUrl, wholeNumber } from "@/lib/schemas/helpers";

// Profiles, guidance requests, funding interest and experience posts.

const name = z.string("Enter your full name.").trim().min(2, "Enter your full name.").max(80, "Use 80 characters or fewer.");

export const mentorProfileSchema = z.object({
  name,
  headline: z.string("Write a one-line headline.").trim().min(5, "Write a one-line headline.").max(120, "Use 120 characters or fewer."),
  bio: z.string("Tell founders about your experience.").trim().min(30, "Tell founders about your experience (at least 30 characters).").max(2000, "Use 2,000 characters or fewer."),
  expertise: multiChoice(valuesOf(EXPERTISE), "Choose valid areas.").refine((list) => list.length > 0, "Choose at least one area."),
  industries: multiChoice(valuesOf(SECTORS), "Choose valid industries."),
  emirates: multiChoice(valuesOf(EMIRATES), "Choose valid emirates.").refine((list) => list.length > 0, "Choose at least one emirate."),
  yearsExperience: wholeNumber(0, 60, "Enter your years of experience (0 to 60)."),
  linkedinUrl: z.preprocess((value) => (value === "" ? undefined : value), webUrl("Enter your full LinkedIn address, starting with https://.").optional()),
  acceptingRequests: checkbox(),
});

export const funderProfileSchema = z
  .object({
    name,
    organization: z.string("Enter your organisation, or your own name if you invest alone.").trim().min(2, "Enter your organisation, or your own name if you invest alone.").max(120, "Use 120 characters or fewer."),
    funderType: z.enum(valuesOf(FUNDER_TYPES), "Choose what kind of funder you are."),
    ticketMinAed: wholeNumber(0, 1_000_000_000, "Enter the smallest amount you invest, in whole dirhams."),
    ticketMaxAed: wholeNumber(0, 1_000_000_000, "Enter the largest amount you invest, in whole dirhams."),
    sectors: multiChoice(valuesOf(SECTORS), "Choose valid sectors.").refine((list) => list.length > 0, "Choose at least one sector."),
    bio: z.string("Tell founders what you look for.").trim().min(30, "Tell founders what you look for (at least 30 characters).").max(2000, "Use 2,000 characters or fewer."),
  })
  .refine((profile) => profile.ticketMaxAed >= profile.ticketMinAed, {
    path: ["ticketMaxAed"],
    message: "The largest amount cannot be below the smallest.",
  });

export const mentorRequestSchema = z.object({
  mentorId: z.string().min(1, "Choose a mentor."),
  topic: z.string("Write what you need help with.").trim().min(5, "Write what you need help with.").max(120, "Use 120 characters or fewer."),
  message: z.string("Write a short message.").trim().min(20, "Write a short message (at least 20 characters).").max(2000, "Use 2,000 characters or fewer."),
  planId: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
});

export const mentorReplySchema = z
  .object({
    action: z.enum(["accept", "decline", "complete"], "Choose an action."),
    reply: optionalText(2000),
  });

export const interestSchema = z.object({
  message: z.string("Write a short message.").trim().min(20, "Write a short message to the owner (at least 20 characters).").max(1000, "Use 1,000 characters or fewer."),
});

export const interestReplySchema = z.object({
  action: z.enum(["accept", "decline"], "Choose an action."),
});

export const sharingSchema = z
  .object({
    shared: checkbox(),
    pitchSummary: optionalText(600),
  })
  .refine((data) => !data.shared || (data.pitchSummary && data.pitchSummary.length >= 30), {
    path: ["pitchSummary"],
    message: "Write a pitch summary of at least 30 characters before sharing.",
  });

const imageUrl = z.preprocess((value) => (value === "" ? undefined : value), webUrl("Enter a full picture address starting with https://.").optional());
const imageAlt = optionalText(200);

/**
 * A post form has five fixed picture slots (imageUrl1 + imageAlt1 … 5) and six
 * fixed chart rows (chartLabel1 + chartValue1 … 6), which the API turns into
 * the `images` list and the `chart` object.
 */
export const postSchema = z
  .object({
    title: z.string("Give the post a title.").trim().min(5, "Give the post a title.").max(140, "Use 140 characters or fewer."),
    body: z.string("Write the post.").trim().min(50, "Write the post (at least 50 characters).").max(20000, "Use 20,000 characters or fewer."),
    chartType: z.enum(["", "bar", "line", "pie"]).default(""),
    chartTitle: optionalText(120),
    ...Object.fromEntries([1, 2, 3, 4, 5].flatMap((n) => [[`imageUrl${n}`, imageUrl], [`imageAlt${n}`, imageAlt]])),
    ...Object.fromEntries(
      [1, 2, 3, 4, 5, 6].flatMap((n) => [
        [`chartLabel${n}`, optionalText(40)],
        [`chartValue${n}`, z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number("Enter a number.").optional())],
      ]),
    ),
  })
  .superRefine((post, ctx) => {
    for (const n of [1, 2, 3, 4, 5]) {
      if (post[`imageUrl${n}`] && !post[`imageAlt${n}`]) {
        ctx.addIssue({ code: "custom", path: [`imageAlt${n}`], message: "Describe the picture for people who cannot see it." });
      }
    }
    if (post.chartType) {
      const rows = [1, 2, 3, 4, 5, 6].filter((n) => post[`chartLabel${n}`] && post[`chartValue${n}`] !== undefined);
      if (rows.length < 2) ctx.addIssue({ code: "custom", path: ["chartLabel1"], message: "A chart needs at least two rows with a label and a number." });
    }
  });

/** Turns the fixed form slots into the post's images list and chart object. */
export function postFromForm(data) {
  const images = [1, 2, 3, 4, 5]
    .filter((n) => data[`imageUrl${n}`])
    .map((n) => ({ url: data[`imageUrl${n}`], alt: data[`imageAlt${n}`] }));
  const rows = [1, 2, 3, 4, 5, 6].filter((n) => data[`chartLabel${n}`] && data[`chartValue${n}`] !== undefined);
  const chart = data.chartType
    ? {
        type: data.chartType,
        title: data.chartTitle,
        labels: rows.map((n) => data[`chartLabel${n}`]),
        values: rows.map((n) => data[`chartValue${n}`]),
      }
    : undefined;
  return { title: data.title, body: data.body, images, chart };
}
