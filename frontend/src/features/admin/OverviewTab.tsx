import {
  ArrowRight,
  BadgeCheck,
  IndianRupee,
  PackageCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

import { useAdminStats } from "./data/hooks";
import StatCard from "./StatCard";

/**
 * The landing view: headline numbers, the verification queue size, and the most
 * recent orders. Every figure comes straight from `admin-stats`, which the
 * approve/reject and order-status mutations invalidate, so nothing here goes
 * stale after an action elsewhere in the console.
 */
export default function OverviewTab({
  onGotoFarmers,
}: {
  onGotoFarmers: () => void;
}) {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-stone-100" />
        ))}
      </div>
    );
  }

  const { orders, users, products, verification, recent_orders } = stats;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={`Rs. ${Number(orders.revenue).toLocaleString()}`}
          hint={`${orders.total} orders · Rs. ${Number(orders.pending_value).toLocaleString()} pending`}
          icon={<IndianRupee size={17} />}
          tone="bg-forest-700"
        />

        <StatCard
          label="Orders"
          value={orders.total.toLocaleString()}
          hint={`${orders.pending} awaiting confirmation`}
          icon={<ShoppingCart size={17} />}
          tone="bg-harvest-500"
        />

        <StatCard
          label="Accounts"
          value={users.total.toLocaleString()}
          hint={`${users.farmers} farmers · ${users.buyers} buyers`}
          icon={<Users size={17} />}
          tone="bg-forest-600"
        />

        <StatCard
          label="Live products"
          value={products.active.toLocaleString()}
          hint={`${products.total} listed · ${products.out_of_stock} out of stock`}
          icon={<PackageCheck size={17} />}
          tone="bg-stone-700"
        />
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <BadgeCheck size={20} />
            </span>

            <div>
              <h2 className="text-base font-extrabold text-ink">
                {verification.pending} farms waiting for review
              </h2>
              <p className="text-[11px] text-muted">
                {verification.pending === 0
                  ? "The queue is clear — nothing needs you right now."
                  : "Approve them so their products can go live."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGotoFarmers}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800"
          >
            Review queue
            <ArrowRight size={13} />
          </button>
        </div>
      </section>
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-base font-extrabold text-ink">Recent orders</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-150 border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Payment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-200">
              {recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                recent_orders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3.5 pr-4 font-bold text-ink">#{order.id}</td>

                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-ink">{order.customer_name}</p>
                      <p className="text-[11px] text-muted">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    </td>

                    <td className="py-3.5 pr-4 text-[11px] font-bold text-ink">
                      Rs. {order.total}
                    </td>

                    <td className="py-3.5 pr-4">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-600">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                          order.payment_status === "paid"
                            ? "bg-forest-50 text-forest-700"
                            : order.payment_status === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
