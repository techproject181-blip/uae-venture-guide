import { z } from "zod";

// Small building blocks for the Zod schemas. Form values arrive as text, so
// these turn them into the right types.

/** The first error message for each field, for example { email: "Enter a valid email address." }. */
export function fieldErrors(zodError) {
  const errors = {};
  for (const issue of zodError.issues) {
    const field = issue.path[0];
    if (field !== undefined && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** A checkbox: the browser sends "on" when ticked and nothing when not. */
export const checkbox = () => z.preprocess((value) => value === true || value === "on", z.boolean());

/** A whole number of dirhams, 0 or more. Empty input counts as missing. */
export const aed = (message = "Enter an amount in dirhams.") =>
  z.preprocess(emptyToUndefined, z.coerce.number(message).int("Use whole dirhams.").min(0, "Use 0 or more."));

/** Like aed(), but the field may be left empty. */
export const optionalAed = () =>
  z.preprocess(emptyToUndefined, z.coerce.number().int("Use whole dirhams.").min(0, "Use 0 or more.").optional());

/** A whole number between min and max, with one message for any problem. */
export const wholeNumber = (min, max, message) =>
  z.preprocess(emptyToUndefined, z.coerce.number(message).int(message).min(min, message).max(max, message));

/** Like wholeNumber(), but the field may be left empty. */
export const optionalWholeNumber = (min, max, message) =>
  z.preprocess(emptyToUndefined, z.coerce.number(message).int(message).min(min, message).max(max, message).optional());

/** A list of allowed values from a checkbox group, which sends one value or several. */
export const multiChoice = (values, message) =>
  z.preprocess((value) => (value === undefined ? [] : [].concat(value)), z.array(z.enum(values, message)));

/** Trimmed text; empty text becomes undefined, so optional fields can be left blank. */
export const optionalText = (max) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

/** A web address starting with http:// or https://. */
export const webUrl = (message = "Enter a full web address starting with https://.") =>
  z.string().trim().pipe(z.url({ protocol: /^https?$/, error: message }));

function emptyToUndefined(value) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}
