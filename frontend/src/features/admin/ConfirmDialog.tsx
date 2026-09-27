import { AlertTriangle, X } from "lucide-react";

/**
 * A small "are you sure?" modal. The console's destructive actions (deleting a
 * category or a delivery location) are one click and irreversible, so they get
 * a second confirmation rather than a bare button.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  isPending,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-ink/40 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={17} />
            </span>

            <div>
              <h3 className="text-base font-extrabold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted">{message}</p>
            </div>
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

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-stone-600 transition hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
