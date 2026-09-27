import { ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";

import { useToast } from "../../../../components/ui/toast/ToastProvider";
import { useInitiateKhalti } from "../hooks/usePayments";
import { describePaymentError } from "../data/errors";
import {
  clearPendingPayment,
  stashPendingPayment,
} from "../data/pendingPayment";

/**
 * Restarts a Khalti payment for an order that hasn't been paid yet (the buyer
 * abandoned the code screen, or the previous attempt failed and was locked).
 *
 * The phone number is the only client input; the amount always comes from the
 * order. On success the browser is sent to the server-provided `payment_url`
 * — a full navigation, exactly as it would be for the real gateway.
 */
export default function PayWithKhalti({
  orderId,
  orderTotal,
  defaultPhone,
  previousPidx,
}: {
  orderId: number;
  orderTotal: string;
  defaultPhone?: string | null;
  /** Any prior, superseded payment for this order, cleaned up on restart. */
  previousPidx?: string | null;
}) {
  const initiate = useInitiateKhalti();
  const toast = useToast();

  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, "");
  const phoneValid = digits.length === 10 && digits.startsWith("9");

  async function handleStart(event: React.FormEvent) {
    event.preventDefault();
    if (initiate.isPending) return;

    setInlineError(null);

    if (!phoneValid) {
      setInlineError("Enter a valid 10-digit Nepali mobile number starting with 9.");
      return;
    }

    try {
      const response = await initiate.mutateAsync({
        order_id: orderId,
        phone: digits,
      });

      // A stashed context only powers the code screen's copy; the payment is
      // settled by the verify endpoint, never by the presence of this data.
      if (previousPidx) clearPendingPayment(previousPidx);

      stashPendingPayment({
        pidx: response.pidx,
        paymentId: response.payment_id,
        orderId,
        amount: orderTotal,
        demoCode: response.demo_code,
        createdAt: Date.now(),
      });

      window.location.href = response.payment_url;
    } catch (error) {
      const described = describePaymentError(error);
      toast.error(described.title, described.message);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E4DCEF] bg-white shadow-[0_10px_35px_rgba(92,45,145,0.08)]">
      <div className="border-b border-[#EFE7F7] bg-[#FAF7FE] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-[#5C2D91] text-white">
            <ShieldCheck className="size-4" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              Complete your payment
            </h2>

            <p className="mt-0.5 text-xs text-[#6B5B7B]">
              Pay Rs. {Number(orderTotal).toLocaleString("en-NP")} with Khalti
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleStart}
        className="space-y-3 px-5 py-4"
      >
        <div>
          <label
            htmlFor="khalti-phone"
            className="mb-1.5 block text-xs font-semibold text-[#34452F]"
          >
            Khalti mobile number
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9585]">
              <Smartphone className="size-4" />
            </span>

            <input
              id="khalti-phone"
              name="khalti-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="98XXXXXXXX"
              value={phone}
              disabled={initiate.isPending}
              onChange={(event) => setPhone(event.target.value)}
              className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-ink outline-none transition placeholder:text-[#A1AAA0] disabled:opacity-60 ${
                inlineError
                  ? "border-red-300 focus:border-red-500"
                  : "border-[#E1DED6] focus:border-[#5C2D91] focus:ring-2 focus:ring-[#5C2D91]/10"
              }`}
            />
          </div>

          <div className="mt-1.5 min-h-4">
            {inlineError && (
              <p className="text-[11px] text-red-500">{inlineError}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={initiate.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C2D91] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5C2D91]/20 transition-all hover:-translate-y-0.5 hover:bg-[#4A245F] disabled:pointer-events-none disabled:opacity-60"
        >
          {initiate.isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <ShieldCheck className="size-4" />
          )}

          {initiate.isPending ? "Connecting to Khalti…" : "Pay with Khalti"}
        </button>

        <p className="text-center text-[11px] leading-4 text-muted">
          You'll be redirected to Khalti to approve the payment.
        </p>
      </form>
    </section>
  );
}
