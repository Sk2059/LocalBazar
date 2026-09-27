import { Mail, Phone, Upload, User } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  useFarmerAccount,
  useUpdateFarmerAccount,
  useUpdateFarmerProfile,
} from "./data/hooks";
import type { FarmerProfileApi } from "./data/api";
import { fieldMessage, resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";

const PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10";

export default function ProfileEditTab({
  profile,
  loading: profileLoading,
}: {
  profile?: FarmerProfileApi;
  loading: boolean;
}) {
  return (
    <div className="grid gap-6">
      <PersonalInfoSection />
      <FarmInfoSection profile={profile} loading={profileLoading} />
    </div>
  );
}

/* ── PERSONAL INFO (user account: name, phone, profile picture, email R/O) ─ */

function PersonalInfoSection() {
  const { data: account, isLoading } = useFarmerAccount();
  const update = useUpdateFarmerAccount();
  const toast = useToast();
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fileInput = form.elements.namedItem("profile_picture");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    const payload = new FormData();
    payload.append("name", (formData.get("name") as string).trim());
    const phone = (formData.get("phone") as string).trim();
    if (phone) payload.append("phone", phone);
    if (file) payload.append("profile_picture", file);

    update.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile saved", "Your personal information is updated.");
      },
      onError: (error) => {
        const nameError = fieldMessage(error, "name");
        const phoneError = fieldMessage(error, "phone");
        setFormError(
          nameError ?? phoneError ?? resolveApiError(error).message,
        );
      },
    });
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-stone-100" />
          <div className="h-4 w-64 rounded bg-stone-100" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 rounded-xl bg-stone-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
          Personal
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-ink">
          Your information
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          This is your account — the name and picture buyers see next to your farm.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
            Profile picture
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {account?.profile_picture ? (
              <img
                src={account.profile_picture}
                alt={account.name}
                className="h-20 w-20 shrink-0 rounded-full border border-stone-200 object-cover"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-dashed border-stone-300 bg-cream text-stone-400">
                <User size={26} />
              </div>
            )}
            <div className="flex-1 rounded-xl border border-dashed border-stone-300 bg-cream px-4 py-3">
              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                className="w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-forest-700"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            defaultValue={account?.name ?? ""}
            required
            placeholder="e.g. Ramesh Karki"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
            <Phone size={12} />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={account?.phone ?? ""}
            placeholder="e.g. 98xxxxxxxx"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
            <Mail size={12} />
            Email
          </label>
          <input
            type="email"
            value={account?.email ?? ""}
            disabled
            className={`${inputCls} cursor-not-allowed bg-stone-50 text-muted`}
          />
          <p className="mt-1 text-[10px] text-muted">
            Email can&rsquo;t be changed from here — contact support to switch it.
          </p>
        </div>

        {formError && (
          <p className="sm:col-span-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-medium text-red-600">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={update.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-6 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-forest-800 disabled:opacity-60"
          >
            {update.isPending ? "Saving…" : "Save personal info"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ── FARM INFO (farm profile: name, address, location, image, description) ─ */

function FarmInfoSection({
  profile,
  loading,
}: {
  profile?: FarmerProfileApi;
  loading: boolean;
}) {
  const update = useUpdateFarmerProfile();
  const toast = useToast();
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fileInput = form.elements.namedItem("farm_image");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    const payload = new FormData();
    payload.append("farm_name", (formData.get("farm_name") as string).trim());
    payload.append("address", (formData.get("address") as string).trim());
    payload.append(
      "municipality",
      (formData.get("municipality") as string).trim(),
    );
    payload.append("district", (formData.get("district") as string).trim());
    payload.append("province", formData.get("province") as string);
    payload.append(
      "description",
      (formData.get("description") as string).trim(),
    );
    if (file) payload.append("farm_image", file);

    update.mutate(payload, {
      onSuccess: () => {
        toast.success("Farm saved", "Your farm information is up to date.");
      },
      onError: (error) => {
        const farmNameError = fieldMessage(error, "farm_name");
        const addressError = fieldMessage(error, "address");
        setFormError(
          farmNameError ?? addressError ?? resolveApiError(error).message,
        );
      },
    });
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-stone-100" />
          <div className="h-4 w-72 rounded bg-stone-100" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-11 rounded-xl bg-stone-100 ${i >= 6 ? "sm:col-span-2" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
          Farm details
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-ink">
          Your farm profile
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Buyers see this on your public farm listing — keep it fresh.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
            Farm image
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {profile?.farm_image ? (
              <img
                src={profile.farm_image}
                alt={profile.farm_name}
                className="h-24 w-32 shrink-0 rounded-2xl border border-stone-200 object-cover"
              />
            ) : (
              <div className="grid h-24 w-32 shrink-0 place-items-center rounded-2xl border border-dashed border-stone-300 bg-cream text-stone-400">
                <Upload size={20} />
              </div>
            )}
            <div className="flex-1 rounded-xl border border-dashed border-stone-300 bg-cream px-4 py-3">
              <input
                type="file"
                name="farm_image"
                accept="image/*"
                className="w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-forest-700"
              />
            </div>
          </div>
        </div>

        <Field
          label="Farm name"
          name="farm_name"
          defaultValue={profile?.farm_name ?? ""}
          required
          placeholder="e.g. Green Valley Organics"
        />
        <Field
          label="Farm address"
          name="address"
          defaultValue={profile?.address ?? ""}
          required
          placeholder="Street or village"
        />
        <Field
          label="Municipality"
          name="municipality"
          defaultValue={profile?.municipality ?? ""}
          placeholder="e.g. Biratnagar"
        />
        <Field
          label="District"
          name="district"
          defaultValue={profile?.district ?? ""}
          placeholder="e.g. Morang"
        />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
            Province
          </label>
          <select
            name="province"
            defaultValue={profile?.province ?? "Koshi Province"}
            className={inputCls}
          >
            {PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[11px] font-bold text-stone-600">
            About your farm
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={profile?.description ?? ""}
            placeholder="What you grow, how you grow it, harvest weeks, anything buyers should know…"
            className={inputCls}
          />
        </div>

        {formError && (
          <p className="sm:col-span-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-medium text-red-600">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={update.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-6 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-forest-800 disabled:opacity-60"
          >
            {update.isPending ? "Saving…" : "Save farm info"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}
