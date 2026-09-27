import { Upload } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useSubmitVerification } from "./data/hooks";
import type { FarmerProfileApi } from "./data/api";
import { fieldMessage, resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

/**
 * The application form itself. Kept separate from `VerificationCard` because it
 * owns its own submission state; the card only decides *whether* to show it.
 *
 * The same form handles first applications and re-applications — uploading
 * fresh proof is what resets a rejection to `pending` on the server.
 */
export default function VerificationForm({
  profile,
}: {
  profile?: FarmerProfileApi;
}) {
  const submit = useSubmitVerification();
  const toast = useToast();
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const payload = new FormData(event.currentTarget);
    const document_ = payload.get("verification_document");

    // The server makes a document mandatory on this endpoint too; failing here
    // is just faster and keeps the button's disabled state meaningful.
    if (!(document_ instanceof File) || document_.size === 0) {
      setFormError("Please attach a document to support your application.");
      return;
    }

    submit.mutate(payload, {
      onSuccess: (updated) => {
        setFormError("");
        if (updated.verification_status === "pending") {
          toast.success(
            "Application submitted",
            "An admin will review your farm and get back to you.",
          );
        }
      },
      onError: (error) => {
        const documentError = fieldMessage(error, "verification_document");
        setFormError(documentError ?? resolveApiError(error).message);
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <FormField
        label="Farm name"
        name="farm_name"
        defaultValue={profile?.farm_name ?? ""}
        required
      />

      <FormField
        label="Farm address"
        name="address"
        defaultValue={profile?.address ?? ""}
        required
      />

      <FormField
        label="Municipality"
        name="municipality"
        defaultValue={profile?.municipality ?? ""}
      />

      <FormField
        label="District"
        name="district"
        defaultValue={profile?.district ?? ""}
      />

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
          About your farm
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={profile?.description ?? ""}
          placeholder="What you grow, your farming method, anything buyers should know…"
          className="w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
          Verification document <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-cream px-4 py-3">
          <Upload size={16} className="shrink-0 text-stone-400" />
          <input
            type="file"
            name="verification_document"
            accept="image/*,.pdf"
            className="flex-1 text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-forest-700"
          />
        </div>
        {profile?.verification_document && (
          <p className="mt-1.5 text-[11px] text-muted">
            A document is already on file — attach a new one to replace it.
          </p>
        )}
      </div>

      {formError && (
        <p className="sm:col-span-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-medium text-red-600">
          {formError}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submit.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-forest-800 disabled:opacity-60"
        >
          {submit.isPending
            ? "Submitting…"
            : profile?.verification_status === "rejected"
              ? "Re-submit application"
              : "Submit for verification"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10"
      />
    </div>
  );
}
