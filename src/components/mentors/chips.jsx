import { cn } from "@/lib/utils";

/**
 * Short labels in small grey pills, such as a mentor's areas of expertise.
 * `max` shows the first few and a "+2 more" pill for the rest.
 */
export function Chips({ items, max, label, className }) {
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((item) => (
        <li key={item} className="rounded-md bg-secondary px-2 py-1 text-xs leading-none font-medium text-secondary-foreground">
          {item}
        </li>
      ))}
      {rest > 0 && (
        <li className="rounded-md border border-dashed px-2 py-1 text-xs leading-none font-medium text-muted-foreground">+{rest} more</li>
      )}
    </ul>
  );
}
