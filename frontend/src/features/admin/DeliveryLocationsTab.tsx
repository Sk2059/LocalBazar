import { MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useAdminDeliveryZones,
  useDeleteAdminDeliveryZone,
  useUpdateAdminDeliveryZone,
} from "./data/hooks";
import type { AdminDeliveryZoneApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import DeliveryZoneDialog from "./DeliveryZoneDialog";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Every place the marketplace delivers to. Like the categories tab this reads
 * the admin list, so a zone an admin paused still shows up here — buyers simply
 * can't select it at checkout anymore.
 */
export default function DeliveryLocationsTab() {
  const { data: zones, isLoading } = useAdminDeliveryZones();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const visible = useMemo(() => {
    if (!zones) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return zones;
    return zones.filter(
      (zone) =>
        zone.name.toLowerCase().includes(needle) ||
        zone.municipality.toLowerCase().includes(needle) ||
        zone.district.toLowerCase().includes(needle),
    );
  }, [zones, query]);

  return (
    <>
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
              Logistics
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-ink">
              Delivery locations
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-cream px-3 lg:w-64">
              <Search size={15} className="shrink-0 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search areas…"
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-stone-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800"
            >
              <Plus size={13} />
              Add location
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
            <MapPin size={26} className="mx-auto text-stone-400" />
            <p className="mt-3 text-sm font-bold text-ink">
              No delivery locations
            </p>
            <p className="mt-1 text-xs text-muted">
              {query
                ? "Try a different area."
                : "Add one so buyers here can check out."}
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-170 border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  <th className="py-3 pr-4">Location</th>
                  <th className="py-3 pr-4">Fee</th>
                  <th className="py-3 pr-4">ETA</th>
                  <th className="py-3 pr-4">Min. order</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200">
                {visible.map((zone) => (
                  <ZoneRow key={zone.id} zone={zone} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {creating && <DeliveryZoneDialog onClose={() => setCreating(false)} />}
    </>
  );
}

function ZoneRow({ zone }: { zone: AdminDeliveryZoneApi }) {
  const update = useUpdateAdminDeliveryZone();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleStatus() {
    update.mutate(
      { zoneId: zone.id, payload: { is_active: !zone.is_active } },
      {
        onSuccess: () =>
          toast.success(
            "Status updated",
            `${zone.name} is ${zone.is_active ? "paused" : "now delivering"}.`,
          ),
        onError: (error) =>
          toast.error("Could not update", resolveApiError(error).message),
      },
    );
  }

  return (
    <>
      <tr className="text-sm">
        <td className="py-3.5 pr-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-cream text-stone-400">
              <MapPin size={16} />
            </span>

            <div className="min-w-0">
              <p className="font-bold text-ink">{zone.name}</p>
              <p className="max-w-64 truncate text-[11px] text-muted">
                {[zone.municipality, zone.district, zone.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        </td>

        <td className="py-3.5 pr-4 text-[11px] font-bold text-ink">
          Rs. {Number(zone.delivery_fee).toFixed(2)}
        </td>

        <td className="py-3.5 pr-4 text-[11px] font-bold text-muted">
          {zone.estimated_delivery_days} day
          {zone.estimated_delivery_days === 1 ? "" : "s"}
        </td>

        <td className="py-3.5 pr-4 text-[11px] font-bold text-muted">
          {Number(zone.minimum_order_amount) > 0
            ? `Rs. ${Number(zone.minimum_order_amount).toFixed(2)}`
            : "None"}
        </td>

        <td className="py-3.5 pr-4">
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={update.isPending}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-60 ${
              zone.is_active
                ? "bg-forest-50 text-forest-700 hover:bg-forest-100"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {zone.is_active ? "Delivering" : "Paused"}
          </button>
        </td>

        <td className="py-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={update.isPending}
              aria-label={`Edit ${zone.name}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-stone-600 transition hover:bg-stone-100 disabled:opacity-60"
            >
              <Pencil size={12} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => setDeleting(true)}
              disabled={update.isPending}
              aria-label={`Delete ${zone.name}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </td>
      </tr>

      {editing && (
        <DeliveryZoneDialog zone={zone} onClose={() => setEditing(false)} />
      )}

      {deleting && (
        <DeleteZoneDialog zone={zone} onClose={() => setDeleting(false)} />
      )}
    </>
  );
}

function DeleteZoneDialog({
  zone,
  onClose,
}: {
  zone: AdminDeliveryZoneApi;
  onClose: () => void;
}) {
  const remove = useDeleteAdminDeliveryZone();
  const toast = useToast();

  function handleConfirm() {
    remove.mutate(zone.id, {
      onSuccess: () => {
        toast.success("Location removed", `${zone.name} is no longer a delivery area.`);
        onClose();
      },
      onError: (error) =>
        toast.error("Could not delete", resolveApiError(error).message),
    });
  }

  return (
    <ConfirmDialog
      title={`Delete ${zone.name}?`}
      message="Buyers in this area will no longer be able to check out. This can't be undone."
      isPending={remove.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}

