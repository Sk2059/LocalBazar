import { Check, FileText, XCircle } from "lucide-react";
import { useState } from "react";

import { useApproveFarmer } from "./data/hooks";
import type { AdminFarmerApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import RejectDialog from "./RejectDialog";

/** One farm in the admin review queue. */
export default function FarmerRow({ farmer }: { farmer: AdminFarmerApi }) {
  const approve = useApproveFarmer();
  const toast = useToast();
  const [rejecting, setRejecting] = useState(false);

  const tone =
    farmer.verification_status === "verified"
      ? "bg-forest-50 text-forest-700"
      : farmer.verification_status === "rejected"
        ? "bg-red-50 text-red-600"
        : "bg-amber-50 text-amber-700";

  function handleApprove() {
    approve.mutate(farmer.id, {
      onSuccess: () =>
        toast.success("Farm verified", `${farmer.farm_name} can now sell.`),
      onError: (error) =>
        toast.error("Could not approve", resolveApiError(error).message),
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-stone-200 bg-cream/60 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-ink">
                {farmer.farm_name}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${tone}`}
              >
                {farmer.verification_status}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-muted">
              {farmer.farmer_name} · {farmer.farmer_email}
              {farmer.farmer_phone ? ` · ${farmer.farmer_phone}` : ""}
            </p>

            <p className="mt-2 text-xs text-ink">
              {[farmer.address, farmer.municipality, farmer.district]
                .filter(Boolean)
                .join(", ")}
            </p>

            {farmer.description && (
              <p className="mt-1.5 line-clamp-2 text-[11px] text-muted">
                {farmer.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted">
              <span>{farmer.product_count} live products</span>
              <span>·</span>
              <span>
                Applied{" "}
                {new Date(farmer.created_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </span>

              {farmer.verification_document && (
                <a
                  href={farmer.verification_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-forest-700 hover:underline"
                >
                  <FileText size={12} />
                  View document
                </a>
              )}
            </div>

            {farmer.verification_status === "rejected" &&
              farmer.verification_note && (
                <p className="mt-3 rounded-xl bg-red-50/70 px-3 py-2 text-[11px] text-red-700">
                  Rejected: {farmer.verification_note}
                </p>
              )}
          </div>

          {farmer.verification_status !== "verified" && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={approve.isPending}
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800 disabled:opacity-60"
              >
                <Check size={13} />
                Approve
              </button>

              <button
                type="button"
                disabled={approve.isPending}
                onClick={() => setRejecting(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle size={13} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {rejecting && (
        <RejectDialog farmer={farmer} onClose={() => setRejecting(false)} />
      )}
    </>
  );
}
