// Formatting for numbers and dates shown on screen.

const aedFormat = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** 12500 -> "AED 12,500" */
export function formatAed(amount) {
  return `AED ${aedFormat.format(amount ?? 0)}`;
}

/** A cost range: "AED 12,500" when both ends match, otherwise "AED 12,500–15,000". */
export function formatAedRange(min, max) {
  if (min === max) return formatAed(min);
  return `AED ${aedFormat.format(min)}–${aedFormat.format(max)}`;
}

/** A Date or ISO string -> "5 Oct 2026" */
export function formatDate(value) {
  return value ? dateFormat.format(new Date(value)) : "";
}

/** A Date or ISO string -> "2026-10-05", the format date inputs need. */
export function toDateInput(value) {
  return new Date(value).toISOString().slice(0, 10);
}
