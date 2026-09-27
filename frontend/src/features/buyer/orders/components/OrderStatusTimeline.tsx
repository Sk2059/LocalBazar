import {
  Check,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import type { OrderStatus } from "../data/api";

/**
 * Vertical status timeline for an order.
 *
 * The steps mirror the server's `Order.Status` flow (minus the terminal
 * `cancelled` branch, which is rendered specially). The current step is
 * derived from the order status only — the client never guesses progress.
 */

const FLOW: {
  key: OrderStatus;
  label: string;
  description: string;
}[] = [
  {
    key: "pending",
    label: "Order placed",
    description: "We received your order",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "The farmer confirmed availability",
  },
  {
    key: "processing",
    label: "Preparing your order",
    description: "Your produce is being packed",
  },
  {
    key: "ready",
    label: "Ready for delivery",
    description: "Waiting for the courier",
  },
  {
    key: "out_for_delivery",
    label: "Out for delivery",
    description: "On its way to you",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Enjoy your farm-fresh produce",
  },
];

export default function OrderStatusTimeline({
  status,
}: {
  status: OrderStatus;
}) {
  // Cancelled orders never entered (or left) the happy path.
  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-200/70 bg-red-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
            <XCircle className="size-5" />
          </div>

          <div>
            <p className="font-display text-base font-semibold text-ink">
              Order cancelled
            </p>

            <p className="mt-1 text-sm leading-6 text-muted">
              This order was cancelled and won't be delivered. If you were
              charged, the refund is on its way.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.findIndex((step) => step.key === status);

  return (
    <ol className="space-y-0">
      {FLOW.map((step, index) => {
        const completed = index < currentIndex;
        const current = index === currentIndex;
        const upcoming = index > currentIndex;

        return (
          <li
            key={step.key}
            className="relative flex gap-3.5 pb-6 last:pb-0"
          >
            {index < FLOW.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-3.75 top-9 h-[calc(100%-2.25rem)] w-0.5 ${
                  completed ? "bg-forest-400" : "bg-stone-200"
                }`}
              />
            )}

            <span
              className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border transition ${
                completed
                  ? "border-forest-600 bg-forest-600 text-white"
                  : current
                    ? "border-forest-600 bg-white text-forest-700 shadow-[0_0_0_4px_rgba(45,90,39,0.10)]"
                    : "border-stone-200 bg-white text-stone-400"
              }`}
            >
              {completed ? (
                <Check className="size-4" strokeWidth={3} />
              ) : step.key === "delivered" ? (
                <PackageCheck className="size-4" />
              ) : step.key === "out_for_delivery" ? (
                <Truck className="size-4" />
              ) : (
                <ShoppingBag className="size-4" />
              )}
            </span>

            <div className="pt-1">
              <p
                className={`text-sm font-bold ${
                  upcoming ? "text-stone-400" : "text-ink"
                }`}
              >
                {step.label}
              </p>

              <p
                className={`mt-0.5 text-xs leading-5 ${
                  upcoming ? "text-stone-400" : "text-muted"
                }`}
              >
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
