import {
  AlertCircle,
  ArrowRight,
  PackageOpen,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useFarmerBuyerOrders } from "./data/hooks";
import type { OrderApi } from "../buyer/orders/data/api";
import {
  countItems,
  formatOrderDate,
  formatPrice,
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_META,
} from "../buyer/orders/data/orderMeta";

/**
 * Orders placed BY the farmer (as a customer). A farmer account is allowed to
 * buy produce too, so this tab sits alongside the fulfilment queue in the
 * dashboard. Re-uses the same display metadata as the regular buyer UI.
 */
export default function MyOrdersTab() {
  const {
    data: orders,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFarmerBuyerOrders();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-stone-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
        <AlertCircle className="mx-auto size-6 text-red-500" />
        <p className="mt-3 text-sm font-bold text-ink">
          Couldn't load your orders
        </p>
        <p className="mt-1 text-xs text-muted">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-[11px] font-extrabold text-white transition hover:bg-red-800 disabled:opacity-60"
        >
          {isFetching ? "Loading…" : "Try again"}
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-12 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full border border-forest-200 bg-forest-50 text-forest-700">
          <PackageOpen size={24} />
        </div>
        <p className="text-sm font-bold text-ink">No orders yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
          When you place an order as a buyer, it appears here with live delivery
          status and payment details.
        </p>
        <Link
          to="/marketplace"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800"
        >
          Browse marketplace
          <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-[11px] text-muted">
        {orders.length} {orders.length === 1 ? "order" : "orders"} placed by you
        as a buyer
      </p>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderApi }) {
  const status = ORDER_STATUS_META[order.status];
  const payment = PAYMENT_STATUS_META[order.payment_status];
  const itemCount = countItems(order);
  const firstItem = order.items[0]?.product_name ?? "Items";
  const extraItems = order.items.length - 1;

  return (
    <Link
      to={`/orders/${order.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
          <ShoppingBag size={18} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-semibold text-ink">
              Order #{order.id}
            </span>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${status.badge}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-muted">
            {formatOrderDate(order.created_at)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"} ·{" "}
            {PAYMENT_METHOD_LABEL[order.payment_method]}
          </p>

          <p className="mt-1 truncate text-[11px] text-stone-500">
            {firstItem}
            {extraItems > 0 && ` + ${extraItems} more`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${payment.badge}`}
          >
            {payment.label}
          </span>

          <p className="font-display text-base font-bold text-forest-700">
            {formatPrice(order.total)}
          </p>
        </div>

        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-forest-700 transition group-hover:bg-forest-700 group-hover:text-white">
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
