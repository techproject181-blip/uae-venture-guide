import { streamText } from "@/lib/ai/openai";
import { estimatedWeeks, firstYearTotal, paidTotal, remainingBudget } from "@/lib/budget";
import { basisText, costText, sourcesForQuestion } from "@/lib/chat/answer";
import { FAILED_ANSWER } from "@/lib/chat/failed-answer";
import {
  BUDGET_CATEGORIES,
  EMIRATES,
  JURISDICTIONS,
  JURISDICTION_PREFERENCES,
  RECURRENCES,
  SECTORS,
  TASK_STATUSES,
  labelOf,
} from "@/lib/constants";
import { formatAed } from "@/lib/format";
import { ChatMessage } from "@/models/ChatMessage";

// The AI chat assistant, used when an OpenAI key is set. The model gets the
// plan's facts and the same official sources (up to three) that the sample
// assistant would link, and must answer from those alone. The page shows
// those sources as links under the answer.

const INSTRUCTIONS = `You are the plan assistant of UAE Venture Guide. You answer a founder's question about their own plan to start a business in the United Arab Emirates.

Rules:
- Answer only from the plan data and the official sources given. Never invent fees, amounts, rules or steps.
- If the plan data and the sources do not cover the question, say so plainly, and say who to ask when the plan names them.
- Use short, plain English: a few sentences, with lines that start with "- " for a list. No headings, tables, bold text or numbered lists.
- Give each amount exactly as the plan shows it, with its label (official, demo fee or estimate).
- Do not put links or web addresses in the answer. The page shows the sources as links under it.`;

/**
 * The AI's answer to `question` about `plan`, yielded piece by piece as the
 * model writes it. Once the whole answer has arrived, the question and the
 * answer are saved together in one write, with the sources the model was
 * given. If the AI fails part-way, the answer ends with a short sorry message
 * and nothing is saved.
 */
export async function* streamAnswer(plan, question) {
  let text = "";
  try {
    const sources = await sourcesForQuestion(plan, question);
    for await (const piece of streamText({ instructions: INSTRUCTIONS, input: questionInput(plan, question, sources) })) {
      text += piece;
      yield piece;
    }
    if (!text.trim()) throw new Error("The model sent an empty answer.");
    await ChatMessage.insertMany([
      { planId: plan._id, role: "user", content: question },
      // A saved message holds at most 8,000 characters (models/ChatMessage.js), so a very long answer is cut to fit.
      { planId: plan._id, role: "assistant", content: text.trim().slice(0, 8000), sourceIds: sources.map((source) => source._id) },
    ]);
  } catch (error) {
    console.error("The AI chat answer failed:", error);
    yield `${text ? "\n\n" : ""}${FAILED_ANSWER}`;
  }
}

/** The plan's facts and the official sources, as JSON, followed by the question. */
function questionInput(plan, question, sources) {
  const phaseTitles = new Map(plan.phases.map((phase) => [String(phase._id), phase.title]));
  const remaining = remainingBudget(plan.budgetAed, plan.budgetItems);
  const facts = {
    plan: {
      name: plan.title,
      idea: plan.idea,
      customers: plan.targetCustomers,
      emirate: labelOf(EMIRATES, plan.emirate),
      sector: labelOf(SECTORS, plan.sector),
      peopleInTeam: plan.teamSize,
      summary: plan.summary,
      licence: {
        recommended: labelOf(JURISDICTIONS, plan.recommendedJurisdiction),
        foundersChoice: labelOf(JURISDICTION_PREFERENCES, plan.jurisdictionPref),
        reason: plan.jurisdictionReason,
      },
      weeksNeeded: estimatedWeeks(plan.phases, plan.tasks),
      steps: plan.tasks.map((task) => ({
        phase: phaseTitles.get(String(task.phaseId)) ?? "",
        title: task.title,
        description: task.description,
        dealWith: task.authority,
        status: labelOf(TASK_STATUSES, task.status),
        cost: costText(task),
        days: task.estDays,
      })),
      budget: {
        foundersBudget: formatAed(plan.budgetAed),
        firstYearEstimate: formatAed(firstYearTotal(plan.budgetItems)),
        againstBudget: remaining >= 0 ? `${formatAed(remaining)} under budget` : `${formatAed(-remaining)} over budget`,
        paidSoFar: formatAed(paidTotal(plan.budgetItems)),
        lines: plan.budgetItems.map((item) => ({
          label: item.label,
          category: labelOf(BUDGET_CATEGORIES, item.category),
          estimate: `${formatAed(item.estimatedAed)} (${basisText(item.costBasis)})`,
          howOften: labelOf(RECURRENCES, item.recurrence),
          paid: item.actualAed == null ? null : formatAed(item.actualAed),
        })),
      },
      documents: plan.documents.map((doc) => ({
        name: doc.name,
        description: doc.description,
        required: doc.required,
        obtained: doc.obtained,
      })),
      risks: plan.risks.map((risk) => ({
        title: risk.title,
        description: risk.description,
        likelihood: risk.likelihood,
        impact: risk.impact,
        whatToDo: risk.mitigation,
      })),
    },
    officialSources: sources.map((source) => ({ title: source.title, publisher: source.publisher, summary: source.summary })),
  };
  return `The plan and the official sources:\n${JSON.stringify(facts)}\n\nThe founder's question:\n${question}`;
}
