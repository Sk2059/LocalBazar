import { Upload, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  useCreateAdminCategory,
  useUpdateAdminCategory,
} from "./data/hooks";
import type { AdminCategoryApi } from "./data/api";
import { fieldMessage, resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

/**
 * The create / edit category form. One component covers both because the only
 * difference is whether a category is passed in — and because editing rides the
 * same multipart endpoint as creating (the image is a file upload).
 *
 * The slug is derived server-side from the name, so it never appears here.
 */
export default function CategoryDialog({
  category,
  onClose,
}: {
  category?: AdminCategoryApi;
  onClose: () => void;
}) {
  const create = useCreateAdminCategory();
  const update = useUpdateAdminCategory();
  const toast = useToast();

  const isEditing = Boolean(category);
  const pending = create.isPending || update.isPending;

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("A category needs a name.");
      return;
    }

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("image");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    const payload = new FormData();
    payload.append("name", trimmed);
    payload.append("description", description.trim());
    payload.append("is_active", String(isActive));

    // Only send an image when one was actually picked, so an edit without a new
    // upload leaves the existing picture alone.
    if (file) payload.append("image", file);

    if (isEditing && category) {
      update.mutate(
        { categoryId: category.id, payload },
        {
          onSuccess: () => {
            toast.success("Category saved", `${trimmed} was updated.`);
            onClose();
          },
          onError: (apiError) => {
            const nameError = fieldMessage(apiError, "name");
            setError(nameError ?? resolveApiError(apiError).message);
          },
        },
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        toast.success("Category created", `${trimmed} is now in the catalogue.`);
        onClose();
      },
      onError: (apiError) => {
        const nameError = fieldMessage(apiError, "name");
        setError(nameError ?? resolveApiError(apiError).message);
      },
    });
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-ink/40 p-5 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-ink">
              {isEditing ? "Edit category" : "New category"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {isEditing
                ? "Changes apply to every product filed under it."
                : "Buyers will see it in the marketplace filters right away."}
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
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Leafy Greens"
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
        />

        <label className="mt-4 block text-[11px] font-bold text-stone-600">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What belongs in this category?"
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
        />

        <label className="mt-4 mb-1.5 block text-[11px] font-bold text-stone-600">
          Image
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-cream px-4 py-3">
          <Upload size={16} className="shrink-0 text-stone-400" />
          <input
            type="file"
            name="image"
            accept="image/*"
            className="flex-1 text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-forest-700"
          />
        </div>
        {category?.image && (
          <p className="mt-1.5 text-[11px] text-muted">
            An image is already set — attach a new one to replace it.
          </p>
        )}

        <label className="mt-4 flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 rounded border-stone-300 text-forest-700 focus:ring-forest-600/20"
          />
          <span className="text-[11px] font-bold text-stone-600">
            Visible to buyers
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
                : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}
