// The palette from src/app/globals.css, for code that cannot read CSS
// variables: the PDF report (drawn on the server by @react-pdf/renderer).
// Everything that runs in the browser uses the CSS tokens instead.
// theme-colors.test.js (next to this file) checks every value here against globals.css,
// so change a colour there first, then here.

export const palette = {
  "ink-0": "#ffffff",
  "ink-100": "#f1f5f9",
  "ink-200": "#e2e8f0",
  "ink-400": "#94a3b8",
  "ink-600": "#475569",
  "ink-900": "#0f172a",
  "brand-700": "#047857",
  "gold-700": "#b45309",
  "danger-700": "#b91c1c",
  "chart-estimated": "#45c093",
};

/** The same colours under the names the PDF report uses for them. */
export const reportColors = {
  ink: palette["ink-900"],
  muted: palette["ink-600"],
  rule: palette["ink-200"],
  strongRule: palette["ink-400"],
  fill: palette["ink-100"],
  seal: palette["gold-700"],
  done: palette["brand-700"],
  danger: palette["danger-700"],
  estimate: palette["chart-estimated"],
};
