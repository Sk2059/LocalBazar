import { useQuery } from "@tanstack/react-query";

import { getDeliveryZones } from "../data/api";

/**
 * Public delivery zones. Retried manually by the checkout page's "refresh"
 * affordance via `refetch` when the estimate can't be shown.
 */
export function useDeliveryZones() {
  return useQuery({
    queryKey: ["delivery-zones"],
    queryFn: getDeliveryZones,
  });
}
