import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client.
 *
 * `retry: 1` keeps a single retry for genuinely flaky networks without
 * hammering the API on hard failures (401/403/404 are not retried by
 * React Query anyway when {@link shouldRetryError} returns false).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
