"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// The Recharts drawing for post-chart.jsx, which loads this file after the page
// is shown. One series is drawn in the document's dark grey ink. Pie slices take the validated categorical order
// from the dataviz reference palette, never cycled. The drawing is hidden from
// screen readers (a table gives the same numbers), so Recharts' own keyboard
// layer is switched off.
const SERIES = "#047857"; // the app's emerald
const SLICES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
const INK = "#475569"; // the app's muted text colour
const RULE = "#e2e8f0"; // the app's thin rules
const axisProps = { tickLine: false, axisLine: false, tick: { fill: INK, fontSize: 13 } };

/** A bar, line or pie chart of `data` ([{ label, value }]). */
export default function PostChartDrawing({ type, title, data, height }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "pie" ? (
        <PieChart accessibilityLayer={false}>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={2} rootTabIndex={-1} animationDuration={600}>
            {data.map((row, i) => (
              <Cell key={row.label} fill={SLICES[i]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend itemSorter={null} formatter={(value) => <span style={{ color: INK }}>{value}</span>} />
        </PieChart>
      ) : type === "line" ? (
        <LineChart accessibilityLayer={false} data={data} margin={{ top: 8, right: 16, left: 0 }}>
          <CartesianGrid vertical={false} stroke={RULE} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis width={48} {...axisProps} />
          <Tooltip />
          <Line dataKey="value" name={title || "Value"} stroke={SERIES} strokeWidth={2} dot={{ r: 4 }} animationDuration={600} />
        </LineChart>
      ) : (
        <BarChart accessibilityLayer={false} data={data} margin={{ top: 8, right: 16, left: 0 }}>
          <CartesianGrid vertical={false} stroke={RULE} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis width={48} {...axisProps} />
          <Tooltip cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey="value" name={title || "Value"} fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={48} animationDuration={600} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
