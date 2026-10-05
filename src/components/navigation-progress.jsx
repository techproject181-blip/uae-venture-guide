"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * A thin emerald bar along the top of the window while the next page loads,
 * so a click always shows that something is happening. It starts when a link
 * to another page of the app is clicked and ends when the address changes.
 * (Next.js loading.js screens would do this too, but they make a blocked page
 * answer 200 instead of 404.)
 */
export function NavigationProgress() {
  const pathname = usePathname();
  // The page the click was made on; the bar shows while we are still on it.
  const [startedOn, setStartedOn] = useState(null);
  const loading = startedOn !== null && startedOn === pathname;

  useEffect(() => {
    let timer;
    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || url.pathname.startsWith("/api/")) return;
      setStartedOn(window.location.pathname);
      // If the page never changes (an error, or the same page), stop after a while.
      clearTimeout(timer);
      timer = setTimeout(() => setStartedOn(null), 10000);
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  }, []);

  return <div aria-hidden="true" className={cn("nav-progress", loading && "nav-progress-active")} />;
}
