import { ShieldCheck } from "lucide-react";
import { useState } from "react";

/**
 * The Khalti verification-code entry.
 *
 * This stands in for the Khalti hosted page in the demo gateway: the real
 * gateway would collect the wallet PIN/OTP itself and call back to the server.
 * Here the buyer types the 6-digit code and we submit it to the verify
 * endpoint; only that response can mark the payment complete.
 *
 * Deliberately presentational and stateless about payment outcome: `error`,
 * `submitting` and `attemptsLeft` are all driven by the parent, which gets
 * them straight from the server.
 */
export default function KhaltiCodeChallenge({
  amount,
  demoCode,
  attemptsLeft,
  submitting,
  error,
  onSubmit,
}: {
  amount?: string;
  /** Demo gateway only — surfaced because no SMS is actually sent. */
  demoCode?: string;
  attemptsLeft?: number;
  submitting?: boolean;
  /** Latest server-side error for the submitted code. */
  error?: string | null;
  onSubmit: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  const valid = /^\d{6}$/.test(code.trim());

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || submitting) return;
    onSubmit(code.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-3xl border border-[#E4E1DA] bg-white p-6 shadow-[0_18px_60px_rgba(28,43,25,0.12)]"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#5C2D91] text-white">
          <ShieldCheck className="size-5.5" />
        </div>

        <div>
          <p className="font-display text-lg font-semibold text-ink">
            Khalti payment
          </p>

          <p className="text-xs text-muted">
            Enter the code sent to your Khalti mobile
          </p>
        </div>
      </div>

      {amount && (
        <div className="mt-5 flex items-end justify-between rounded-xl bg-[#F7F4FB] px-4 py-3">
          <span className="text-xs font-medium text-[#6B5B7B]">
            Amount due
          </span>

          <span className="font-display text-xl font-bold text-[#5C2D91]">
            {amount}
          </span>
        </div>
      )}

      <div className="mt-5">
        <label
          htmlFor="khalti-code"
          className="mb-1.5 block text-xs font-semibold text-[#34452F]"
        >
          Verification code
        </label>

        <input
          id="khalti-code"
          name="khalti-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="• • • • • •"
          value={code}
          disabled={submitting}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className={`w-full rounded-xl border bg-white py-3 text-center font-mono text-lg font-bold tracking-[0.35em] text-ink outline-none transition placeholder:tracking-[0.35em] placeholder:text-stone-300 disabled:opacity-60 ${
            error
              ? "border-red-300 focus:border-red-500"
              : "border-[#E1DED6] focus:border-[#5C2D91] focus:ring-2 focus:ring-[#5C2D91]/10"
          }`}
        />

        <div className="mt-2 flex min-h-5 items-center">
          {error ? (
            <p className="text-[11px] font-medium text-red-500">{error}</p>
          ) : attemptsLeft !== undefined ? (
            <p className="text-[11px] text-muted">
              {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid || submitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C2D91] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5C2D91]/20 transition-all hover:-translate-y-0.5 hover:bg-[#4A245F] disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          "Verify and pay"
        )}
      </button>

      {demoCode && (
        <div className="mt-4 rounded-xl border border-dashed border-[#D9C9EE] bg-[#FAF7FE] px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#7B5A9E]">
            Demo mode
          </p>

          <p className="mt-1 text-[11px] leading-4 text-[#5F4B78]">
            No SMS is actually sent in the demo gateway. Your one-time code is{" "}
            <span className="font-mono font-bold tracking-widest">
              {demoCode}
            </span>
          </p>
        </div>
      )}

      <p className="mt-4 text-center text-[10px] leading-4 text-muted">
        Never share your code with anyone. Koshi Bazaar will never ask for it
        outside the payment screen.
      </p>
    </form>
  );
}
