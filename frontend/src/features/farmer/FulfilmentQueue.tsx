import { Check, PackageCheck } from "lucide-react";

import type { FarmerOrderApi } from "./data/api";

/**
 * The packing queue. Only line items that belong to the requesting farmer's
 * farm are returned by the server, so nothing here filters by ownership —
 * `pending_items` is the annotated count of rows still awaiting packing.
 */
export default function FulfilmentQueue({
  orders,
  loading,
  pendingCount,
  fulfilPending,
  onFulfil,
}: {
  orders?: FarmerOrderApi[];
  loading: boolean;
  pendingCount: number;
  fulfilPending: boolean;
  onFulfil: (itemId: number, productName: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
            Fulfilment queue
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-ink">Orders to pack</h2>
          <p className="mt-1 text-xs text-muted">
            Only the line items buyers ordered from your farm appear here.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider sm:self-auto ${
            pendingCount > 0
              ? "bg-amber-50 text-amber-700"
              : "bg-forest-50 text-forest-700"
          }`}
        >
          {pendingCount > 0
            ? `${pendingCount} item${pendingCount === 1 ? "" : "s"} to pack`
            : "Everything packed"}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-stone-100"
            />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
          <PackageCheck size={26} className="mx-auto text-stone-400" />
          <p className="mt-3 text-sm font-bold text-ink">No orders yet</p>
          <p className="mt-1 text-xs text-muted">
            Once a buyer checks out with your produce, it shows up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              fulfilPending={fulfilPending}
              onFulfil={onFulfil}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderCard({
  order,
  fulfilPending,
  onFulfil,
}: {
  order: FarmerOrderApi;
  fulfilPending: boolean;
  onFulfil: (itemId: number, productName: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-cream/60 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-ink">Order #{order.id}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {order.customer_name} ·{" "}
            {new Date(order.created_at).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider sm:self-auto ${
            order.pending_items > 0
              ? "bg-amber-50 text-amber-700"
              : "bg-forest-50 text-forest-700"
          }`}
        >
          {order.pending_items > 0
            ? `${order.pending_items} to pack`
            : "Packed"}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-stone-200">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">
                {item.product_name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {item.quantity} {item.unit} × Rs. {item.price} · Rs.{" "}
                {item.subtotal}
              </p>
            </div>

            {item.farmer_fulfilled ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-forest-50 px-3 py-1.5 text-[10px] font-extrabold text-forest-700">
                <Check size={12} />
                Packed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onFulfil(item.id, item.product_name)}
                disabled={fulfilPending}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-forest-700 px-3.5 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-forest-800 disabled:opacity-60"
              >
                <PackageCheck size={12} />
                Mark packed
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-muted">
        Deliver to {order.delivery_address}
        {order.municipality ? `, ${order.municipality}` : ""}
        {order.district ? `, ${order.district}` : ""}
      </p>
    </div>
  );
}
