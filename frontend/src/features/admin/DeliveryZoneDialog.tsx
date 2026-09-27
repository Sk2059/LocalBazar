import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  useCreateAdminDeliveryZone,
  useUpdateAdminDeliveryZone,
} from "./data/hooks";
import type { AdminDeliveryZoneApi } from "./data/api";
import { fieldMessage, resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

/**
 * The create / edit delivery-location form. One component covers both because
 * the shape is identical — editing just pre-fills and PATCHes instead of POSTs.
 *
 * Fees and minimums are decimals on the server, so they're sent as numbers;
 * the checkout page never recomputes from these, it only displays them.
 */
export default function DeliveryZoneDialog({
  zone,
  onClose,
}: {
  zone?: AdminDeliveryZoneApi;
  onClose: () => void;
}) {
  const create = useCreateAdminDeliveryZone();
  const update = useUpdateAdminDeliveryZone();
  const toast = useToast();

  const isEditing = Boolean(zone);
  const pending = create.isPending || update.isPending;

  const [form, setForm] = useState({
    name: zone?.name ?? "",
    province: zone?.province ?? "Koshi Province",
    district: zone?.district ?? "",
    municipality: zone?.municipality ?? "",
    delivery_fee: zone ? zone.delivery_fee : "0",
    estimated_delivery_days: zone ? String(zone.estimated_delivery_days) : "2",
    minimum_order_amount: zone ? zone.minimum_order_amount : "0",
    is_active: zone?.is_active ?? true,
  });
  const [error, setError] = useState("");

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const district = form.district.trim();
    const municipality = form.municipality.trim();

    if (!name || !district || !municipality) {
      setError("Name, district and municipality are all required.");
      return;
    }

    const fee = Number(form.delivery_fee);
    const days = Number(form.estimated_delivery_days);
    const minimum = Number(form.minimum_order_amount);

    if (Number.isNaN(fee) || fee < 0) {
      setError("Delivery fee must be zero or more.");
      return;
    }

    if (Number.isNaN(days) || days < 1) {
      setError("Estimated delivery must be at least 1 day.");
      return;
    }

    if (Number.isNaN(minimum) || minimum < 0) {
      setError("Minimum order must be zero or more.");
      return;
    }

    const payload = {
      name,
      province: form.province.trim() || "Koshi Province",
      district,
      municipality,
      delivery_fee: fee,
      estimated_delivery_days: days,
      minimum_order_amount: minimum,
      is_active: form.is_active,
    };

    const onError = (apiError: unknown) => {
      const nameError = fieldMessage(apiError, "name");
      setError(nameError ?? resolveApiError(apiError).message);
    };

    if (isEditing && zone) {
      update.mutate(
        { zoneId: zone.id, payload },
        {
          onSuccess: () => {
            toast.success("Location saved", `${name} was updated.`);
            onClose();
          },
          onError,
        },
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        toast.success("Location added", `${name} is now a delivery area.`);
        onClose();
      },
      onError,
    });
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-ink/40 p-5 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-ink">
              {isEditing ? "Edit delivery location" : "New delivery location"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Buyers in this area are quoted this fee and ETA at checkout.
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
          Location name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="e.g. Biratnagar Metro"
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Province"
            value={form.province}
            onChange={(value) => updateField("province", value)}
          />
          <Field
            label="District *"
            value={form.district}
            onChange={(value) => updateField("district", value)}
          />
          <Field
            label="Municipality *"
            value={form.municipality}
            onChange={(value) => updateField("municipality", value)}
          />
        </div>


        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Delivery fee (Rs.)"
            type="number"
            min="0"
            step="0.01"
            value={form.delivery_fee}
            onChange={(value) => updateField("delivery_fee", value)}
          />
          <Field
            label="Est. days"
            type="number"
            min="1"
            step="1"
            value={form.estimated_delivery_days}
            onChange={(value) => updateField("estimated_delivery_days", value)}
          />
          <Field
            label="Min. order (Rs.)"
            type="number"
            min="0"
            step="0.01"
            value={form.minimum_order_amount}
            onChange={(value) => updateField("minimum_order_amount", value)}
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => updateField("is_active", event.target.checked)}
            className="size-4 rounded border-stone-300 text-forest-700 focus:ring-forest-600/20"
          />
          <span className="text-[11px] font-bold text-stone-600">
            Delivering here
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-stone-600 transition hover:bg-stone-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-5 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800 disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add location"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
        {label}
      </label>
      <input
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
      />
    </div>
  );
}
