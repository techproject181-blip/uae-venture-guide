// Budget and progress arithmetic. Pure functions, used on the server and in
// the browser (for live totals while editing). Amounts are whole dirhams.
//
// A budget item has two amounts. The estimate is what it costs each time, so
// the first year counts a monthly estimate 12 times. What was actually paid
// is the amount paid so far, so it is added up as entered.

const TIMES_PER_FIRST_YEAR = { one_time: 1, monthly: 12, yearly: 1 };

/** Cost of one item in the first year: monthly items count 12 times. */
export function firstYearCost(amount, recurrence) {
  return (amount ?? 0) * (TIMES_PER_FIRST_YEAR[recurrence] ?? 1);
}

/** First-year total of the estimates. */
export function firstYearTotal(items) {
  return items.reduce((sum, item) => sum + firstYearCost(item.estimatedAed, item.recurrence), 0);
}

/** What was actually paid so far, as entered. Costs not paid yet count 0. */
export function paidTotal(items) {
  return items.reduce((sum, item) => sum + (item.actualAed ?? 0), 0);
}

/**
 * Per budget category, for the bar charts: { estimated, actual }, counted the
 * same way as firstYearTotal() and paidTotal(), so the charts match the totals.
 */
export function totalsByCategory(items) {
  const totals = {};
  for (const category of new Set(items.map((item) => item.category))) {
    const inCategory = items.filter((item) => item.category === category);
    totals[category] = { estimated: firstYearTotal(inCategory), actual: paidTotal(inCategory) };
  }
  return totals;
}

/** Budget left after the estimated first-year total. Negative means over budget. */
export function remainingBudget(budgetAed, items) {
  return budgetAed - firstYearTotal(items);
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
