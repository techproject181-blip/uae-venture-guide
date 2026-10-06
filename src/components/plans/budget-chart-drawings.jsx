"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAed } from "@/lib/format";

// The Recharts drawings for budget-charts.jsx, which loads this file after the
// page is shown. They are hidden from screen readers (a table gives the same
// numbers), so Recharts' own keyboard layer is switched off. Bars grow in
// quickly when the chart appears.
// Estimates in light emerald, what was actually paid in the app's emerald.
// They differ in lightness, which every kind of colour vision can tell apart
// (checked with the dataviz palette validator), and the legend and labels name them too.
const ESTIMATED = "var(--chart-estimated)";
const ACTUAL = "var(--chart-actual)";
const INK = "var(--chart-text)"; // labels use the text colour, never the bar colour
const RULE = "var(--chart-grid)";

const axisProps = { tickLine: false, axisLine: false, tick: { fill: INK, fontSize: 13 } };
const tooltipProps = {
  formatter: (value) => formatAed(value),
  cursor: { fill: "var(--chart-cursor)" },
  contentStyle: { borderRadius: 10, border: `1px solid ${RULE}`, fontSize: 13, boxShadow: "var(--elevation-float)" },
};

// Legend words in the text colour; the square beside them shows the series.
const legendText = (value) => <span style={{ color: INK }}>{value}</span>;

const shortAed = (value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value));

/** Round axis steps (0, 10k, 20k, 30k), about three of them, up to at least `max`. */
function roundTicks(max) {
  const rough = Math.max(max, 1) / 3;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= rough);
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

/** One bar per category, longest first, with the amount at the end of each bar. */
export function CategoryChart({ rows, height }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={{ left: 8, right: 100 }} barCategoryGap={8}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={96} {...axisProps} />
        <Tooltip {...tooltipProps} />
        <Bar dataKey="estimated" name="Estimated" fill={ESTIMATED} radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={600}>
          <LabelList dataKey="estimated" content={ValueLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Estimated and actual bars side by side for each category. */
export function ActualChart({ rows, height }) {
  const ticks = roundTicks(Math.max(...rows.flatMap((row) => [row.estimated, row.actual])));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={{ left: 8, right: 24 }} barGap={2} barCategoryGap={12}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" domain={[0, ticks.at(-1)]} ticks={ticks} tickFormatter={shortAed} {...axisProps} />
        <YAxis type="category" dataKey="label" width={96} {...axisProps} />
        <Tooltip {...tooltipProps} />
        <Legend
          verticalAlign="top"
          align="left"
          iconType="square"
          itemSorter={null}
          formatter={legendText}
          wrapperStyle={{ fontSize: 13, paddingBottom: 8 }}
        />
        <Bar dataKey="estimated" name="Estimated" fill={ESTIMATED} radius={[0, 4, 4, 0]} maxBarSize={16} animationDuration={600} />
        <Bar dataKey="actual" name="Actual" fill={ACTUAL} radius={[0, 4, 4, 0]} maxBarSize={16} animationDuration={600} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** The amount at the end of a bar, on one line (Recharts' own label wraps at spaces). */
function ValueLabel({ x, y, width, height, value }) {
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dominantBaseline="middle"
      fill={INK}
      fontSize={12}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {formatAed(value)}
    </text>
  );
}
