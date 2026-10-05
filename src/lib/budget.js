// Budget and progress arithmetic. Pure functions, used on the server and in
// the browser (for live totals while editing). Amounts are whole dirhams.

const TIMES_PER_FIRST_YEAR = { one_time: 1, monthly: 12, yearly: 1 };

/** Cost of one item in the first year: monthly items count 12 times. */
export function firstYearCost(amount, recurrence) {
  return (amount ?? 0) * (TIMES_PER_FIRST_YEAR[recurrence] ?? 1);
}

/** First-year total of budget items. field is "estimatedAed" or "actualAed"; items without that amount are skipped. */
export function firstYearTotal(items, field = "estimatedAed") {
  return items.reduce((sum, item) => (item[field] == null ? sum : sum + firstYearCost(item[field], item.recurrence)), 0);
}

/** First-year totals per budget category, for the donut chart. */
export function totalsByCategory(items, field = "estimatedAed") {
  const totals = {};
  for (const item of items) {
    if (item[field] == null) continue;
    totals[item.category] = (totals[item.category] ?? 0) + firstYearCost(item[field], item.recurrence);
  }
  return totals;
}

/** Budget left after the estimated first-year total. Negative means over budget. */
export function remainingBudget(budgetAed, items) {
  return budgetAed - firstYearTotal(items, "estimatedAed");
}

/** Share of tasks done, as a whole percent. A plan with no tasks is at 0%. */
export function progressPercent(tasks) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

/**
 * Rough time to finish the roadmap, in weeks. Phases happen one after another,
 * and the steps inside a phase overlap, so each phase takes as long as its
 * longest step.
 */
export function estimatedWeeks(phases, tasks) {
  const days = phases.reduce((sum, phase) => {
    const longest = Math.max(0, ...tasks.filter((task) => String(task.phaseId) === String(phase._id)).map((task) => task.estDays));
    return sum + longest;
  }, 0);
  return Math.max(1, Math.round(days / 7));
}
