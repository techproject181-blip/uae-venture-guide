"use client";

/**
 * Shows its content but stops every link inside it from going anywhere:
 * a click, or Enter on a focused link, is cancelled. Used on the home page
 * while it is a showcase only. Buttons (the role tabs) and the questions
 * still open and close. To switch the links back on, remove the wrapper in
 * src/app/page.js.
 */
export function LinksOff({ children }) {
  function stop(event) {
    if (event.target.closest?.("a[href]")) event.preventDefault();
  }
  return (
    <div onClickCapture={stop} className="contents [&_a]:cursor-default">
      {children}
    </div>
  );
}
