import { useMutation, useQuery } from "@tanstack/react-query";

// The one place the browser talks to the app's API routes. Every form, button
// and live view goes through apiRequest and the React Query hooks below, so
// errors, retries and caching work the same way everywhere.

const OFFLINE_ERROR = "Could not reach the server. Check your connection and try again.";

/**
 * Sends JSON to one of the app's API routes. Never throws: returns the
 * response body plus `ok` and `status`, or `{ ok: false, error }` when the
 * server could not be reached.
 */
export async function apiRequest(method, url, data, { signal } = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
      cache: method === "GET" ? "no-store" : undefined,
      signal,
    });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, ...body };
  } catch (error) {
    if (signal?.aborted) throw error; // React Query cancelled it on purpose
    return { ok: false, error: OFFLINE_ERROR };
  }
}

/**
 * POSTs JSON and hands back the raw Response, for answers that stream in
 * (the plan chat). Throws when the server cannot be reached.
 */
export function apiStream(url, data) {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}

/** An API answer that was not ok, thrown so React Query sees a failed query. */
export class ApiRequestError extends Error {
  constructor(result) {
    super(result.error ?? "Something went wrong. Please try again.");
    this.status = result.status;
    this.result = result;
  }
}

/** GET for queries: returns the body, or throws ApiRequestError. */
export async function apiGet(url, { signal } = {}) {
  const result = await apiRequest("GET", url, undefined, { signal });
  if (!result.ok) throw new ApiRequestError(result);
  return result;
}

/** Query keys in one place, so a mutation can refresh exactly the data it changed. */
export const queryKeys = {
  conversation: (apiUrl) => ["conversation", apiUrl],
  chat: (planId) => ["chat", planId],
};

/** Try a failed query again up to twice, but never for a 4xx: asking again gives the same answer. */
export function shouldRetry(failureCount, error) {
  if (error?.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

/** Defaults for the app's single QueryClient. */
export const queryDefaults = {
  queries: { staleTime: 30 * 1000, retry: shouldRetry, refetchOnWindowFocus: false },
  mutations: { retry: false },
};

/** useQuery that GETs `url` (unless `queryFn` is given). */
export function useApiQuery(queryKey, url, options = {}) {
  return useQuery({ queryKey, queryFn: ({ signal }) => apiGet(url, { signal }), ...options });
}

/**
 * useMutation for the app's API routes. `mutationFn(variables)` usually
 * returns apiRequest(...); its `{ ok, error }` result is handed back as is,
 * so callers check `result.ok` just as before. `isPending` drives the
 * disabled and "Working…" states.
 */
export function useApiMutation(mutationFn, options = {}) {
  return useMutation({ mutationFn, retry: false, ...options });
}
