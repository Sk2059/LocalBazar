import { PackageSearch } from "lucide-react";
import { useState } from "react";

import {
  useAdminOrders,
  useUpdateOrderStatus,
} from "./data/hooks";
import type { OrderStatusUpdate } from "./data/api";
import type {
  OrderApi,
  OrderStatus,
  PaymentStatus,
} from "../buyer/orders/data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENTS: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

/**
 * Every order in the marketplace. Status and payment status are separate
 * selects because they move independently — an order can be delivered while its
 * Khalti payment is still reconciling.
 */
export default function OrdersTab() {
  const { data: orders, isLoading } = useAdminOrders();

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      </section>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
          <PackageSearch size={26} className="mx-auto text-stone-400" />
          <p className="mt-3 text-sm font-bold text-ink">No orders yet</p>
          <p className="mt-1 text-xs text-muted">
            Orders appear here the moment a buyer checks out.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
        Orders
      </p>
      <h2 className="mt-1 text-lg font-extrabold text-ink">All transactions</h2>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-170 border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-200 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              <th className="py-3 pr-4">Order</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Items</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3">Payment</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderRow({ order }: { order: OrderApi }) {
  const update = useUpdateOrderStatus();
  const toast = useToast();
  const [payment, setPayment] = useState<PaymentStatus>(order.payment_status);

  function submit(payload: OrderStatusUpdate, successMessage: string) {
    update.mutate(
      { orderId: order.id, payload },
      {
        onSuccess: () => toast.success("Order updated", successMessage),
        onError: (error) =>
          toast.error("Could not update", resolveApiError(error).message),
      },
    );
  }

  return (
    <tr className="text-sm">
      <td className="py-3.5 pr-4">
        <p className="font-bold text-ink">#{order.id}</p>
        <p className="text-[11px] text-muted">
          {new Date(order.created_at).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </p>
      </td>

      <td className="py-3.5 pr-4">
        <p className="font-bold text-ink">{order.customer_name}</p>
        <p className="max-w-40 truncate text-[11px] text-muted">
          {order.delivery_address}
        </p>
      </td>

      <td className="py-3.5 pr-4 text-[11px] font-bold text-muted">
        {order.items.length}
      </td>

      <td className="py-3.5 pr-4 text-[11px] font-bold text-ink">
        Rs. {order.total}
      </td>

      <td className="py-3.5 pr-4">
        <select
          value={order.status}
          onChange={(event) =>
            submit(
              { status: event.target.value as OrderStatus },
              `Order #${order.id} is now ${event.target.value.replace(/_/g, " ")}.`,
            )
          }
          disabled={update.isPending}
          className="rounded-lg border border-stone-200 bg-cream px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none transition focus:border-forest-600 disabled:opacity-60"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </td>

      <td className="py-3.5">
        <select
          value={payment}
          onChange={(event) => {
            const next = event.target.value as PaymentStatus;
            setPayment(next);
            submit(
              { status: order.status, payment_status: next },
              `Payment for #${order.id} marked ${next}.`,
            );
          }}
          disabled={update.isPending}
          className="rounded-lg border border-stone-200 bg-cream px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none transition focus:border-forest-600 disabled:opacity-60"
        >
          {PAYMENTS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
