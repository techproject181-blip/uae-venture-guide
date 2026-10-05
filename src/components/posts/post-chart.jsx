"use client";

import dynamic from "next/dynamic";

// Recharts is a large library, so the drawing loads after the post is shown,
// in the space kept free for it (see plans/budget-charts.jsx).
const PostChartDrawing = dynamic(() => import("@/components/posts/post-chart-drawing"), {
  ssr: false,
  // A grey shimmering box in the chart's place while its drawing code loads.
  loading: () => <div aria-hidden="true" className="skeleton" style={{ height: HEIGHT }} />,
});

const HEIGHT = 280;

/** The small chart a mentor can add to a post: bar, line or pie, from up to six labels and values. */
export function PostChart({ chart }) {
  const data = chart.labels.map((label, i) => ({ label, value: chart.values[i] }));

  return (
    <figure className="my-6 panel p-4 sm:p-5">
      {chart.title && <figcaption className="font-bold">{chart.title}</figcaption>}
      <div className="mt-4" style={{ minHeight: HEIGHT }} aria-hidden="true">
        <PostChartDrawing type={chart.type} title={chart.title} data={data} height={HEIGHT} />
      </div>
      {/* The same numbers as a table, for screen readers. The wrapper is hidden, not
          the table: a table never shrinks below its content and would widen the page. */}
      <div className="sr-only">
        <table>
          <tbody>
            {data.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
