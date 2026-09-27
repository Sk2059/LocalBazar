import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useRejectFarmer } from "./data/hooks";
import type { AdminFarmerApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

/**
 * The rejection dialog. A reason is mandatory on the server (`requires_note` on
 * `_FarmerDecisionView`), so the form refuses to submit an empty one rather
 * than waiting for the 400.
 */
export default function RejectDialog({
  farmer,
  onClose,
}: {
  farmer: AdminFarmerApi;
  onClose: () => void;
}) {
  const reject = useRejectFarmer();
  const toast = useToast();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmed = note.trim();
    if (!trimmed) {
      setError("Tell the farmer what to fix before submitting.");
      return;
    }

    reject.mutate(
      { farmerId: farmer.id, note: trimmed },
      {
        onSuccess: () => {
          toast.success(
            "Application rejected",
            `${farmer.farm_name} was sent your reason.`,
          );
          onClose();
        },
        onError: (apiError) => {
          setError(resolveApiError(apiError).message);
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-ink/40 p-5 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-ink">
              Reject {farmer.farm_name}?
            </h3>
            <p className="mt-1 text-xs text-muted">
              {farmer.farmer_name} will see your reason and can re-apply once
              they've fixed it.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <label className="mt-5 block text-[11px] font-bold text-stone-600">
          Reason for rejection <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. The document is unreadable — please re-upload a clear photo."
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
        />

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-stone-600 transition hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={reject.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {reject.isPending ? "Rejecting…" : "Reject application"}
          </button>
        </div>
      </form>
    </div>
  );
}
