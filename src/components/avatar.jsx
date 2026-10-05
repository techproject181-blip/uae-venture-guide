import { cn } from "@/lib/utils";

/** A person's initials in a plain ring, since profiles have no photos. */
export function Avatar({ name, className }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground ring-1 ring-primary/20",
        className,
      )}
    >
      {initials}
    </span>
  );
}
