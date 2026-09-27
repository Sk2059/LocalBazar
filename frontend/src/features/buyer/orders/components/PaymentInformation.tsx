import {
  CreditCard,
  Receipt,
} from "lucide-react";

import type { OrderApi } from "../data/api";
import {
  formatPrice,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_META,
} from "../data/orderMeta";
import { formatPaymentDate } from "../../payments/data/paymentMeta";

/**
 * Payment summary for an order.
 *
 * Everything here is read from the server's payment record and the order's
 * payment status — nothing is inferred from client state. The "pay again"
 * affordance for an unsettled Khalti order is rendered separately by the page.
 */
export default function PaymentInformation({
  order,
}: {
  order: OrderApi;
}) {
  const status = PAYMENT_STATUS_META[order.payment_status];
  const payment = order.payment;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.06)]">
      <div className="border-b border-[#EAE7E0] px-5 py-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-forest-700" />

          <h2 className="font-display text-base font-semibold text-ink">
            Payment
          </h2>
        </div>
      </div>

      <div className="space-y-3.5 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#4A5A45]">
            {PAYMENT_METHOD_LABEL[order.payment_method]}
          </span>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badge}`}
          >
            {status.label}
          </span>
        </div>

        {payment && payment.provider === "khalti" && (
          <dl className="space-y-2 rounded-xl border border-[#EEEAE3] bg-[#FBFCFA] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <Receipt className="size-3.5" />
                Amount
              </dt>

              <dd className="text-xs font-bold text-ink">
                {formatPrice(payment.amount)}
              </dd>
            </div>

            {payment.transaction_id && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-muted">Transaction ID</dt>

                <dd className="font-mono text-xs font-semibold text-ink">
                  {payment.transaction_id}
                </dd>
              </div>
            )}

            {payment.paid_at && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-muted">Paid on</dt>

                <dd className="text-xs font-semibold text-ink">
                  {formatPaymentDate(payment.paid_at)}
                </dd>
              </div>
            )}

            {payment.phone && !payment.paid_at && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-muted">Mobile wallet</dt>

                <dd className="text-xs font-semibold text-ink">
                  {payment.phone}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </section>
  );
}
