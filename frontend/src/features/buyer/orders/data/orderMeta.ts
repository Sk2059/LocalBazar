import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "./api";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-harvest-100 text-harvest-700",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-forest-100 text-forest-700",
  },
  processing: {
    label: "Processing",
    badge: "bg-forest-100 text-forest-700",
  },
  ready: {
    label: "Ready for Delivery",
    badge: "bg-forest-100 text-forest-700",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    badge: "bg-forest-100 text-forest-700",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-forest-200 text-forest-800",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-stone-200 text-stone-700",
  },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  khalti: "Khalti",
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Payment pending",
    badge: "bg-harvest-100 text-harvest-700",
  },
  paid: {
    label: "Paid",
    badge: "bg-forest-100 text-forest-700",
  },
  failed: {
    label: "Payment failed",
    badge: "bg-red-100 text-red-700",
  },
  refunded: {
    label: "Refunded",
    badge: "bg-stone-200 text-stone-700",
  },
};

export function formatPrice(value: number | string) {
  return `Rs. ${Number(value).toLocaleString("en-NP")}`;
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Total number of units across every line item. */
export function countItems(order: { items: { quantity: number }[] }) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}
