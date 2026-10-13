import mongoose from "mongoose";
import { describe, expect, test } from "vitest";
import { DAILY_LIMITS, quotaLeft, consumeQuota } from "@/lib/quota";
import { setupTestDatabase } from "../helpers/database";

setupTestDatabase("quota");

describe("daily limits", () => {
  test("allows 5 roadmaps a day, then answers 429", async () => {
    const userId = new mongoose.Types.ObjectId();
    for (let i = 0; i < DAILY_LIMITS.generations; i++) await consumeQuota(userId, "generations");

    await expect(consumeQuota(userId, "generations")).rejects.toMatchObject({ status: 429 });
    expect(await quotaLeft(userId, "generations")).toBe(0);
  });

  test("counts roadmaps and chat messages separately", async () => {
    const userId = new mongoose.Types.ObjectId();
    await consumeQuota(userId, "generations");

    expect(await quotaLeft(userId, "generations")).toBe(DAILY_LIMITS.generations - 1);
    expect(await quotaLeft(userId, "chatMessages")).toBe(DAILY_LIMITS.chatMessages);
  });

  test("lets exactly 5 through when 10 requests arrive at the same moment", async () => {
    const userId = new mongoose.Types.ObjectId();
    const results = await Promise.allSettled(Array.from({ length: 10 }, () => consumeQuota(userId, "generations")));

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(5);
    expect(results.filter((result) => result.reason?.status === 429)).toHaveLength(5);
  });
});
