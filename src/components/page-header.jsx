import { cn } from "@/lib/utils";

// PageHeader lives in the layout kit; it is exported here too so older imports keep working.
export { PageHeader } from "@/components/layout";

/** What a list shows when it has nothing in it yet. `as` sets the heading level, h2 unless it sits under one. */
export function EmptyState({ title, text, action, as: Heading = "h2", className }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-ink-300 bg-card/70 px-6 py-12 text-center sm:py-16", className)}>
      <svg viewBox="0 0 48 24" aria-hidden="true" className="mx-auto mb-4 h-6 w-12 text-ink-300">
        <path d="M4 18c8 0 8-12 20-12s12 12 20 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 5" />
        <circle cx="4" cy="18" r="3.5" fill="var(--primary)" />
        <circle cx="44" cy="18" r="3.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <Heading className="text-lg font-semibold">{title}</Heading>
      {text && <p className="mx-auto mt-1 max-w-md text-muted-foreground">{text}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
