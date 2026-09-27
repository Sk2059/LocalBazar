import {
  BadgeCheck,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import type {
  FarmerProfileApi,
  VerificationStatus,
} from "./data/api";
import VerificationForm from "./VerificationForm";

const STATUS_META: Record<
  VerificationStatus,
  { label: string; tone: string; icon: typeof BadgeCheck }
> = {
  pending: {
    label: "Under review",
    tone: "bg-amber-50 text-amber-700",
    icon: Clock,
  },
  verified: {
    label: "Verified",
    tone: "bg-forest-50 text-forest-700",
    icon: BadgeCheck,
  },
  rejected: {
    label: "Rejected",
    tone: "bg-red-50 text-red-600",
    icon: XCircle,
  },
};

/**
 * The verification panel. A farmer who is still `pending` or `rejected` sees the
 * application form (plus the admin's note, if there is one); a verified farmer
 * sees a confirmation card instead.
 */
export default function VerificationCard({
  profile,
  loading,
}: {
  profile?: FarmerProfileApi;
  loading: boolean;
}) {
  const status = profile?.verification_status ?? "pending";
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  if (loading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded-full bg-stone-100" />
        <div className="mt-4 h-4 w-72 animate-pulse rounded-full bg-stone-100" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="h-11 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-11 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-11 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-11 animate-pulse rounded-xl bg-stone-100" />
        </div>
      </section>
    );
  }

  if (status === "verified") {
    return (
      <section className="rounded-3xl border border-forest-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-forest-50 text-forest-700">
              <BadgeCheck size={22} />
            </span>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${meta.tone}`}
              >
                Verified farm
              </span>

              <h2 className="mt-2 text-lg font-extrabold text-ink">
                {profile?.farm_name || "Your farm"}
              </h2>

              <p className="mt-1 text-xs text-muted">
                You can list and sell produce. New listings appear in the
                marketplace straight away.
              </p>

              {profile?.verified_at && (
                <p className="mt-2 text-[11px] text-muted">
                  Verified on{" "}
                  {new Date(profile.verified_at).toLocaleDateString(undefined, {
                    dateStyle: "long",
                  })}
                </p>
              )}
            </div>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-forest-800 sm:self-auto"
          >
            Browse marketplace
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${meta.tone}`}
        >
          <StatusIcon size={22} />
        </span>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${meta.tone}`}
          >
            {meta.label}
          </span>

          <h2 className="mt-2 text-lg font-extrabold text-ink">
            {status === "rejected"
              ? "Fix the issue and re-apply"
              : "Complete your verification"}
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-muted">
            {status === "pending"
              ? "Your application is with our admin team. You can list produce once it's approved."
              : "Verified farms can list and sell produce. Fill in your farm details and attach a document to apply."}
          </p>

          {status === "rejected" && profile?.verification_note && (
            <div className="mt-3 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                Reason from the admin team
              </p>
              <p className="mt-1 text-xs text-red-700">
                {profile.verification_note}
              </p>
            </div>
          )}
        </div>
      </div>

      <VerificationForm profile={profile} />
    </section>
  );
}
