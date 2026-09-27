import { Upload, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  useCreateFarmerProduct,
  useFarmerCategories,
  useUpdateFarmerProduct,
} from "./data/hooks";
import type { FarmerProductApi, FarmingMethod } from "./data/api";
import { fieldMessage, resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

const FARMING_METHODS: { value: FarmingMethod; label: string }[] = [
  { value: "organic", label: "Organic" },
  { value: "natural", label: "Natural" },
  { value: "conventional", label: "Conventional" },
];

/**
 * Create / edit product dialog. A single component covers both flows — the
 * only difference is whether a product is passed in. Uses multipart because
 * the image is a file upload.
 */
export default function ProductDialog({
  product,
  onClose,
}: {
  product?: FarmerProductApi;
  onClose: () => void;
}) {
  const { data: categories, isLoading: categoriesLoading } =
    useFarmerCategories();
  const create = useCreateFarmerProduct();
  const update = useUpdateFarmerProduct();
  const toast = useToast();

  const isEditing = Boolean(product);
  const pending = create.isPending || update.isPending;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<number>(product?.category ?? 0);
  const [price, setPrice] = useState<string>(product?.price ?? "");
  const [bulkPrice, setBulkPrice] = useState<string>(product?.bulk_price ?? "");
  const [bulkMinQty, setBulkMinQty] = useState<string>(
    String(product?.bulk_minimum_quantity ?? 10),
  );
  const [unit, setUnit] = useState(product?.unit ?? "kg");
  const [stock, setStock] = useState<string>(String(product?.stock ?? 0));
  const [farmingMethod, setFarmingMethod] = useState<FarmingMethod>(
    product?.farming_method ?? "natural",
  );
  const [isSeasonal, setIsSeasonal] = useState(product?.is_seasonal ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a short description for buyers.");
      return;
    }
    if (!category) {
      setError("Pick a category.");
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Price must be greater than zero.");
      return;
    }
    const stockNum = Number(stock);
    if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }
    const bulkPriceNum = Number(bulkPrice);
    if (bulkPrice && (!Number.isFinite(bulkPriceNum) || bulkPriceNum < 0)) {
      setError("Bulk price must be zero or more.");
      return;
    }
    if (bulkPriceNum > priceNum) {
      setError("Bulk price cannot be higher than the regular price.");
      return;
    }
    const bulkMinQtyNum = Number(bulkMinQty);
    if (
      bulkMinQty &&
      (!Number.isFinite(bulkMinQtyNum) ||
        bulkMinQtyNum < 1 ||
        !Number.isInteger(bulkMinQtyNum))
    ) {
      setError("Bulk minimum quantity must be at least 1.");
      return;
    }
    if (!unit.trim()) {
      setError("Unit is required (e.g. kg, piece, bunch).");
      return;
    }

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("image");
    const file =
      fileInput instanceof HTMLInputElement
        ? fileInput.files?.[0]
        : undefined;

    const payload = new FormData();
    payload.append("name", name.trim());
    payload.append("description", description.trim());
    payload.append("category", String(category));
    payload.append("price", String(priceNum));
    payload.append("bulk_price", String(bulkPriceNum || 0));
    payload.append("bulk_minimum_quantity", String(bulkMinQtyNum || 1));
    payload.append("unit", unit.trim());
    payload.append("stock", String(stockNum));
    payload.append("farming_method", farmingMethod);
    payload.append("is_seasonal", String(isSeasonal));
    payload.append("is_active", String(isActive));

    if (file) payload.append("image", file);

    if (isEditing && product) {
      update.mutate(
        { productId: product.id, payload },
        {
          onSuccess: () => {
            toast.success("Product updated", `${name.trim()} saved.`);
            onClose();
          },
          onError: (apiError) => {
            const fieldErr =
              fieldMessage(apiError, "name") ??
              fieldMessage(apiError, "price") ??
              fieldMessage(apiError, "bulk_price") ??
              fieldMessage(apiError, "category");
            setError(fieldErr ?? resolveApiError(apiError).message);
          },
        },
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        toast.success("Product added", `${name.trim()} is in your catalogue.`);
        onClose();
      },
      onError: (apiError) => {
        const fieldErr =
          fieldMessage(apiError, "name") ??
          fieldMessage(apiError, "price") ??
          fieldMessage(apiError, "bulk_price") ??
          fieldMessage(apiError, "category");
        setError(fieldErr ?? resolveApiError(apiError).message);
      },
    });
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-ink/40 p-5 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
        noValidate
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-ink">
              {isEditing ? "Edit product" : "New product"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {isEditing
                ? "Changes take effect in the marketplace immediately."
                : "Add it to your catalogue so buyers can find it."}
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel label="Product name" required />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Red Tomatoes"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Category" required />
            <select
              value={category}
              onChange={(e) => setCategory(Number(e.target.value))}
              disabled={categoriesLoading}
              className={inputCls}
            >
              <option value={0}>Select a category…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel label="Farming method" />
            <select
              value={farmingMethod}
              onChange={(e) => setFarmingMethod(e.target.value as FarmingMethod)}
              className={inputCls}
            >
              {FARMING_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel label="Price (Rs.)" required />
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 120"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Unit" required />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. kg, piece, bunch"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Stock" required />
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Available units"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Bulk price (Rs.)" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="0 if none"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel label="Bulk minimum quantity" />
            <input
              type="number"
              min="1"
              step="1"
              value={bulkMinQty}
              onChange={(e) => setBulkMinQty(e.target.value)}
              placeholder="e.g. 10 — units needed to trigger bulk price"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel label="Description" required />
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Variety, harvest week, how to store, anything a buyer should know…"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel label="Product image" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {product?.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-20 w-24 shrink-0 rounded-2xl border border-stone-200 object-cover"
                />
              ) : null}
              <div className="flex-1 rounded-xl border border-dashed border-stone-300 bg-cream px-4 py-3">
                <div className="flex items-center gap-3">
                  <Upload size={16} className="shrink-0 text-stone-400" />
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="flex-1 text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-forest-700"
                  />
                </div>
              </div>
            </div>
            {product?.image && (
              <p className="mt-1.5 text-[11px] text-muted">
                An image is already set — attach a new one to replace it.
              </p>
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col gap-2.5 pt-1">
            <CheckField
              checked={isSeasonal}
              onChange={setIsSeasonal}
              label="Seasonal produce"
              hint="Shown in the seasonal filters on the marketplace."
            />
            <CheckField
              checked={isActive}
              onChange={setIsActive}
              label="Visible to buyers"
              hint="Turn off to hide without deleting (useful for out-of-season items)."
            />
          </div>
        </div>

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
                : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10";

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[11px] font-bold text-stone-600">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function CheckField({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-cream px-3.5 py-3 transition hover:bg-stone-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-stone-300 text-forest-700 focus:ring-forest-600/20"
      />
      <div>
        <p className="text-[11px] font-bold text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
      </div>
    </label>
  );
}
