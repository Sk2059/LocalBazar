import { AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useToast } from "../../../components/ui/toast/ToastProvider";
import { useVerifyKhalti } from "./hooks/usePayments";
import { describePaymentError } from "./data/errors";
import {
  clearPendingPayment,
  takePendingPayment,
  type PendingPayment,
} from "./data/pendingPayment";
import KhaltiCodeChallenge from "./components/KhaltiCodeChallenge";

/**
 * The Khalti code-entry screen.
 *
 * The demo gateway's `payment_url` points here with `?pidx=…`. It behaves like
 * the real hosted checkout page would: the buyer approves the payment here, we
 * submit only the code to the verify endpoint, and the server's settled payment
 * record is what authorises the order. Nothing on this page can mark a payment
 * complete by itself.
 */
export default function KhaltiVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const verify = useVerifyKhalti();

  const pidx = searchParams.get("pidx");
  const [pending] = useState<PendingPayment | null>(() =>
    pidx ? takePendingPayment(pidx) : null,
  );
  const [codeError, setCodeError] = useState<string | null>(null);

  // "Invalid verification code. N attempt(s) left." → N
  const attemptsLeft = codeError
    ? Number(/(\d+)\s*attempt/.exec(codeError)?.[1] ?? "") || undefined
    : undefined;

  async function handleSubmit(code: string) {
    if (!pidx) return;

    setCodeError(null);

    try {
      const payment = await verify.mutateAsync({ pidx, code });

      clearPendingPayment(pidx);

      toast.success(
        "Payment verified successfully",
        `Order #${payment.order_id} is now paid${
          payment.transaction_id ? ` (ref ${payment.transaction_id})` : ""
        }.`,
      );

      // The settled record is the authority; the result page re-fetches the
      // order so it never reflects a client-side assumption.
      navigate(`/payment-result?order_id=${payment.order_id}`, {
        replace: true,
      });
    } catch (error) {
      const described = describePaymentError(error);

      // The gateway may report the payment as already settled — that's the
      // happy path, not an error.
      if (described.treatAsPaid) {
        clearPendingPayment(pidx);
        toast.info("Payment already completed", "No further action needed.");

        // Without a stashed context we don't know the order id here, so fall
        // back to the orders list rather than guessing.
        navigate(
          pending ? `/payment-result?order_id=${pending.orderId}` : "/orders",
          { replace: true },
        );
        return;
      }

      // Locked out or the payment record is gone: the buyer must start a fresh
      // payment from the order, so take them straight there.
      if (described.mustRestart && pending) {
        clearPendingPayment(pidx);
        toast.error(described.title, described.message);
        navigate(`/orders/${pending.orderId}`, { replace: true });
        return;
      }

      setCodeError(described.message);
    }
  }

  // =========================================================
  //  NO PAYMENT IN THE URL
  // =========================================================

  if (!pidx) {
    return (
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[#FAF8F3] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#EFF5EE] text-forest-700">
            <AlertCircle className="size-7" />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            Payment link not found
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            We couldn't tell which payment to verify. Open the order and start
            the payment again.
          </p>

          <Link
            to="/orders"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800"
          >
            Go to my orders
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  //  CHALLENGE
  // =========================================================

  return (
    <main className="relative flex min-h-[calc(100dvh-4.5rem)] items-center justify-center overflow-hidden bg-linear-to-b from-[#F7F4FB] to-[#FAF8F3] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-24 size-96 rounded-full bg-[#EDE3F7] blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-[#EAF2E7] blur-3xl" />
      </div>

      <div className="relative flex w-full flex-col items-center">
        <Link
          to={pending ? `/orders/${pending.orderId}` : "/orders"}
          className="mb-6 inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-forest-700 transition hover:border-forest-300 hover:bg-forest-50"
          aria-label="Cancel and go back"
        >
          <ArrowLeft className="size-4.5" />
        </Link>

        <KhaltiCodeChallenge
          amount={pending ? `Rs. ${Number(pending.amount).toLocaleString("en-NP")}` : undefined}
          demoCode={pending?.demoCode}
          attemptsLeft={attemptsLeft}
          submitting={verify.isPending}
          error={codeError}
          onSubmit={handleSubmit}
        />

        {!pending && (
          <p className="mt-4 max-w-sm text-center text-[11px] leading-5 text-muted">
            Enter the code sent to your Khalti mobile. Tip: codes started from
            the order page are shown there too.
          </p>
        )}
      </div>
    </main>
  );
}
