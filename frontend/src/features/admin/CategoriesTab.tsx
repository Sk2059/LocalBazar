import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useAdminCategories,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "./data/hooks";
import type { AdminCategoryApi } from "./data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import CategoryDialog from "./CategoryDialog";
import ConfirmDialog from "./ConfirmDialog";

/**
 * The category catalogue, archived rows included. This reads the admin list
 * rather than the public one on purpose: hiding a category is a console action,
 * so the tab has to be able to see what it switched off.
 */
export default function CategoriesTab() {
  const { data: categories, isLoading } = useAdminCategories();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryApi | null>(null);

  const visible = useMemo(() => {
    if (!categories) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(needle) ||
        category.slug.toLowerCase().includes(needle),
    );
  }, [categories, query]);

  return (
    <>
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
              Catalogue
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-ink">
              Product categories
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-cream px-3 lg:w-64">
              <Search size={15} className="shrink-0 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories…"
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-stone-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-forest-800"
            >
              <Plus size={13} />
              New category
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
            <Tags size={26} className="mx-auto text-stone-400" />
            <p className="mt-3 text-sm font-bold text-ink">No categories yet</p>
            <p className="mt-1 text-xs text-muted">
              {query
                ? "Try a different name."
                : "Add one so farmers can file their products under it."}
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-150 border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-200 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Products</th>
                  <th className="py-3 pr-4">Visibility</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200">
                {visible.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {creating && <CategoryDialog onClose={() => setCreating(false)} />}

      {editing && (
        <CategoryDialog
          category={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}


function CategoryRow({ category }: { category: AdminCategoryApi }) {
  const update = useUpdateAdminCategory();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleActive() {
    // `name` is required by the serializer, and the image stays put because we
    // don't send a new file — the toggle is the only thing changing.
    const payload = new FormData();
    payload.append("name", category.name);
    payload.append("description", category.description);
    payload.append("is_active", String(!category.is_active));

    update.mutate(
      { categoryId: category.id, payload },
      {
        onSuccess: () =>
          toast.success(
            "Visibility updated",
            `${category.name} is now ${category.is_active ? "hidden from" : "visible to"} buyers.`,
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
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="size-10 shrink-0 rounded-xl border border-stone-200 object-cover"
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-cream text-stone-400">
                <Tags size={16} />
              </span>
            )}

            <div className="min-w-0">
              <p className="font-bold text-ink">{category.name}</p>
              <p className="max-w-48 truncate text-[11px] text-muted">
                {category.slug}
              </p>
            </div>
          </div>
        </td>

        <td className="py-3.5 pr-4 text-[11px] font-bold text-muted">
          {category.product_count}
        </td>

        <td className="py-3.5 pr-4">
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={update.isPending}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider transition disabled:opacity-60 ${
              category.is_active
                ? "bg-forest-50 text-forest-700 hover:bg-forest-100"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {category.is_active ? "Visible" : "Hidden"}
          </button>
        </td>

        <td className="py-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={update.isPending}
              aria-label={`Edit ${category.name}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-stone-600 transition hover:bg-stone-100 disabled:opacity-60"
            >
              <Pencil size={12} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => setDeleting(true)}
              disabled={update.isPending}
              aria-label={`Delete ${category.name}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </td>
      </tr>

      {editing && (
        <CategoryDialog
          category={category}
          onClose={() => setEditing(false)}
        />
      )}

      {deleting && (
        <DeleteCategoryDialog
          category={category}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  );
}

function DeleteCategoryDialog({
  category,
  onClose,
}: {
  category: AdminCategoryApi;
  onClose: () => void;
}) {
  const remove = useDeleteAdminCategory();
  const toast = useToast();

  function handleConfirm() {
    remove.mutate(category.id, {
      onSuccess: () => {
        toast.success("Category deleted", `${category.name} is gone.`);
        onClose();
      },
      onError: (error) =>
        toast.error("Could not delete", resolveApiError(error).message),
    });
  }

  // The server guards categories that still hold products (PROTECT), so the
  // warning is only honest when there's nothing filed under it.
  const protectedHint =
    category.product_count > 0
      ? ` ${category.product_count} product${category.product_count === 1 ? " is" : "s are"} still filed under it and must be moved or removed first.`
      : " This can't be undone.";

  return (
    <ConfirmDialog
      title={`Delete ${category.name}?`}
      message={`This removes the category from the marketplace.${protectedHint}`}
      isPending={remove.isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
