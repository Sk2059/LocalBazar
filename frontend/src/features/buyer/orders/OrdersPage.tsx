import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  PackageOpen,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

import Container from "../../../components/common/Container";
import { resolveApiError } from "../../../api/errors";
import { useOrders } from "./hooks/useOrders";
import {
  countItems,
  formatOrderDate,
  formatPrice,
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_META,
} from "./data/orderMeta";

export default function OrdersPage() {
  const {
    data: orders,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrders();

  // =========================================================
  //  LOADING
  // =========================================================

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[#FAF8F3]">
        <div className="size-10 animate-spin rounded-full border-[3px] border-[#DCE8D8] border-t-forest-700" />
      </main>
    );
  }

  // =========================================================
  //  ERROR
  // =========================================================

  if (error) {
    return (
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[#FAF8F3] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle className="size-7" />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            Something went wrong
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {resolveApiError(error).message}
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
          >
            {isFetching ? "Loading…" : "Try again"}
          </button>
        </div>
      </main>
    );
  }


  // =========================================================
  //  EMPTY
  // =========================================================

  if (!orders || orders.length === 0) {
    return (
      <main className="relative flex min-h-[calc(100dvh-4.5rem)] items-center justify-center overflow-hidden bg-[#FAF8F3] px-4 py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#EAF2E7] blur-3xl" />
          <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-[#F5E8C7]/40 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full border border-[#DCE8D8] bg-[#EEF5EE] text-forest-700">
            <PackageOpen
              size={32}
              strokeWidth={1.5}
            />
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            No orders yet
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
            When you place an order it appears here, with live delivery status
            and payment details.
          </p>

          <Link
            to="/marketplace"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition-all hover:-translate-y-0.5 hover:bg-forest-800"
          >
            Start shopping

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  //  ORDERS
  // =========================================================

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] bg-[#FAF8F3] py-8 sm:py-10">
      <Container>
        <Link
          to="/"
          className="inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-forest-700 transition hover:border-forest-300 hover:bg-forest-50"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4.5" />
        </Link>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-harvest-500">
            Your account
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            My orders
          </h1>

          <p className="mt-1 text-sm text-muted">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>

        <div className="mt-7 space-y-4">
          {orders.map((order) => {
            const status = ORDER_STATUS_META[order.status];
            const payment = PAYMENT_STATUS_META[order.payment_status];
            const itemCount = countItems(order);
            const firstItem = order.items[0]?.product_name ?? "Items";
            const extraItems = order.items.length - 1;

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-[#E6E2DA] bg-white p-5 shadow-[0_10px_35px_rgba(45,90,39,0.05)] transition-all hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-[0_16px_40px_rgba(45,90,39,0.1)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF5EE] text-forest-700">
                    <ShoppingBag className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold text-ink">
                        Order #{order.id}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badge}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      {formatOrderDate(order.created_at)} · {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"} ·{" "}
                      {PAYMENT_METHOD_LABEL[order.payment_method]}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#7A8575]">
                      {firstItem}
                      {extraItems > 0 && ` + ${extraItems} more`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${payment.badge}`}
                    >
                      {payment.label}
                    </span>

                    <p className="font-display text-lg font-bold text-forest-700">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <span className="flex size-9 items-center justify-center rounded-full bg-[#F5F8F3] text-forest-700 transition group-hover:bg-forest-700 group-hover:text-white">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
