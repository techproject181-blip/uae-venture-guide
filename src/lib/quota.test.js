import { describe, expect, test } from "vitest";
import { uaeDay } from "@/lib/quota";

describe("uaeDay", () => {
  // The UAE is 4 hours ahead of UTC all year, so the daily limits reset at 20:00 UTC.
  test("starts a new day at midnight UAE time", () => {
    expect(uaeDay(new Date("2026-10-04T19:59:59Z"))).toBe("2026-10-04");
    expect(uaeDay(new Date("2026-10-04T20:00:00Z"))).toBe("2026-10-05");
  });
});
