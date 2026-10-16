// Small helpers for the forms that run in the browser. Requests go through @/lib/query.

/** Reads a form into an object. A name used several times (a checkbox group) becomes a list. */
export function formValues(form) {
  const values = {};
  for (const [name, value] of new FormData(form)) {
    values[name] = name in values ? [].concat(values[name], value) : value;
  }
  return values;
}

/** Moves the keyboard focus to the first field that has an error. */
export function focusFirstError(form, errors) {
  const [first] = Object.keys(errors);
  if (first) form.querySelector(`[name="${first}"]`)?.focus();
}
