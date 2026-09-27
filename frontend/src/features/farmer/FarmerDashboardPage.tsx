import {
  CheckCircle2,
  Clock10,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Sprout,
  Store,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import {
  useFarmerAccount,
  useFarmerBuyerOrders,
  useFarmerOrders,
  useFarmerProducts,
  useFarmerProfile,
  useFulfilOrderItem,
} from "./data/hooks";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import FulfilmentQueue from "./FulfilmentQueue";
import VerificationCard from "./VerificationCard";
import ProfileEditTab from "./ProfileEditTab";
import ProductsTab from "./ProductsTab";
import MyOrdersTab from "./MyOrdersTab";

type TabKey = "fulfilment" | "my-orders" | "products" | "profile";

const TABS: {
  key: TabKey;
  label: string;
  icon: typeof Package;
  badge?: (data: {
    fulfilmentPending: number;
    myOrdersCount: number;
    productsCount: number;
  }) => number;
}[] = [
  {
    key: "fulfilment",
    label: "Orders to pack",
    icon: Package,
    badge: (d) => d.fulfilmentPending,
  },
  {
    key: "my-orders",
    label: "My purchases",
    icon: ShoppingCart,
    badge: (d) => d.myOrdersCount,
  },
  {
    key: "products",
    label: "Products",
    icon: Sprout,
    badge: (d) => d.productsCount,
  },
  {
    key: "profile",
    label: "Profile",
    icon: Store,
  },
];

export default function FarmerDashboardPage() {
  const [tab, setTab] = useState<TabKey>("fulfilment");
  const { data: account } = useFarmerAccount();
  const { data: profile, isLoading: profileLoading } = useFarmerProfile();
  const { data: farmOrders, isLoading: farmOrdersLoading } = useFarmerOrders();
  const { data: myOrders } = useFarmerBuyerOrders();
  const { data: productsPage } = useFarmerProducts();
  const fulfil = useFulfilOrderItem();
  const toast = useToast();

  const fulfilmentPending =
    farmOrders?.reduce((total, o) => total + o.pending_items, 0) ?? 0;

  const productsCount = productsPage?.results.length ?? 0;

  const badgeData = {
    fulfilmentPending,
    myOrdersCount: myOrders?.length ?? 0,
    productsCount,
  };

  function handleFulfil(itemId: number, productName: string) {
    fulfil.mutate(itemId, {
      onSuccess: () =>
        toast.success("Marked as packed", `${productName} is ready to go.`),
      onError: (error) =>
        toast.error("Could not mark as packed", resolveApiError(error).message),
    });
  }

  return (
    <main className="min-h-[calc(100dvh-4.75rem)] bg-cream">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-295 py-7 sm:w-[calc(100%-3rem)] sm:py-10">
        {/* ─── Header: farmer info snapshot ─── */}
        <header className="mb-7 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {/* Cover banner — tall enough for farm image to breathe */}
          <div className="relative h-36 w-full bg-gradient-to-br from-forest-700 via-forest-600 to-harvest-500 sm:h-44">
            {profile?.farm_image ? (
              <img
                src={profile.farm_image}
                alt={profile.farm_name || "Farm cover"}
                className="absolute inset-0 size-full object-cover object-center"
              />
            ) : null}
            {/* Gradient overlay — darker top, bright bottom where text sits */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-forest-900/30 to-transparent" />

            {/* Verification badge pinned top-right, inside the cover */}
            {profile && (
              <div className="absolute right-4 top-4">
                <VerificationBadge status={profile.verification_status} />
              </div>
            )}
          </div>

          {/* Body: avatar + farm + contact (sits above the cover) */}
          <div className="relative z-10 flex flex-col gap-6 px-6 pb-7 pt-0 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-5">
                {/* Avatar overlaps the cover just enough */}
                <div className="relative z-20 -mt-14 sm:-mt-16">
                  {account?.profile_picture ? (
                    <img
                      src={account.profile_picture}
                      alt={account.name}
                      className="size-24 rounded-2xl border-4 border-white bg-white object-cover shadow-lg ring-1 ring-stone-200 sm:size-28"
                    />
                  ) : (
                    <div className="grid size-24 place-items-center rounded-2xl border-4 border-white bg-cream text-forest-600 shadow-lg ring-1 ring-stone-200 sm:size-28">
                      <UserIcon size={34} />
                    </div>
                  )}
                </div>

                {/* Farm identity: farm name is the primary title */}
                <div className="min-w-0 pb-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
                    {profile?.farm_name ? "Your farm" : "Farmer account"}
                  </p>
                  <h1 className="mt-1 break-words font-display text-2xl font-semibold text-ink sm:text-3xl">
                    {profile?.farm_name ||
                      (account?.name ? `${account.name}'s Farm` : "Farm Dashboard")}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <UserIcon size={12} />
                      <span>
                        Signed in as{" "}
                        <span className="font-semibold text-stone-600">
                          {account?.name || "—"}
                        </span>
                      </span>
                    </span>
                    {(profile?.district || profile?.province) && (
                      <>
                        <span className="mx-2 text-stone-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          <span>
                            {profile.district}
                            {profile.district && profile.province ? ", " : ""}
                            {profile.province}
                          </span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Contact chips: right-aligned */}
              <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                {account?.email && (
                  <ContactChip icon={Mail} label={account.email} />
                )}
                {account?.phone ? (
                  <ContactChip icon={Phone} label={account.phone} />
                ) : null}
                {profile?.address || profile?.municipality ? (
                  <ContactChip
                    icon={MapPin}
                    label={[
                      profile.address,
                      profile.municipality,
                      profile.district,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                ) : null}
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-100 bg-cream/70 p-3 sm:grid-cols-4 sm:p-4">
              <StatPill
                label="Orders to pack"
                value={String(fulfilmentPending)}
                tone={fulfilmentPending > 0 ? "warning" : "muted"}
              />
              <StatPill
                label="Purchases"
                value={String(myOrders?.length ?? 0)}
                tone="muted"
              />
              <StatPill label="Products" value={String(productsCount)} tone="muted" />
              <StatPill
                label="Verification"
                value={
                  profile
                    ? VERIFICATION_LABEL[profile.verification_status]
                    : "—"
                }
                tone={
                  profile
                    ? VERIFICATION_TONE[profile.verification_status]
                    : "muted"
                }
              />
            </div>
          </div>
        </header>

        <VerificationCard profile={profile} loading={profileLoading} />

        {/* ─── Tab container ─── */}
        <div className="mt-6 overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div
            role="tablist"
            aria-label="Farmer dashboard sections"
            className="flex min-w-0 gap-1 border-b border-stone-200 px-3 py-2 sm:px-4"
          >
            {TABS.map(({ key, label, icon: Icon, badge }) => {
              const active = tab === key;
              const count = badge ? badge(badgeData) : 0;

              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`group relative inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-extrabold transition sm:px-4 sm:py-2.5 ${
                    active
                      ? "bg-forest-50 text-forest-700"
                      : "text-muted hover:bg-stone-100 hover:text-ink"
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={`ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                        active
                          ? "bg-forest-700 text-white"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-0 sm:p-2">
            <div
              role="tabpanel"
              hidden={tab !== "fulfilment"}
              className="p-4 sm:p-5"
            >
              {tab === "fulfilment" && (
                <FulfilmentQueue
                  orders={farmOrders}
                  loading={farmOrdersLoading}
                  pendingCount={fulfilmentPending}
                  fulfilPending={fulfil.isPending}
                  onFulfil={handleFulfil}
                />
              )}
            </div>

            <div
              role="tabpanel"
              hidden={tab !== "my-orders"}
              className="p-4 sm:p-5"
            >
              {tab === "my-orders" && (
                <section>
                  <div className="mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
                      Your purchases
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-ink">
                      Orders you placed
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">
                      Everything you've bought from other farmers on the
                      marketplace.
                    </p>
                  </div>
                  <MyOrdersTab />
                </section>
              )}
            </div>

            <div
              role="tabpanel"
              hidden={tab !== "products"}
              className="p-4 sm:p-5"
            >
              {tab === "products" && <ProductsTab />}
            </div>

            <div
              role="tabpanel"
              hidden={tab !== "profile"}
              className="p-4 sm:p-5"
            >
              {tab === "profile" && (
                <ProfileEditTab
                  profile={profile}
                  loading={profileLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Header widgets ─── */

type VerificationStatus = "pending" | "verified" | "rejected";

const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

const VERIFICATION_TONE: Record<VerificationStatus, StatTone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
};

/** Badge pinned to the top-right of the cover image. */
function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config: Record<
    VerificationStatus,
    { label: string; icon: typeof CheckCircle2; className: string }
  > = {
    verified: {
      label: "Verified farmer",
      icon: CheckCircle2,
      className: "border-forest-200/40 bg-forest-700/90 text-forest-50",
    },
    pending: {
      label: "Review in progress",
      icon: Clock10,
      className: "border-harvest-200/40 bg-harvest-600/90 text-harvest-50",
    },
    rejected: {
      label: "Needs re-submission",
      icon: XCircle,
      className: "border-red-200/40 bg-red-700/90 text-red-50",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-sm ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function ContactChip({
  icon: Icon,
  label,
}: {
  icon: typeof Mail;
  label: string;
}) {
  return (
    <span
      title={label}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 shadow-sm"
    >
      <Icon size={12} className="shrink-0 text-forest-600" />
      <span className="truncate max-w-64">{label}</span>
    </span>
  );
}

type StatTone = "muted" | "success" | "warning" | "danger";

const STAT_TONE_CLS: Record<StatTone, { value: string; dot: string }> = {
  muted: { value: "text-ink", dot: "bg-stone-300" },
  success: { value: "text-forest-700", dot: "bg-forest-500" },
  warning: { value: "text-harvest-700", dot: "bg-harvest-500" },
  danger: { value: "text-red-700", dot: "bg-red-500" },
};

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: StatTone;
}) {
  const { value: valueCls, dot: dotCls } = STAT_TONE_CLS[tone];
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 ring-1 ring-stone-100 sm:px-3.5 sm:py-2.5">
      <span className={`size-1.5 shrink-0 rounded-full ${dotCls}`} />
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-extrabold leading-none ${valueCls}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
