import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { AiUsage } from "@/models/AiUsage";

// Daily limits per user, so AI costs stay under control.
export const DAILY_LIMITS = { generations: 5, chatMessages: 40 };

const MESSAGES = {
  generations: `You have made ${DAILY_LIMITS.generations} roadmaps today, the daily limit. Please try again tomorrow.`,
  chatMessages: `You have sent ${DAILY_LIMITS.chatMessages} chat messages today, the daily limit. Please try again tomorrow.`,
};

/** Today's date in the UAE, as "YYYY-MM-DD". */
export function uaeDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(date);
}

/** The UAE date `days` days ago, for example to list the last two weeks. */
export function uaeDayAgo(days) {
  return uaeDay(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

/**
 * Counts one use of `kind` ("generations" or "chatMessages") for today, or
 * throws a 429 error when the user is already at the limit.
 *
 * Checking and counting happen in one database call: the filter only matches
 * while the count is under the limit. At the limit the filter matches nothing,
 * so the upsert tries to create a second document for the same user and day,
 * and the unique index rejects it. Two requests at the same moment therefore
 * cannot both get past the limit.
 */
export async function consumeQuota(userId, kind) {
  await connectDB();
  try {
    await AiUsage.findOneAndUpdate(
      { userId, day: uaeDay(), [kind]: { $lt: DAILY_LIMITS[kind] } },
      { $inc: { [kind]: 1 } },
      { upsert: true },
    );
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(429, MESSAGES[kind]);
    throw error;
  }
}

/** How many uses of `kind` the user has left today. */
export async function quotaLeft(userId, kind) {
  await connectDB();
  const usage = await AiUsage.findOne({ userId, day: uaeDay() }).lean();
  return Math.max(0, DAILY_LIMITS[kind] - (usage?.[kind] ?? 0));
}
