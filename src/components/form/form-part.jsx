/**
 * One part of a long form, as its own panel: the legend (with an optional
 * note under it) in the panel's header, then the fields. The legend floats so
 * it can be styled as a normal header row; screen readers still read it with
 * every field. `id` names the note for aria-describedby.
 */
export function FormPart({ id, legend, note, children }) {
  return (
    <fieldset aria-describedby={note && id ? `${id}-note` : undefined} className="panel min-w-0 overflow-hidden">
      <legend className="float-left w-full border-b px-5 py-4 sm:px-6">
        <span className="block text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">{legend}</span>
      </legend>
      <div className="clear-left space-y-5 p-5 sm:p-6">
        {note && (
          <p id={id ? `${id}-note` : undefined} className="-mt-1 text-sm text-muted-foreground">
            {note}
          </p>
        )}
        {children}
      </div>
    </fieldset>
  );
}
