import axios, { type AxiosError } from "axios";

import {
  firstMessage,
  resolveApiError,
} from "../../../../api/errors";

/**
 * Maps the server's checkout validation keys onto a friendly (title, hint)
 * pair. The server already rejects with readable messages — this layer only
 * adds context and, for the recoverable cases, tells the buyer what to do
 * next. Server messages are always preferred over a generic fallback.
 */
export interface CheckoutError {
  title: string;
  message: string;
  /** Recoverable without changing the form (e.g. retry). */
  retryable: boolean;
}

const KEY_HINTS: Record<string, { title: string; hint: string }> = {
  cart: {
    title: "Your cart is empty",
    hint: "Add some produce before checking out.",
  },
  product: {
    title: "An item is unavailable",
    hint: "Remove it from your cart to continue.",
  },
  stock: {
    title: "Stock changed while you were shopping",
    hint: "Update the quantity in your cart and try again.",
  },
  delivery_zone: {
    title: "Delivery unavailable here",
    hint: "We don't deliver to this location yet. Choose a nearby area we serve.",
  },
  minimum_order: {
    title: "Minimum order not met",
    hint: "Add a little more to your cart to reach the minimum for your area.",
  },
};

export function describeCheckoutError(error: unknown): CheckoutError {
  if (!axios.isAxiosError(error)) {
    return {
      title: "Something went wrong",
      message: "We couldn't place your order. Please try again.",
      retryable: true,
    };
  }

  const status = error.response?.status;
  const data = (error as AxiosError<Record<string, unknown>>).response?.data;

  if (status === 401) {
    return {
      title: "Session expired",
      message: "Please sign in again to place your order.",
      retryable: false,
    };
  }

  if (status === 403) {
    return {
      title: "Account not eligible",
      message: "Only buyer accounts can place orders.",
      retryable: false,
    };
  }

  if (status === 400 && typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      const hint = KEY_HINTS[key];
      if (!hint) continue;

      return {
        title: hint.title,
        message: firstMessage(value) ?? hint.hint,
        retryable: key !== "cart",
      };
    }

    const generic = resolveApiError(error);
    return {
      title: "Check your details",
      message: generic.message,
      retryable: true,
    };
  }

  if (status === undefined || status === null || status >= 500) {
    return {
      title: "We couldn't place your order",
      message: "Our servers are having trouble. Please try again shortly.",
      retryable: true,
    };
  }

  return {
    title: "We couldn't place your order",
    message: resolveApiError(error).message,
    retryable: true,
  };
}
