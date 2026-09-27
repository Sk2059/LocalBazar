import axios, { type AxiosError } from "axios";

/**
 * Shared decoding of Django REST Framework error payloads.
 *
 * DRF emits a handful of shapes and the app needs one consistent way to read
 * them:
 *
 *   {"detail": "message"}                 — permission/not-found/serializer-level
 *   {"field": ["message", ...]}           — field validation (400)
 *   {"non_field_errors": ["message"]}     — form-level validation
 *   ["message"]                           — list-style validation
 *
 * `unknown` is used throughout because axios only types `response.data` as
 * `unknown`; every read is guarded so a malformed body can never throw here.
 */

export type ApiErrorCode =
  | "validation"
  | "notFound"
  | "forbidden"
  | "unauthorized"
  | "network"
  | "server"
  | "unknown";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

type ErrorPayload = Record<string, unknown> & { detail?: unknown };

function isObject(value: unknown): value is ErrorPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the first human-readable string from a DRF error value, or null when
 * the payload carries no message we can trust.
 */
export function firstMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();

  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = firstMessage(entry);
      if (message) return message;
    }
  }

  if (isObject(value)) {
    const detail = firstMessage(value.detail);
    if (detail) return detail;

    const nonField = value.non_field_errors;
    if (nonField !== undefined) {
      const message = firstMessage(nonField);
      if (message) return message;
    }

    // Fall back to the first named field message.
    for (const [key, fieldValue] of Object.entries(value)) {
      if (key === "detail" || key === "non_field_errors") continue;
      const message = firstMessage(fieldValue);
      if (message) return message;
    }
  }

  return null;
}

/**
 * The message for a *specific* field, when the server named one. Used to place
 * an error back under the right input via react-hook-form's `setError`.
 */
export function fieldMessage(error: unknown, field: string): string | null {
  if (!axios.isAxiosError(error)) return null;

  const data = (error as AxiosError<ErrorPayload>).response?.data;
  if (!isObject(data)) return null;

  return firstMessage(data[field]);
}

export function resolveApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      code: "unknown",
      message: "Something went wrong. Please try again.",
    };
  }

  const status = error.response?.status;
  const data = (error as AxiosError<ErrorPayload>).response?.data;
  const message = firstMessage(data);

  if (status === 401) {
    // The default Django REST Framework message for missing/invalid tokens is
    // "Authentication credentials were not provided." — not actionable for a
    // logged-in farmer/buyer. Always surface the sign-in prompt; include the
    // server message as a subtle hint only when it carries non-default info.
    const DEFAULT = "Your session may have expired. Please sign in again.";
    const SERVER_HINTS = [
      "Authentication credentials were not provided.",
      "Given token not valid for any token type",
      "Token is invalid or expired",
      "User not found",
    ];
    const hasUsefulHint =
      message && !SERVER_HINTS.some((hint) => message.includes(hint));

    return {
      code: "unauthorized",
      message: hasUsefulHint ? `${DEFAULT} (${message})` : DEFAULT,
    };
  }

  if (status === 403) {
    return {
      code: "forbidden",
      message: message ?? "You don't have permission to do that.",
    };
  }

  if (status === 404) {
    return {
      code: "notFound",
      message: message ?? "We couldn't find what you were looking for.",
    };
  }

  if (status === 400) {
    return {
      code: "validation",
      message: message ?? "Please check the highlighted fields and try again.",
    };
  }

  if (status === undefined || status === null) {
    return {
      code: "network",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }

  if (status >= 500) {
    return {
      code: "server",
      message: message ?? "Our servers are having trouble. Please try again shortly.",
    };
  }

  return {
    code: "unknown",
    message: message ?? "Something went wrong. Please try again.",
  };
}

/**
 * True when the request failed because the caller is not (or no longer is)
 * authenticated. Lets a page distinguish "sign in again" from "try again".
 */
export function isAuthError(error: unknown): boolean {
  return resolveApiError(error).code === "unauthorized";
}
