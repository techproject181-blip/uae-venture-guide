"use client";

import "./globals.css";

/** The last safety net: shown when even the main layout fails. It has to draw its own <html> and <body>. */
export default function GlobalError({ retry }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-background p-6 text-center font-sans text-foreground">
        <h1 className="text-[1.875rem] leading-[1.15] font-semibold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted-foreground">The website could not load. Please try again in a moment.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-8 h-11 rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
