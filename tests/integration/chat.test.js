import { beforeAll, describe, expect, test } from "vitest";
import { answerQuestion } from "@/lib/chat/answer";
import { generateRoadmap } from "@/lib/roadmap/generate";
import { setupTestDatabase } from "../helpers/database";
import { addReferenceData, intake } from "../helpers/reference-data";

setupTestDatabase("chat");

const SAMPLE_NOTICE = "This is a sample answer from the built-in assistant";

let sources, plan;
beforeAll(async () => {
  ({ sources } = await addReferenceData());
  const answers = intake({ budgetAed: 40000 });
  plan = { ...answers, ...(await generateRoadmap(answers)) };
});

const ids = (list) => list.map(String);

describe("the sample chat assistant", () => {
  test("answers a cost question from the plan's own budget", async () => {
    const { text } = await answerQuestion(plan, "How much will everything cost?");
    expect(text).toMatch(/^Your estimated first-year cost is AED [\d,]+ against a budget of AED 40,000, so you are AED [\d,]+ over budget\./);
  });

  test("links only active sources for the plan's emirate or the whole UAE", async () => {
    const { sourceIds } = await answerQuestion(plan, "What does the trade licence cost?");
    expect(sourceIds.length).toBeGreaterThan(0);
    expect(ids(sourceIds)).toContain(String(sources.det._id));
    expect(ids(sourceIds)).not.toContain(String(sources.added._id)); // Abu Dhabi
    expect(ids(sourceIds)).not.toContain(String(sources.inactive._id));
  });

  test("says when the plan does not cover a question, and where to ask", async () => {
    const { text, sourceIds } = await answerQuestion(plan, "Can you recommend a football club?");
    expect(text).toContain("Your plan does not cover this question");
    expect(text).toContain("ask the Dubai Department of Economy and Tourism");
    expect(ids(sourceIds).sort()).toEqual(ids([sources.det._id, sources.dmcc._id]).sort());
  });

  test("ends every answer with the sample notice", async () => {
    for (const question of ["Which documents do I need?", "How long will it take?", "Can you recommend a football club?"]) {
      const { text } = await answerQuestion(plan, question);
      expect(text.split("\n\n").at(-1)).toContain(SAMPLE_NOTICE);
    }
  });
});
