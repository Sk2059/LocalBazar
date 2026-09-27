import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShoppingBag,
} from "lucide-react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Container from "../../../components/common/Container";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { resolveApiError } from "../../../api/errors";
import { useOrder } from "../orders/hooks/useOrders";
import type { OrderApi } from "../orders/data/api";
import {
  countItems,
  formatPrice,
} from "../orders/data/orderMeta";
import DeliveryInformation from "../orders/components/DeliveryInformation";
import OrderItemCard from "../orders/components/OrderItemCard";
import PaymentInformation from "../orders/components/PaymentInformation";

/**
 * The post-payment landing page.
 *
 * The only thing that decides what the buyer sees here is the order the server
 * returns — never the query string, never client state. A `status` param may be
 * present for deep links, but it is deliberately *not* used to conclude
 * anything; the fetched order is authoritative.
 */

type Outcome = "paid" | "pending" | "failed" | "cancelled" | "unknown";

const OUTCOME_META: Record<
  Outcome,
  {
    icon: typeof CheckCircle2;
    title: string;
    description: string;
    accent: string;
    iconWrap: string;
  }
> = {
  paid: {
    icon: CheckCircle2,
    title: "Payment successful",
    description:
      "Your payment is verified and your order is confirmed. The farmer is getting your produce ready.",
    accent: "text-forest-700",
    iconWrap: "bg-forest-100 text-forest-700",
  },
  pending: {
    icon: Clock,
    title: "Payment pending",
    description:
      "We haven't received a verified payment for this order yet. Complete the payment to confirm it.",
    accent: "text-harvest-700",
    iconWrap: "bg-harvest-100 text-harvest-700",
  },
  failed: {
    icon: AlertCircle,
    title: "Payment failed",
    description:
      "The payment couldn't be verified. No money was taken — you can safely try again.",
    accent: "text-red-600",
    iconWrap: "bg-red-100 text-red-600",
  },
  cancelled: {
    icon: AlertCircle,
    title: "Order cancelled",
    description: "This order was cancelled and won't be delivered.",
    accent: "text-stone-600",
    iconWrap: "bg-stone-100 text-stone-600",
  },
  unknown: {
    icon: AlertCircle,
    title: "We couldn't confirm this order",
    description:
      "Something went wrong while checking the payment. Your orders list has the latest status.",
    accent: "text-stone-600",
    iconWrap: "bg-stone-100 text-stone-600",
  },
};

function deriveOutcome(order: OrderApi | undefined | null): Outcome {
  if (!order) return "unknown";
  if (order.status === "cancelled") return "cancelled";
  if (order.payment_status === "paid") return "paid";
  if (order.payment_status === "failed") return "failed";
  if (order.payment_status === "pending" || order.payment_status === "refunded")
    return "pending";
  return "unknown";
}


export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const orderIdParam = searchParams.get("order_id");
  const orderId = orderIdParam ? Number(orderIdParam) : undefined;

  const {
    data: order,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrder(orderId);

  // A malformed or missing order id can never resolve to a payment state.
  const invalidOrderId = !orderIdParam || !Number.isFinite(orderId);

  const outcome = deriveOutcome(order);
  const meta = OUTCOME_META[outcome];
  const itemCount = order ? countItems(order) : 0;

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
  //  INVALID LINK / ERROR
  // =========================================================

  if (invalidOrderId || (error && !order)) {
    const message = invalidOrderId
      ? "The payment link doesn't include an order reference."
      : resolveApiError(error).message;

    return (
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[#FAF8F3] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
            <AlertCircle className="size-7" />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            We couldn't confirm this payment
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            {message}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800"
            >
              Go to my orders
            </Link>

            {!invalidOrderId && (
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-forest-700 transition hover:border-forest-300 disabled:opacity-60"
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
  //  RESULT
  // =========================================================

  const Icon = meta.icon;

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] bg-[#FAF8F3] py-8 sm:py-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start gap-4 rounded-3xl border border-[#E6E2DA] bg-white p-6 shadow-[0_14px_45px_rgba(45,90,39,0.08)] sm:p-8">
            <div
              className={`grid size-14 shrink-0 place-items-center rounded-2xl ${meta.iconWrap}`}
            >
              <Icon className="size-7" />
            </div>

            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.18em] ${meta.accent}`}
              >
                Order #{order!.id}
              </p>

              <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {meta.title}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {meta.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {outcome === "paid" && (
                  <>
                    <Link
                      to={`/orders/${order!.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition hover:bg-forest-800"
                    >
                      View order details
                    </Link>

                    <Link
                      to="/marketplace"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-forest-700 transition hover:border-forest-300"
                    >
                      Keep shopping
                    </Link>
                  </>
                )}

                {(outcome === "pending" || outcome === "failed") && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (order!.payment_method !== "khalti") {
                          toast.info(
                            "Cash on delivery",
                            "This order is paid when it's delivered — no online payment needed.",
                          );
                          return;
                        }

                        // The order page owns the (re)start flow and the
                        // server-side validation that comes with it.
                        window.location.href = `/orders/${order!.id}`;
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5C2D91] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#5C2D91]/20 transition hover:bg-[#4A245F]"
                    >
                      Pay with Khalti
                    </button>

                    <Link
                      to={`/orders/${order!.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-forest-700 transition hover:border-forest-300"
                    >
                      View order
                    </Link>
                  </>
                )}

                {(outcome === "cancelled" || outcome === "unknown") && (
                  <Link
                    to="/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800"
                  >
                    Go to my orders
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ============================================== ITEMS */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.05)]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-forest-700" />

                <h2 className="font-display text-base font-semibold text-ink">
                  Items
                </h2>
              </div>

              <span className="text-xs text-muted">
                {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                {formatPrice(order!.total)}
              </span>
            </div>

            <ul className="divide-y divide-[#F0EDE6] px-5">
              {order!.items.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                />
              ))}
            </ul>
          </section>

          {/* ============================================== DETAILS */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <PaymentInformation order={order!} />

            <DeliveryInformation order={order!} />
          </div>

          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest-700 transition hover:text-forest-800"
          >
            <ArrowLeft className="size-4" />
            All orders
          </Link>
        </div>
      </Container>
    </main>
  );
}
