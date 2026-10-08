// Submission build: the app stops at the dashboard.
//
// While this is true, signed-in users see their dashboard and nothing else.
// Every link and button beyond it is still drawn, but greyed out and dead, and
// any other address sends them back to the dashboard. Nothing has been
// deleted, so setting this to false brings the whole app back as it was.
export const DASHBOARD_ONLY = true;

/**
 * A switched-off control that handles its own clicks: faded, with the "no
 * entry" cursor on hover. Clicks are stopped in the component.
 */
export const DISABLED_CLASS = "opacity-45 select-none cursor-not-allowed";

/**
 * A switched-off control that cannot stop its own clicks, such as one drawn on
 * the server: the inner part ignores the mouse, and the wrapper around it
 * carries the cursor.
 */
export const DISABLED_INNER = "pointer-events-none opacity-45 select-none";
export const DISABLED_WRAP = "cursor-not-allowed";

/** Shown on hover, so it is clear the screen is off rather than broken. */
export const DISABLED_TITLE = "Not available in this build.";

// The only addresses a signed-in user may open while the flag is on. Signing
// out stays reachable, otherwise they could not leave.
export const ALLOWED_PATHS = ["/dashboard", "/api/auth/sign-out", "/pending"];

/** True when this address is still open while the app stops at the dashboard. */
export function isAllowedPath(pathname) {
  return ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
