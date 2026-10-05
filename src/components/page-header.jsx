/** The title at the top of a page, with optional buttons on the right, closed by a thin rule. */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** What a list shows when it has nothing in it yet. `as` sets the heading level, h2 unless it sits under one. */
export function EmptyState({ title, text, action, as: Heading = "h2" }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-card/60 px-6 py-10 text-center">
      <Heading className="text-lg font-bold">{title}</Heading>
      {text && <p className="mx-auto mt-1 max-w-md text-muted-foreground">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
