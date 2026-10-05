"use client";

/**
 * Turns every link inside it into plain text for now: links still show, but
 * clicks and Enter do nothing. Remove the wrapper in src/app/page.js to turn
 * them back on.
 */
export function LinksOff({ children }) {
  return (
    <div
      className="contents [&_a]:pointer-events-none [&_a]:cursor-default"
      onClickCapture={(event) => {
        if (event.target.closest("a")) event.preventDefault();
      }}
    >
      {children}
    </div>
  );
}
