import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { queryClient } from "../../../../api/queryClient";
import {
  checkout,
  getOrder,
  getOrders,
  type CheckoutPayload,
  type OrderApi,
} from "../data/api";

/**
 * Orders feature query hooks.
 *
 * Cache keys: `["orders"]` (list) and `["orders", orderId]` (detail). The list
 * is invalidated after a successful checkout, and detail views are invalidated
 * after any payment settles, so stale "unpaid" states can never linger.
 */

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
}

export function useOrder(orderId: number | undefined) {
  return useQuery({
    queryKey: ["orders", orderId],
    enabled: orderId !== undefined,
    queryFn: () => getOrder(orderId as number),
  });
}

/**
 * Converts the cart into an order on the server. The response is the
 * authoritative record — prices, stock, the delivery fee and the minimum-order
 * check are all enforced there.
 */
export function useCheckout() {
  return useMutation<OrderApi, Error, CheckoutPayload>({
    mutationFn: (payload) => checkout(payload),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["orders", order.id],
      });
      // Stock changed for everything in the cart.
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}
