"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { queryKeys, useApiQuery } from "@/lib/query";

// The links whose number counts new messages (see lib/inbox.js navCounts).
const COUNTED = ["/requests", "/interests"];

// How often to ask while the tab is in view. The layout drew the first numbers,
// but it is not drawn again on each page change, so the links ask for themselves.
const CHECK_EVERY_MS = 15 * 1000;

/**
 * `links` with up-to-date numbers: asked for every 15 seconds, when the tab
 * comes back into view and after each page change. A conversation page marks
 * itself read and asks for them again at once (see conversation.jsx).
 */
export function useNavCounts(links) {
  const pathname = usePathname();
  const enabled = links.some((link) => COUNTED.includes(link.href));
  const { data, refetch } = useApiQuery(queryKeys.navCounts(), "/api/notifications", {
    enabled,
    staleTime: 0,
    refetchInterval: CHECK_EVERY_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
  });

  useEffect(() => {
    if (enabled) refetch();
  }, [pathname, enabled, refetch]);

  if (!data?.counts) return links;
  return links.map((link) => (COUNTED.includes(link.href) ? { ...link, count: data.counts[link.href] ?? 0 } : link));
}
