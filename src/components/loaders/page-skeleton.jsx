/**
 * The grey outline of a page while its data loads: a title, then either cards
 * (`list`), a table (`table`) or numbers and panels (`dashboard`). It waits a
 * moment before showing (.appear-late), so fast pages never flash it.
 */
export function PageSkeleton({ variant = "list" }) {
  return (
    <div role="status" aria-label="Loading" className="appear-late">
      <div className="mb-8 space-y-3 lg:mb-10">
        <div className="skeleton h-9 w-56 max-w-full" />
        <div className="skeleton h-4 w-96 max-w-full" />
      </div>

      {variant === "dashboard" && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:mb-8 lg:grid-cols-4 lg:gap-6">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="panel space-y-3 p-5 sm:p-6">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-8 w-16" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="panel h-72" />
            <div className="panel h-72" />
          </div>
        </>
      )}

      {variant === "list" && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <li key={n} className="panel space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="skeleton size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
            </li>
          ))}
        </ul>
      )}

      {variant === "table" && (
        <div className="panel overflow-hidden">
          <div className="border-b bg-secondary/70 px-6 py-3">
            <div className="skeleton h-3 w-32" />
          </div>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-4 border-b px-6 py-4 last:border-b-0">
              <div className="skeleton size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
              <div className="skeleton hidden h-6 w-20 sm:block" />
            </div>
          ))}
        </div>
      )}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
