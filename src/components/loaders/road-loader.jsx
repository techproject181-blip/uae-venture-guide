import { cn } from "@/lib/utils";

// Four stops along a winding road, like the steps of a plan.
const STOPS = [
  [12, 34],
  [56, 14],
  [104, 34],
  [148, 14],
];

/**
 * The loader for long waits, such as building a roadmap: a road is drawn through four stops and
 * each stop turns emerald as the line reaches it (the timings are in globals.css). `label` is read out to screen
 * readers and shown under the drawing.
 */
export function RoadLoader({ label = "Loading…", className }) {
  return (
    <div role="status" className={cn("appear-late flex flex-col items-center gap-3 text-sm text-muted-foreground", className)}>
      <svg viewBox="0 0 160 48" aria-hidden="true" className="h-12 w-40 overflow-visible">
        <path
          d="M12 34 C 34 34, 34 14, 56 14 S 82 34, 104 34 S 126 14, 148 14"
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />
        <path
          className="road-line"
          pathLength="1"
          d="M12 34 C 34 34, 34 14, 56 14 S 82 34, 104 34 S 126 14, 148 14"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {STOPS.map(([cx, cy]) => (
          <circle key={cx} className="road-stop" cx={cx} cy={cy} r="5.5" fill="var(--card)" stroke="var(--border)" strokeWidth="2.5" />
        ))}
      </svg>
      <span>{label}</span>
    </div>
  );
}
