/**
 * Carries a just-initiated Khalti payment across the browser navigation to the
 * code-entry page.
 *
 * The backend hands back a `payment_url` for the hosted checkout page — which
 * in demo mode is our own `/payment-verify?pidx=…` route — so the redirect is a
 * full page load and nothing in memory survives. The fields stored here are
 * presentational only (what to show the buyer while they type the code). They
 * are *never* treated as payment status: the only thing that authorises an
 * order is the server's settled payment record, reached via the verify
 * endpoint with the code the user typed.
 */
export interface PendingPayment {
  pidx: string;
  paymentId: number;
  orderId: number;
  amount: string;
  /** Demo-only: the dummy gateway returns the code instead of texting it. */
  demoCode?: string;
  createdAt: number;
}

const STORAGE_KEY = "koshi_pending_payment";
const TTL_MS = 30 * 60 * 1000;

type PendingMap = Record<string, PendingPayment>;

function read(): PendingMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as PendingMap) : {};
  } catch {
    return {};
  }
}

function write(map: PendingMap): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* Storage may be unavailable; the page still works without prefill. */
  }
}

export function stashPendingPayment(payment: PendingPayment): void {
  const map = read();
  map[payment.pidx] = payment;
  write(map);
}

/**
 * Returns the stashed context for `pidx`, dropping it once read so a stale
 * context can never be replayed for a later attempt.
 */
export function takePendingPayment(pidx: string): PendingPayment | null {
  if (!pidx) return null;

  const map = read();
  const entry = map[pidx];

  if (!entry) return null;

  // Expired contexts are discarded on read.
  if (Date.now() - entry.createdAt > TTL_MS) {
    delete map[pidx];
    write(map);
    return null;
  }

  return entry;
}

export function clearPendingPayment(pidx: string): void {
  if (!pidx) return;

  const map = read();
  delete map[pidx];
  write(map);
}
