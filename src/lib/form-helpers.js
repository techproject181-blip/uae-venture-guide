// Small helpers for the forms and buttons that run in the browser.

/** Sends JSON to one of the app's API routes. Returns the response body plus `ok`. */
export async function sendJson(method, url, data) {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, ...body };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
}

export const postJson = (url, data) => sendJson("POST", url, data);

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
