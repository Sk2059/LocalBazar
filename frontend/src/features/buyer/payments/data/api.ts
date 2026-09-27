import apiClient from "../../../../api/apiClient";

/**
 * Payment feature data API.
 *
 * The server (`payments/`) owns the entire payment lifecycle. The client only
 * ever *requests* an initiation and *submits* the user-entered verification
 * code — it never decides whether a payment succeeded. Only the payment record
 * returned by the server is authoritative.
 */

export type PaymentProvider = "khalti" | "cod";

/**
 * Statuses on the `Payment` model itself. These are distinct from the order's
 * `payment_status` (`pending | paid | failed | refunded`), so keep the two
 * meta maps in their own modules to avoid mixing them up.
 */
export type PaymentRecordStatus =
  | "initiated"
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface PaymentApi {
  id: number;
  order_id: number;
  provider: PaymentProvider;
  status: PaymentRecordStatus;
  amount: string;
  amount_paisa: number;
  pidx: string | null;
  transaction_id: string | null;
  phone: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface InitiateKhaltiPayload {
  order_id: number;
  phone: string;
}

export interface InitiateKhaltiResponse {
  payment_id: number;
  pidx: string;
  /** Hosted payment page (the demo gateway points at our own code screen). */
  payment_url: string;
  /**
   * Demo-only convenience: the dummy gateway "texts" the code but also returns
   * it here so the flow is testable. Never treat this as proof of payment —
   * the code still has to be accepted by the verify endpoint.
   */
  demo_code: string;
  expires_in: number;
}

export interface VerifyKhaltiPayload {
  pidx: string;
  code: string;
}

/**
 * Asks the server to start a Khalti payment for an order. The amount is always
 * taken from the order server-side, so the only client inputs are the order id
 * and the mobile number to pay from.
 */
export async function initiateKhalti(
  payload: InitiateKhaltiPayload,
): Promise<InitiateKhaltiResponse> {
  const response = await apiClient.post<InitiateKhaltiResponse>(
    "/payments/khalti/initiate/",
    payload,
  );
  return response.data;
}

/**
 * Submits the verification code the user entered. The settled payment record
 * in the response is the only acceptable proof that money moved.
 */
export async function verifyKhalti(
  payload: VerifyKhaltiPayload,
): Promise<PaymentApi> {
  const response = await apiClient.post<PaymentApi>(
    "/payments/khalti/verify/",
    payload,
  );
  return response.data;
}

export async function getPayment(paymentId: number): Promise<PaymentApi> {
  const response = await apiClient.get<PaymentApi>(`/payments/${paymentId}/`);
  return response.data;
}
