import { BadgeCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdminFarmers } from "./data/hooks";
import type { VerificationStatus } from "./data/api";
import FarmerRow from "./FarmerRow";

type Tab = VerificationStatus | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All farms" },
];

/**
 * The verification queue and full farmer directory.
 *
 * The status chips feed the list's `verification_status` filterset, so each tab
 * is its own cache entry; the queue size in the overview comes from
 * `admin-stats` and is invalidated alongside these mutations.
 */
export default function VerificationQueue() {
  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const { data: farmers, isLoading } = useAdminFarmers(
    tab === "all" ? undefined : tab,
  );

  // Typing stays snappy: the whole tab is already loaded, so filter client-side.
  const visible = useMemo(() => {
    if (!farmers) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return farmers;
    return farmers.filter(
      (farmer) =>
        farmer.farm_name.toLowerCase().includes(needle) ||
        farmer.farmer_name.toLowerCase().includes(needle) ||
        farmer.farmer_email.toLowerCase().includes(needle),
    );
  }, [farmers, query]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
            Farmer verification
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-ink">
            Review applications
          </h2>
        </div>

        <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-cream px-3 lg:w-72">
          <Search size={15} className="shrink-0 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search farms or farmers…"
            className="min-w-0 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider transition ${
              tab === item.value
                ? "bg-forest-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-stone-100"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
          <BadgeCheck size={26} className="mx-auto text-stone-400" />
          <p className="mt-3 text-sm font-bold text-ink">
            {query ? "No farms match that search" : `Nothing ${tab} right now`}
          </p>
          <p className="mt-1 text-xs text-muted">
            {query
              ? "Try a different farm name or email."
              : "New applications land here and bump the queue in the overview."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((farmer) => (
            <FarmerRow key={farmer.id} farmer={farmer} />
          ))}
        </div>
      )}
    </section>
  );
}
