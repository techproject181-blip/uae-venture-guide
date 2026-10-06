import { Stamp } from "@/components/stamp";

// Every status in the app, shown as a stamp in the tone of the shared legend.
const TONE = {
  active: "done",
  approved: "done",
  accepted: "done",
  completed: "done",
  done: "done",
  published: "done",
  ready: "done",
  pending: "waiting",
  in_progress: "waiting",
  generating: "waiting",
  suspended: "stopped",
  declined: "stopped",
  failed: "stopped",
  hidden: "stopped",
  todo: "quiet",
  info: "quiet",
};

const LABELS = {
  in_progress: "In progress",
  todo: "To do",
};

export function StatusBadge({ status, label, className }) {
  const text = label ?? LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Stamp tone={TONE[status] ?? "quiet"} className={className}>
      {text}
    </Stamp>
  );
}
