/**
 * One part of a long form: a fieldset with its legend, set off by a thin rule
 * (except when it comes first), and an optional note read out with it.
 */
export function FormPart({ id, legend, note, children }) {
  return (
    <div className="border-t pt-6 first:border-t-0 first:pt-0">
      <fieldset aria-describedby={note ? `${id}-note` : undefined}>
        <legend className="text-lg font-bold">{legend}</legend>
        {note && (
          <p id={`${id}-note`} className="mt-1 text-sm text-muted-foreground">
            {note}
          </p>
        )}
        <div className="mt-5 space-y-5">{children}</div>
      </fieldset>
    </div>
  );
}
