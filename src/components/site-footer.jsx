/** The footer on every page. The look borrows from UAE government documents, so it says plainly that this is not one. */
export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="page-width flex flex-col gap-1 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© 2026 UAE Venture Guide. Not a government service.</p>
        <p>Guidance only, not legal or financial advice.</p>
      </div>
    </footer>
  );
}
