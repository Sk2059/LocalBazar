import axios, { type AxiosError } from "axios";

import {
  firstMessage,
  resolveApiError,
} from "../../../../api/errors";

/**
 * Maps Khalti payment errors onto copy the buyer can act on.
 *
 * The two recoverable situations are a mistyped code (attempts remain) and an
 * expired/locked payment (start again). Everything else is surfaced with the
 * server's own message.
 */
export interface PaymentError {
  title: string;
  message: string;
  /** True when retrying the same payment makes sense. */
  retryable: boolean;
  /** True when the payment window closed and a new one must be started. */
  mustRestart: boolean;
  /** True when the server says the payment already settled — success, not an error. */
  treatAsPaid: boolean;
}

export function describePaymentError(error: unknown): PaymentError {
  if (!axios.isAxiosError(error)) {
    return {
      title: "Payment failed",
      message: "We couldn't verify your payment. Please try again.",
      retryable: true,
      mustRestart: false,
      treatAsPaid: false,
    };
  }

  const status = error.response?.status;
  const data = (error as AxiosError<Record<string, unknown>>).response?.data;

  if (status === 401) {
    return {
      title: "Session expired",
      message: "Please sign in again to complete your payment.",
      retryable: false,
      mustRestart: false,
      treatAsPaid: false,
    };
  }

  if (typeof data === "object" && data !== null) {
    const codeMessage = firstMessage(data.code);
    if (codeMessage) {
      // Locked out after too many wrong codes.
      const locked = codeMessage.toLowerCase().startsWith("too many");
      return {
        title: locked ? "Payment locked" : "Incorrect code",
        message: codeMessage,
        retryable: !locked,
        mustRestart: locked,
        treatAsPaid: false,
      };
    }

    if (firstMessage(data.payment)) {
      const message = firstMessage(data.payment) as string;

      // The server rejects a re-verify of a settled payment; that is a success
      // state for the buyer, so the page routes them to the paid result.
      const alreadyPaid = message
        .toLowerCase()
        .includes("already been completed");

      return {
        title: alreadyPaid ? "Payment completed" : "Payment problem",
        message,
        retryable: false,
        mustRestart: !alreadyPaid,
        treatAsPaid: alreadyPaid,
      };
    }

    if (firstMessage(data.phone)) {
      return {
        title: "Check your mobile number",
        message: firstMessage(data.phone) as string,
        retryable: true,
        mustRestart: false,
        treatAsPaid: false,
      };
    }

    if (firstMessage(data.detail)) {
      return {
        title: "Payment failed",
        message: firstMessage(data.detail) as string,
        retryable: false,
        mustRestart: true,
        treatAsPaid: false,
      };
    }
  }

  return {
    title: "Payment failed",
    message: resolveApiError(error).message,
    retryable: true,
    mustRestart: false,
    treatAsPaid: false,
  };
}
