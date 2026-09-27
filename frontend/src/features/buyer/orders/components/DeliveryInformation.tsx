import { MapPin, Truck } from "lucide-react";

import type { OrderApi } from "../data/api";

/**
 * Delivery address block for an order, rendered exactly as the server recorded
 * it at checkout.
 */
export default function DeliveryInformation({
  order,
}: {
  order: OrderApi;
}) {
  const region = [
    order.municipality,
    order.district,
    order.province,
  ].filter(Boolean).join(", ");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.06)]">
      <div className="border-b border-[#EAE7E0] px-5 py-4">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-forest-700" />

          <h2 className="font-display text-base font-semibold text-ink">
            Delivery details
          </h2>
        </div>
      </div>

      <div className="flex gap-3 px-5 py-4">
        <MapPin className="mt-0.5 size-4 shrink-0 text-forest-700" />

        <div className="space-y-1 text-sm leading-6 text-[#34452F]">
          <p className="font-semibold text-ink">{order.customer_name}</p>

          <p>{order.delivery_address}</p>

          <p>{region}</p>

          {order.delivery_instructions && (
            <p className="pt-1 text-xs leading-5 text-muted">
              <span className="font-semibold">Notes for the courier: </span>
              {order.delivery_instructions}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
