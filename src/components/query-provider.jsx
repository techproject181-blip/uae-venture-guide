"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryDefaults } from "@/lib/query";

/** One React Query client per browser session, made once and kept across renders. */
export function QueryProvider({ children }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: queryDefaults }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
