import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../data/api";

/**
 * The signed-in user's own profile. Powers checkout prefill and the account
 * menu; fails closed (query error) when there's no valid token.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: Boolean(localStorage.getItem("access_token")),
  });
}
