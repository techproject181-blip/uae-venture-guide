import { AlertCircle } from "lucide-react";
import { Stamp } from "@/components/stamp";

const ROLES = [
  { value: "entrepreneur", title: "Entrepreneur", text: "Plan and launch your business." },
  { value: "mentor", title: "Mentor", text: "Guide new founders.", needsApproval: true },
  { value: "funder", title: "Funder", text: "Find ideas to support.", needsApproval: true },
];

/**
 * The account role as three plain options, like the choices on a printed form.
 * The real radio inputs are visually hidden but still work with the keyboard:
 * Tab enters the group and the arrow keys choose.
 */
export function RolePicker({ error }) {
  return (
    <fieldset aria-describedby={error ? "role-hint role-error" : "role-hint"}>
      <legend className="text-sm font-medium">I am joining as</legend>
      <div className="mt-2 space-y-2">
        {ROLES.map(({ value, title, text, needsApproval }) => (
          <label
            key={value}
            className="group flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs transition-[border-color,background-color,box-shadow] duration-200 hover:border-slate-300 has-checked:border-primary has-checked:bg-accent has-checked:shadow-[0_0_0_1px_var(--primary)] has-focus:ring-3 has-focus:ring-ring/50"
          >
            {/* The ring shows on any focus: Safari does not count a hidden radio moved with the arrow keys as "focus-visible". */}
            <input type="radio" name="role" value={value} defaultChecked={value === "entrepreneur"} className="sr-only" />
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-slate-400 transition-colors group-has-checked:border-primary"
            >
              <span className="size-2 scale-50 rounded-full bg-primary opacity-0 transition-[opacity,scale] duration-200 group-has-checked:scale-100 group-has-checked:opacity-100" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                {title}
                {needsApproval && <Stamp tone="waiting">Needs approval</Stamp>}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
            </span>
          </label>
        ))}
      </div>
      <p id="role-hint" className="mt-2 text-sm text-muted-foreground">
        An administrator approves mentor and funder accounts before they can be used.
      </p>
      {error && (
        <p id="role-error" className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}
