import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fulfilOrderItem,
  getFarmerOrders,
  getFarmerProfile,
  submitVerification,
  type FarmerProfileApi,
} from "./api";

/**
 * Farmer feature query hooks.
 *
 * Two cache keys: `["farmer-profile"]` (the verification state, which the
 * header and dashboard both read) and `["farmer-orders"]` (the fulfilment
 * queue). Packing an item mutates a row inside the queue, so the whole list is
 * invalidated rather than patched in place — the server is the source of truth
 * for `pending_items`.
 */

export function useFarmerProfile() {
  return useQuery({
    queryKey: ["farmer-profile"],
    queryFn: getFarmerProfile,
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation<FarmerProfileApi, Error, FormData>({
    mutationFn: (payload) => submitVerification(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(["farmer-profile"], profile);
    },
  });
}

export function useFarmerOrders() {
  return useQuery({
    queryKey: ["farmer-orders"],
    queryFn: getFarmerOrders,
  });
}

export function useFulfilOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => fulfilOrderItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["farmer-orders"],
      });
    },
  });
}
