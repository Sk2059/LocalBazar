import {
  Leaf,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  useDeleteFarmerProduct,
  useFarmerProducts,
  useUpdateFarmerProduct,
} from "./data/hooks";
import type { FarmerProductApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import ProductDialog from "./ProductDialog";
import ConfirmDialog from "../admin/ConfirmDialog";

export default function ProductsTab() {
  const { data: productsPage, isLoading } = useFarmerProducts();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<FarmerProductApi | null>(null);

  const products = productsPage?.results ?? [];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.category_name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle),
    );
  }, [products, query]);

  return (
    <>
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
              Catalogue
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-ink">
              Your products
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Everything you sell — active, draft and out-of-stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-cream px-3 lg:w-64">
              <Search size={15} className="shrink-0 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-stone-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800"
            >
              <Plus size={13} />
              Add product
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl bg-stone-100"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-cream px-6 py-10 text-center">
            <Leaf size={26} className="mx-auto text-stone-400" />
            <p className="mt-3 text-sm font-bold text-ink">No products yet</p>
            <p className="mt-1 text-xs text-muted">
              {query
                ? "Try a different name or category."
                : "Add your first item to start selling."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditing(product)}
              />
            ))}
          </div>
        )}
      </section>

      {creating && <ProductDialog onClose={() => setCreating(false)} />}
      {editing && (
        <ProductDialog
          product={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ProductCard({
  product,
  onEdit,
}: {
  product: FarmerProductApi;
  onEdit: () => void;
}) {
  const update = useUpdateFarmerProduct();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  function handleToggleActive() {
    const payload = new FormData();
    payload.append("name", product.name);
    payload.append("description", product.description);
    payload.append("category", String(product.category));
    payload.append("price", product.price);
    payload.append("bulk_price", product.bulk_price);
    payload.append(
      "bulk_minimum_quantity",
      String(product.bulk_minimum_quantity),
    );
    payload.append("unit", product.unit);
    payload.append("stock", String(product.stock));
    payload.append("farming_method", product.farming_method);
    payload.append("is_seasonal", String(product.is_seasonal));
    payload.append("is_active", String(!product.is_active));

    update.mutate(
      { productId: product.id, payload },
      {
        onSuccess: () =>
          toast.success(
            "Visibility updated",
            `${product.name} is now ${product.is_active ? "hidden" : "visible"}.`,
          ),
        onError: (error) =>
          toast.error("Could not update", resolveApiError(error).message),
      },
    );
  }

  return (
    <>
      <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md">
        <div className="relative aspect-4/3 w-full bg-stone-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center text-stone-300">
              <Leaf size={30} />
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-1.5">
            <Badge variant={product.is_active ? "active" : "draft"}>
              {product.is_active ? "Visible" : "Hidden"}
            </Badge>
            {product.is_seasonal && <Badge variant="seasonal">Seasonal</Badge>}
          </div>
          {product.stock === 0 && (
            <div className="absolute right-2 top-2">
              <Badge variant="oos">Out of stock</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                {product.category_name}
              </p>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-bold text-ink">
                {product.name}
              </h3>
            </div>
            <p className="shrink-0 text-sm font-extrabold text-harvest-600">
              Rs. {Number(product.price).toLocaleString()}
              <span className="ml-0.5 text-[10px] font-medium text-muted">
                /{product.unit}
              </span>
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
            <span className="capitalize">{product.farming_method}</span>
            <span>•</span>
            <span>
              Stock:{" "}
              <span
                className={
                  product.stock === 0
                    ? "font-bold text-red-500"
                    : product.stock < 5
                      ? "font-bold text-amber-600"
                      : "font-bold text-ink"
                }
              >
                {product.stock}
              </span>
            </span>
            {Number(product.bulk_price) > 0 && (
              <>
                <span>•</span>
                <span>
                  Bulk Rs. {Number(product.bulk_price).toLocaleString()} @ {product.bulk_minimum_quantity}+
                </span>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={update.isPending}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-60 ${
                product.is_active
                  ? "border-stone-200 text-stone-600 hover:bg-stone-50"
                  : "border-forest-200 bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              {product.is_active ? "Hide" : "List"}
            </button>
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${product.name}`}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-stone-600 transition hover:bg-stone-50"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => setDeleting(true)}
              aria-label={`Delete ${product.name}`}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </article>

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
  product: FarmerProductApi;
  onClose: () => void;
}) {
  const remove = useDeleteFarmerProduct();
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
      message="This removes the product from your catalogue and the marketplace. The deletion can't be undone."
      isPending={remove.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "active" | "draft" | "seasonal" | "oos";
}) {
  const styles: Record<typeof variant, string> = {
    active: "bg-forest-50 text-forest-700",
    draft: "bg-stone-100 text-stone-500",
    seasonal: "bg-amber-50 text-amber-700",
    oos: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
