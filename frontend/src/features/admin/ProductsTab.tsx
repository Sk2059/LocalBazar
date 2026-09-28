import { Leaf, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useAdminProducts,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
} from "./data/hooks";
import type { AdminProductApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import ConfirmDialog from "./ConfirmDialog";

/**
 * The full product catalogue, drafts and out-of-stock rows included.
 *
 * This is the only place featuring is exposed. `is_featured` drives the
 * homepage's "Fresh today" rail, and it's a curation decision rather than
 * something a farmer sets for their own product — so the flag lives behind an
 * admin action instead of the product form.
 */
export default function ProductsTab() {
  const { data: products, isLoading } = useAdminProducts();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    if (!products) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(needle) ||
        product.farm_name.toLowerCase().includes(needle) ||
        product.farmer_name.toLowerCase().includes(needle) ||
        product.category_name.toLowerCase().includes(needle),
    );
  }, [products, query]);

  const featuredCount = products?.filter((p) => p.is_featured).length ?? 0;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
            Catalogue
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-ink">
            Marketplace products
          </h2>
          <p className="mt-1 text-xs text-muted">
            {featuredCount} of {products?.length ?? 0} products featured on the
            homepage.
          </p>
        </div>

        <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-cream px-3 lg:w-64">
          <Search size={15} className="shrink-0 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products or farms…"
            className="min-w-0 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-2xl bg-stone-100"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
          <Leaf size={26} className="mx-auto text-stone-400" />
          <p className="mt-3 text-sm font-bold text-ink">No products found</p>
          <p className="mt-1 text-xs text-muted">
            {query ? "Try a different name or farm." : "Nothing listed yet."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="pb-3 pr-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Product
                </th>
                <th className="pb-3 pr-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Farm
                </th>
                <th className="pb-3 pr-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Price
                </th>
                <th className="pb-3 pr-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Stock
                </th>
                <th className="pb-3 pr-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Featured
                </th>
                <th className="pb-3 pr-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Visibility
                </th>
                <th className="pb-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {visible.map((product) => (
                <AdminProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AdminProductRow({ product }: { product: AdminProductApi }) {
  const update = useUpdateAdminProduct();
  const remove = useDeleteAdminProduct();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const busy = update.isPending || remove.isPending;

  function handleToggleFeatured() {
    const nextFeatured = !product.is_featured;

    update.mutate(
      { productId: product.id, payload: { is_featured: nextFeatured } },
      {
        onSuccess: () =>
          toast.success(
            nextFeatured ? "Product featured" : "Product unfeatured",
            `${product.name} is ${nextFeatured ? "now on the homepage" : "off the homepage"}.`,
          ),
        onError: (error) =>
          toast.error("Could not update", resolveApiError(error).message),
      },
    );
  }

  function handleToggleActive() {
    const nextActive = !product.is_active;

    update.mutate(
      { productId: product.id, payload: { is_active: nextActive } },
      {
        onSuccess: () =>
          toast.success(
            "Visibility updated",
            `${product.name} is now ${nextActive ? "visible" : "hidden"}.`,
          ),
        onError: (error) =>
          toast.error("Could not update", resolveApiError(error).message),
      },
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <>
      <tr
        className={`border-b border-stone-100 transition ${
          product.is_active ? "bg-white" : "bg-stone-50/60"
        }`}
      >
        <td className="py-3.5 pr-4">
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-stone-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-stone-300">
                  <Leaf size={16} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-ink">
                {product.name}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-muted">
                {product.category_name}
              </p>
            </div>
          </div>
        </td>

        <td className="py-3.5 pr-4">
          <p className="truncate text-[11px] font-semibold text-ink">
            {product.farm_name}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">{product.farmer_name}</p>
        </td>

        <td className="py-3.5 pr-4 text-[11px] font-bold text-ink">
          Rs. {Number(product.price).toLocaleString()}
          <span className="ml-0.5 text-[10px] font-medium text-muted">
            /{product.unit}
          </span>
        </td>

        <td className="py-3.5 pr-4">
          <span
            className={`text-[11px] font-bold ${
              outOfStock
                ? "text-red-500"
                : product.stock < 5
                  ? "text-amber-600"
                  : "text-ink"
            }`}
          >
            {outOfStock ? "Out of stock" : product.stock}
          </span>
        </td>

        <td className="py-3.5 pr-4">
          <button
            type="button"
            onClick={handleToggleFeatured}
            disabled={busy}
            aria-pressed={product.is_featured}
            aria-label={
              product.is_featured
                ? `Unfeature ${product.name}`
                : `Feature ${product.name}`
            }
            title={
              product.is_featured
                ? "Featured on the homepage"
                : "Feature on the homepage"
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-60 ${
              product.is_featured
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            <Star
              size={12}
              fill={product.is_featured ? "currentColor" : "none"}
            />
            {product.is_featured ? "Featured" : "Feature"}
          </button>
        </td>

        <td className="py-3.5 pr-4">
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-60 ${
              product.is_active
                ? "bg-forest-50 text-forest-700 hover:bg-forest-100"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {product.is_active ? "Visible" : "Hidden"}
          </button>
        </td>

        <td className="py-3.5">
          <button
            type="button"
            onClick={() => setDeleting(true)}
            disabled={busy}
            aria-label={`Delete ${product.name}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </td>
      </tr>

      {deleting && (
        <DeleteProductDialog
          product={product}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  );
}

function DeleteProductDialog({
  product,
  onClose,
}: {
  product: AdminProductApi;
  onClose: () => void;
}) {
  const remove = useDeleteAdminProduct();
  const toast = useToast();

  function handleConfirm() {
    remove.mutate(product.id, {
      onSuccess: () => {
        toast.success("Product deleted", `${product.name} is gone.`);
        onClose();
      },
      onError: (error) =>
        toast.error("Could not delete", resolveApiError(error).message),
    });
  }

  return (
    <ConfirmDialog
      title={`Delete ${product.name}?`}
      message="This removes the product from the marketplace and from the homepage's featured rail. This can't be undone."
      isPending={remove.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}

