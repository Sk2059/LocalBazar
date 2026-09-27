import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import Container from "../../../components/common/Container";
import { resolveApiError } from "../../../api/errors";
import { useOrder } from "./hooks/useOrders";
import {
  countItems,
  formatOrderDate,
  formatPrice,
  ORDER_STATUS_META,
} from "./data/orderMeta";
import DeliveryInformation from "./components/DeliveryInformation";
import OrderItemCard from "./components/OrderItemCard";
import OrderStatusTimeline from "./components/OrderStatusTimeline";
import PaymentInformation from "./components/PaymentInformation";
import PayWithKhalti from "../payments/components/PayWithKhalti";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: boolean } | null)
    ?.justPlaced;

  const {
    data: order,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrder(orderId ? Number(orderId) : undefined);

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
  //  NOT FOUND / ERROR
  // =========================================================

  if (error || !order) {
    const notFound = resolveApiError(error).code === "notFound";

    return (
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[#FAF8F3] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#EFF5EE] text-forest-700">
            <AlertCircle className="size-7" />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            {notFound ? "Order not found" : "Something went wrong"}
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {notFound
              ? "This order doesn't exist or belongs to another account. Check your orders list for the right one."
              : resolveApiError(error).message}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-forest-700 transition hover:border-forest-300"
            >
              All orders
            </Link>

            {!notFound && (
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
              >
                {isFetching ? "Loading…" : "Try again"}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }


  // =========================================================
  //  ORDER
  // =========================================================

  const status = ORDER_STATUS_META[order.status];
  const itemCount = countItems(order);

  const awaitingKhaltiPayment =
    order.payment_method === "khalti" &&
    order.payment_status !== "paid" &&
    order.status !== "cancelled";

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] bg-[#FAF8F3] py-8 sm:py-10">
      <Container>
        <Link
          to="/orders"
          className="inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-forest-700 transition hover:border-forest-300 hover:bg-forest-50"
          aria-label="Back to orders"
        >
          <ArrowLeft className="size-4.5" />
        </Link>

        {justPlaced && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-forest-200 bg-forest-50 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-forest-600" />

            <div>
              <p className="text-sm font-bold text-forest-800">
                Order placed successfully
              </p>

              <p className="mt-0.5 text-xs leading-5 text-forest-700/80">
                Track its progress any time from My Orders.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-harvest-500">
              Your account
            </p>

            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Order #{order.id}
            </h1>

            <p className="mt-1 text-sm text-muted">
              Placed {formatOrderDate(order.created_at)} · {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          <span
            className={`ml-auto rounded-full px-3 py-1 text-[11px] font-bold ${status.badge}`}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ============================================== MAIN */}
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.06)]">
              <div className="border-b border-[#EAE7E0] px-5 py-4">
                <h2 className="font-display text-base font-semibold text-ink">
                  Order progress
                </h2>
              </div>

              <div className="px-5 py-5">
                <OrderStatusTimeline status={order.status} />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.06)]">
              <div className="flex items-center justify-between border-b border-[#EAE7E0] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-forest-700" />

                  <h2 className="font-display text-base font-semibold text-ink">
                    Items in this order
                  </h2>
                </div>

                <span className="text-xs text-muted">
                  {order.items.length} line{order.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <ul className="divide-y divide-[#F0EDE6] px-5">
                {order.items.map((item) => (
                  <OrderItemCard
                    key={item.id}
                    item={item}

                  />
                ))}
              </ul>
            </section>
          </div>


          {/* ============================================== SIDEBAR */}
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.06)]">
              <div className="border-b border-[#EAE7E0] px-5 py-4">
                <h2 className="font-display text-base font-semibold text-ink">
                  Summary
                </h2>
              </div>

              <div className="space-y-2.5 px-5 py-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7C66]">
                    Subtotal ({itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"})
                  </span>

                  <span className="font-medium text-[#34452F]">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6B7C66]">Delivery</span>

                  <span className="font-medium text-[#34452F]">
                    {Number(order.delivery_fee) === 0 ? (
                      <span className="text-forest-700">FREE</span>
                    ) : (
                      formatPrice(order.delivery_fee)
                    )}
                  </span>
                </div>

                <div className="my-1 h-px bg-[#EAE7E0]" />

                <div className="flex items-end justify-between">
                  <span className="font-semibold text-ink">Total</span>

                  <span className="font-display text-2xl font-bold text-forest-700">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </section>

            <PaymentInformation order={order} />

            {awaitingKhaltiPayment && (
              <PayWithKhalti
                orderId={order.id}
                orderTotal={order.total}
                defaultPhone={order.payment?.phone ?? null}
                previousPidx={order.payment?.pidx ?? null}
              />
            )}

            <DeliveryInformation order={order} />

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DADFD6] bg-white px-4 py-3 text-sm font-semibold text-[#34452F] transition hover:border-[#A8C4A0]"
              >
                All orders
              </Link>

              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition hover:bg-forest-800"
              >
                Keep shopping
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
