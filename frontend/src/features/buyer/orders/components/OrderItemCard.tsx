import type { OrderItemApi } from "../data/api";
import { orderItemImage } from "../data/images";
import { formatPrice } from "../data/orderMeta";

/**
 * One line item of an order. Prices come straight from the server snapshot,
 * so this never recomputes a subtotal.
 */
export default function OrderItemCard({ item }: { item: OrderItemApi }) {
  const image = orderItemImage(item.product_image);

  return (
    <li className="flex items-center gap-3.5 py-3.5">
      <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-[#EAE7E0] bg-[#F6F8F4]">
        <img
          src={image}
          alt={item.product_name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">
          {item.product_name}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted">
          {item.farm_name} · {item.farmer_name}
        </p>

        <p className="mt-1 text-[11px] font-medium text-[#7A8575]">
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>

      <p className="shrink-0 text-sm font-bold text-ink">
        {formatPrice(item.subtotal)}
      </p>
    </li>
  );
}
