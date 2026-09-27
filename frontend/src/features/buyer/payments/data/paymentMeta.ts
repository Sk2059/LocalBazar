import type {
  PaymentProvider,
  PaymentRecordStatus,
} from "./api";

/**
 * Presentation metadata for the payment *record* (the `Payment` model), as
 * opposed to an order's `payment_status`. Kept separate from
 * `orders/data/orderMeta.ts` for that reason.
 */
export const PAYMENT_STATUS_META: Record<
  PaymentRecordStatus,
  { label: string; badge: string }
> = {
  initiated: {
    label: "Payment initiated",
    badge: "bg-stone-100 text-stone-700",
  },
  pending: {
    label: "Awaiting payment",
    badge: "bg-harvest-100 text-harvest-800",
  },
  completed: {
    label: "Payment completed",
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

export const PAYMENT_PROVIDER_LABEL: Record<PaymentProvider, string> = {
  khalti: "Khalti",
  cod: "Cash on Delivery",
};

export function formatPrice(value: number | string) {
  return `Rs. ${Number(value).toLocaleString("en-NP")}`;
}

export function formatPaymentDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
