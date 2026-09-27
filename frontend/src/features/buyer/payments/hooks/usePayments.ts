import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { queryClient } from "../../../../api/queryClient";
import {
  getPayment,
  initiateKhalti,
  verifyKhalti,
  type InitiateKhaltiPayload,
  type InitiateKhaltiResponse,
  type VerifyKhaltiPayload,
  type PaymentApi,
} from "../data/api";

const PAYMENT_KEY = "payments";

/**
 * Starts a Khalti payment. Invalidation is intentionally not done here: the
 * caller decides what happens next (redirect to `payment_url`), and the order
 * only becomes "paid" after {@link useVerifyKhalti} succeeds.
 */
export function useInitiateKhalti() {
  return useMutation<InitiateKhaltiResponse, Error, InitiateKhaltiPayload>({
    mutationFn: (payload) => initiateKhalti(payload),
  });
}

/**
 * Submits the Khalti verification code. A successful response means the server
 * settled the payment, so every order/payment view is refreshed so nothing
 * shows a stale "unpaid" state.
 */
export function useVerifyKhalti() {
  return useMutation<PaymentApi, Error, VerifyKhaltiPayload>({
    mutationFn: (payload) => verifyKhalti(payload),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      void queryClient.invalidateQueries({
        queryKey: [PAYMENT_KEY, payment.id],
      });
      void queryClient.invalidateQueries({
        queryKey: [PAYMENT_KEY, "order", payment.order_id],
      });
    },
  });
}

export function usePayment(paymentId: number | null) {
  return useQuery({
    queryKey: [PAYMENT_KEY, paymentId],
    enabled: paymentId !== null,
    queryFn: () => getPayment(paymentId as number),
  });
}
