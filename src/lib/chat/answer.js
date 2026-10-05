import { estimatedWeeks, firstYearTotal, remainingBudget } from "@/lib/budget";
import { EMIRATES, JURISDICTIONS, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatAed, formatAedRange } from "@/lib/format";
import { LICENSING_AUTHORITIES } from "@/lib/roadmap/templates";
import { Source } from "@/models/Source";

// The sample chat assistant, used while no AI provider is connected. It
// answers only from the plan and the official sources, like the real
// assistant must, and says when a question is outside what the plan covers.

export const ASSISTANT = "sample-assistant-v1";
const MAX_SOURCES = 3;

// Topics the assistant recognises, by the words a question uses.
const TOPICS = [
  { key: "cost", words: ["cost", "fee", "price", "pay", "budget", "money", "expensive", "cheap", "aed", "dirham"] },
  { key: "documents", words: ["document", "documents", "paper", "papers", "passport", "photo", "noc", "lease", "contract"] },
  { key: "visa", words: ["visa", "visas", "residence", "emirates id", "medical", "establishment card", "sponsor"] },
  { key: "jurisdiction", words: ["mainland", "free zone", "freezone", "jurisdiction", "where to register"] },
  { key: "time", words: ["how long", "time", "weeks", "days", "when", "fast", "quick", "deadline"] },
  { key: "risk", words: ["risk", "risks", "danger", "fail", "problem", "worry"] },
  { key: "tax", words: ["tax", "vat", "corporate tax"] },
];

/** Answers a question about `plan`. Returns { text, sourceIds }. */
export async function answerQuestion(plan, question) {
  const q = question.toLowerCase();
  const topics = TOPICS.filter((topic) => topic.words.some((word) => q.includes(word))).map((topic) => topic.key);
  const parts = topics.map((topic) => SECTIONS[topic](plan));

  // Which sources to show depends on what the answer is based on:
  // a known topic -> sources matching the question's words;
  // matching roadmap steps -> the sources those steps cite;
  // nothing -> the emirate's licensing authority, the right place to ask.
  let sources;
  if (parts.length > 0) {
    sources = await searchSources(plan, { $text: { $search: question } });
  } else {
    const steps = matchingTasks(plan, q);
    if (steps.length > 0) {
      parts.push(
        "These steps in your roadmap match your question:\n" +
          steps.map((task) => `- ${task.title}: ${task.description} ${costText(task)}`).join("\n"),
      );
      sources = await searchSources(plan, { _id: { $in: steps.flatMap((task) => task.sourceIds) } });
    } else {
      parts.push(
        `Your plan does not cover this question. For business licences in ${labelOf(EMIRATES, plan.emirate)}, ` +
          `ask the ${LICENSING_AUTHORITIES[plan.emirate]}.`,
      );
      sources = await searchSources(plan, { categories: "licensing", emirate: plan.emirate });
    }
  }
  // The sources are shown as links under the answer, so the text does not list them.
  parts.push("This is a sample answer from the built-in assistant, while the AI service is not connected. Check the official source before you act.");

  return { text: parts.join("\n\n"), sourceIds: sources.map((source) => source._id) };
}

const SECTIONS = {
  cost(plan) {
    const total = firstYearTotal(plan.budgetItems);
    const remaining = remainingBudget(plan.budgetAed, plan.budgetItems);
    const biggest = [...plan.tasks].sort((a, b) => b.costMaxAed - a.costMaxAed).slice(0, 3);
    return (
      `Your estimated first-year cost is ${formatAed(total)} against a budget of ${formatAed(plan.budgetAed)}, ` +
      `so you are ${remaining >= 0 ? `${formatAed(remaining)} under` : `${formatAed(-remaining)} over`} budget.\n` +
      `The biggest costs in your roadmap:\n` +
      biggest.map((task) => `- ${task.title}: ${costText(task)}`).join("\n")
    );
  },
  documents(plan) {
    const missing = plan.documents.filter((doc) => doc.required && !doc.obtained);
    if (missing.length === 0) return "You have every required document in your checklist.";
    return `You still need these required documents:\n${missing.map((doc) => `- ${doc.name}: ${doc.description}`).join("\n")}`;
  },
  visa(plan) {
    const visaTasks = plan.tasks.filter((task) => /visa|emirates id|establishment card|medical/i.test(task.title));
    return `Your visa steps, in order:\n${visaTasks.map((task) => `- ${task.title}: ${costText(task)}, about ${task.estDays} days`).join("\n")}`;
  },
  jurisdiction(plan) {
    return `Your roadmap recommends ${labelOf(JURISDICTIONS, plan.recommendedJurisdiction).toLowerCase()}. ${plan.jurisdictionReason}`;
  },
  time(plan) {
    const open = plan.tasks.filter((task) => task.status !== "done").length;
    return `The whole roadmap takes about ${estimatedWeeks(plan.phases, plan.tasks)} weeks. You have ${open} of ${plan.tasks.length} steps left.`;
  },
  risk(plan) {
    const weight = { low: 1, medium: 2, high: 3 };
    const top = [...plan.risks].sort((a, b) => weight[b.likelihood] * weight[b.impact] - weight[a.likelihood] * weight[a.impact]).slice(0, 2);
    return `Your biggest risks:\n${top.map((risk) => `- ${risk.title}. What to do: ${risk.mitigation}`).join("\n")}`;
  },
  tax(plan) {
    const taxTasks = plan.tasks.filter((task) => /tax|vat/i.test(task.title));
    return `Tax steps in your roadmap:\n${taxTasks.map((task) => `- ${task.title}: ${task.description}`).join("\n")}`;
  },
};

function costText(task) {
  if (!task.costMinAed && !task.costMaxAed) return "no fee";
  const basis = { reference: "official", demo: "demo fee, not checked yet" }[task.costBasis] ?? "estimate";
  return `${formatAedRange(task.costMinAed, task.costMaxAed)} (${basis})`;
}

/** Tasks sharing at least two meaningful words with the question, best first. */
function matchingTasks(plan, q) {
  const words = q.split(/[^a-z]+/).filter((word) => word.length > 3);
  return plan.tasks
    .map((task) => {
      const text = `${task.title} ${task.description}`.toLowerCase();
      return { task, score: words.filter((word) => text.includes(word)).length };
    })
    .filter((match) => match.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((match) => match.task);
}

/** Up to three active sources for the plan's emirate (or federal) that also match `filter`. */
async function searchSources(plan, filter) {
  await connectDB();
  const query = { active: true, emirate: { $in: [plan.emirate, null] }, ...filter };
  const byScore = "$text" in filter;
  return Source.find(query, byScore ? { score: { $meta: "textScore" } } : {})
    .sort(byScore ? { score: { $meta: "textScore" } } : { title: 1 })
    .limit(MAX_SOURCES)
    .lean();
}
