import {
  CheckCircle2,
  ChevronRight,
  Clock10,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  Package,
  Pencil,
  Phone,
  Plus,
  ShoppingBag,
  Sprout,
  Store,
  User as UserIcon,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import type { CurrentUserApi } from "../auth/data/api";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import type { FarmerProfileApi } from "./data/api";
import {
  useFarmerAccount,
  useFarmerBuyerOrders,
  useFarmerOrders,
  useFarmerProducts,
  useFarmerProfile,
  useFulfilOrderItem,
} from "./data/hooks";

import FulfilmentQueue from "./FulfilmentQueue";
import MyOrdersTab from "./MyOrdersTab";
import ProductsTab from "./ProductsTab";
import ProfileEditTab from "./ProfileEditTab";
import VerificationCard from "./VerificationCard";

type DashboardSection =
  | "dashboard"
  | "products"
  | "orders"
  | "my-orders"
  | "profile"
  | "verification";

type VerificationStatus = "pending" | "verified" | "rejected";

export default function FarmerDashboardPage() {
  const [section, setSection] = useState<DashboardSection>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: account } = useFarmerAccount();
  const { data: profile, isLoading: profileLoading } = useFarmerProfile();
  const { data: farmOrders, isLoading: farmOrdersLoading } = useFarmerOrders();
  const { data: myOrders } = useFarmerBuyerOrders();
  const { data: productsPage } = useFarmerProducts();

  const fulfil = useFulfilOrderItem();
  const toast = useToast();

  const fulfilmentPending =
    farmOrders?.reduce((total, order) => total + order.pending_items, 0) ?? 0;

  const productsCount = productsPage?.results.length ?? 0;

  function handleFulfil(itemId: number, productName: string) {
    fulfil.mutate(itemId, {
      onSuccess: () =>
        toast.success(
          "Marked as packed",
          `${productName} is ready for customer dispatch.`
        ),
      onError: (error) =>
        toast.error(
          "Could not mark as packed",
          resolveApiError(error).message
        ),
    });
  }

  function navigateTo(nextSection: DashboardSection) {
    setSection(nextSection);
    setMobileMenuOpen(false);
  }

  return (
    <main className="min-h-[calc(100dvh-4.75rem)] bg-cream/40 antialiased">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <div className="mx-auto flex max-w-[1600px]">
        {/* ─────────────────────────────────────
            SIDEBAR NAVIGATION
        ───────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200/80 bg-white transition-transform duration-300 ease-in-out
            lg:sticky lg:top-19 lg:h-[calc(100dvh-4.75rem)] lg:translate-x-0
            ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          `}
        >
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-stone-100 px-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-harvest-600">
                Koshi Bazaar
              </p>
              <p className="mt-0.5 font-display text-lg font-bold tracking-tight text-ink">
                Farmer Console
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
            <div>
              <SidebarLabel>Overview</SidebarLabel>
              <SidebarItem
                icon={LayoutDashboard}
                label="Dashboard"
                active={section === "dashboard"}
                onClick={() => navigateTo("dashboard")}
              />
            </div>

            <div>
              <SidebarLabel>Selling</SidebarLabel>
              <SidebarItem
                icon={Sprout}
                label="Products"
                badge={productsCount}
                active={section === "products"}
                onClick={() => navigateTo("products")}
              />
              <SidebarItem
                icon={Package}
                label="Orders to fulfil"
                badge={fulfilmentPending}
                active={section === "orders"}
                onClick={() => navigateTo("orders")}
              />
            </div>

            <div>
              <SidebarLabel>Purchasing</SidebarLabel>
              <SidebarItem
                icon={ShoppingBag}
                label="My Purchases"
                badge={myOrders?.length ?? 0}
                active={section === "my-orders"}
                onClick={() => navigateTo("my-orders")}
              />
            </div>

            <div>
              <SidebarLabel>Account</SidebarLabel>
              <SidebarItem
                icon={Store}
                label="Farm Profile"
                active={section === "profile"}
                onClick={() => navigateTo("profile")}
              />
              <SidebarItem
                icon={
                  profile?.verification_status === "verified"
                    ? CheckCircle2
                    : Clock10
                }
                label="Verification"
                active={section === "verification"}
                onClick={() => navigateTo("verification")}
              />
            </div>
          </nav>

          {/* Account Card */}
          <div className="border-t border-stone-100 p-4">
            <button
              type="button"
              onClick={() => navigateTo("profile")}
              className="flex w-full items-center gap-3 rounded-2xl border border-stone-100 bg-cream/50 p-3 text-left transition hover:border-forest-200 hover:bg-white"
            >
              {account?.profile_picture ? (
                <img
                  src={account.profile_picture}
                  alt={account.name}
                  className="size-10 rounded-xl object-cover shadow-xs"
                />
              ) : (
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700 font-semibold">
                  <UserIcon size={18} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-ink">
                  {account?.name || "Farmer"}
                </p>
                <p className="truncate text-[11px] text-muted">
                  {profile?.farm_name || "Your Farm"}
                </p>
              </div>

              <ChevronRight size={15} className="shrink-0 text-stone-400" />
            </button>
          </div>
        </aside>

        {/* ─────────────────────────────────────
            MAIN CONTENT AREA
        ───────────────────────────────────── */}
        <section className="min-w-0 flex-1">
          {/* Mobile Navigation Header */}
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-ink hover:bg-stone-100"
            >
              <Menu size={21} />
            </button>
            <p className="font-display text-base font-semibold text-ink">
              Dashboard
            </p>
            <div className="w-8" />
          </div>

          <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {section === "dashboard" && (
              <DashboardOverview
                account={account}
                profile={profile}
                fulfilmentPending={fulfilmentPending}
                productsCount={productsCount}
                purchasesCount={myOrders?.length ?? 0}
                onNavigate={navigateTo}
              />
            )}

            {section === "orders" && (
              <DashboardSectionCard
                eyebrow="Selling"
                title="Orders to fulfil"
                description="Pack and dispatch incoming customer orders."
              >
                <FulfilmentQueue
                  orders={farmOrders}
                  loading={farmOrdersLoading}
                  pendingCount={fulfilmentPending}
                  fulfilPending={fulfil.isPending}
                  onFulfil={handleFulfil}
                />
              </DashboardSectionCard>
            )}

            {section === "products" && (
              <DashboardSectionCard
                eyebrow="Selling"
                title="Manage Products"
                description="Update active produce listings, inventory, and pricing."
              >
                <ProductsTab />
              </DashboardSectionCard>
            )}

            {section === "my-orders" && (
              <DashboardSectionCard
                eyebrow="Purchasing"
                title="My Purchases"
                description="Review orders placed with neighboring producers."
              >
                <MyOrdersTab />
              </DashboardSectionCard>
            )}

            {section === "profile" && (
              <DashboardSectionCard
                eyebrow="Account"
                title="Farm Profile"
                description="Keep your contact details and operational metadata accurate."
              >
                <ProfileEditTab profile={profile} loading={profileLoading} />
              </DashboardSectionCard>
            )}

            {section === "verification" && (
              <DashboardSectionCard
                eyebrow="Account"
                title="Farmer Verification"
                description="Check the review status of your credentials and credentials."
              >
                <VerificationCard profile={profile} loading={profileLoading} />
              </DashboardSectionCard>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════ */

function SidebarLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.22em] text-stone-400">
      {children}
    </p>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  badge,
  active = false,
  onClick,
}: {
  icon: typeof Package;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
        active
          ? "bg-forest-50 text-forest-900"
          : "text-stone-600 hover:bg-stone-50 hover:text-ink"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-forest-700" />
      )}
      <Icon
        size={17}
        className={
          active
            ? "text-forest-700"
            : "text-stone-400 transition-colors group-hover:text-stone-600"
        }
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[9px] font-black ${
            active
              ? "bg-forest-700 text-white"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function DashboardSectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-harvest-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function DashboardStat({
  icon: Icon,
  label,
  value,
  description,
  tone = "default",
  onClick,
}: {
  icon: typeof Package;
  label: string;
  value: number | string;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
}) {
  const toneClasses = {
    default: {
      icon: "bg-forest-50 text-forest-700",
      value: "text-ink",
    },
    success: {
      icon: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-800",
    },
    warning: {
      icon: "bg-amber-50 text-amber-700",
      value: "text-amber-800",
    },
    danger: {
      icon: "bg-rose-50 text-rose-700",
      value: "text-rose-800",
    },
  };

  const styles = toneClasses[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className={`grid size-10 place-items-center rounded-xl ${styles.icon}`}>
          <Icon size={19} />
        </div>
        <ChevronRight
          size={16}
          className="text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-forest-600"
        />
      </div>

      <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-extrabold tracking-tight ${styles.value}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </button>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Plus;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-md"
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700 transition group-hover:bg-forest-700 group-hover:text-white">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-stone-300 transition-colors group-hover:text-forest-600"
      />
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-cream/60 px-3 py-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-forest-700 shadow-2xs">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-semibold text-stone-700" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

/* ═══════════════════════════════════════════════
   DASHBOARD OVERVIEW TAB
═══════════════════════════════════════════════ */

function DashboardOverview({
  account,
  profile,
  fulfilmentPending,
  productsCount,
  purchasesCount,
  onNavigate,
}: {
  account?: CurrentUserApi;
  profile?: FarmerProfileApi;
  fulfilmentPending: number;
  productsCount: number;
  purchasesCount: number;
  onNavigate: (section: DashboardSection) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-harvest-600">
            Overview
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Welcome back{account?.name ? `, ${account.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Manage produce listings, track sales orders, and connect with regional agricultural buyers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("products")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-bold text-white shadow-2xs transition hover:bg-forest-800"
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          icon={Package}
          label="Orders to Fulfil"
          value={fulfilmentPending}
          description={
            fulfilmentPending > 0
              ? "Action required"
              : "Queue is clear"
          }
          tone={fulfilmentPending > 0 ? "warning" : "success"}
          onClick={() => onNavigate("orders")}
        />

        <DashboardStat
          icon={Sprout}
          label="Active Listings"
          value={productsCount}
          description="Live on marketplace"
          onClick={() => onNavigate("products")}
        />

        <DashboardStat
          icon={ShoppingBag}
          label="My Purchases"
          value={purchasesCount}
          description="Completed buyer orders"
          onClick={() => onNavigate("my-orders")}
        />

        <DashboardStat
          icon={CheckCircle2}
          label="Account Status"
          value={
            profile
              ? VERIFICATION_LABEL[profile.verification_status]
              : "—"
          }
          description={
            profile?.verification_status === "verified"
              ? "Fully verified producer"
              : "Application state"
          }
          tone={
            profile?.verification_status === "verified"
              ? "success"
              : profile?.verification_status === "rejected"
              ? "danger"
              : "warning"
          }
          onClick={() => onNavigate("verification")}
        />
      </div>

      {/* Main Panels */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        {/* Fulfillment Summary Panel */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-600">
                Operations
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">
                Fulfillment Queue
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Orders ready for packaging and local delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900"
            >
              View Queue
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="mt-6">
            {fulfilmentPending > 0 ? (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-100/80 text-amber-800">
                    <Package size={22} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-ink">
                      {fulfilmentPending}
                    </p>
                    <p className="text-sm font-medium text-amber-900">
                      item{fulfilmentPending !== 1 ? "s" : ""} awaiting dispatch
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("orders")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-forest-800"
                >
                  Open Queue
                  <ChevronRight size={15} />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-forest-100 bg-forest-50/50 p-6 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-white text-forest-700 shadow-2xs">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="mt-3 font-bold text-ink">Queue clear</h3>
                <p className="mt-0.5 text-sm text-muted">
                  All current fulfillment tasks have been completed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Farm Profile Summary Panel */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-600">
                Organization
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">
                {profile?.farm_name || "Farm Overview"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("profile")}
              className="rounded-xl border border-stone-200 p-2 text-stone-500 hover:border-forest-200 hover:bg-forest-50 hover:text-forest-700"
              title="Edit Profile"
            >
              <Pencil size={15} />
            </button>
          </div>

          <div className="mt-5 space-y-2.5">
            <InfoRow
              icon={UserIcon}
              label="Manager"
              value={account?.name || "—"}
            />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={
                [profile?.municipality, profile?.district, profile?.province]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <InfoRow
              icon={Mail}
              label="Email"
              value={account?.email || "—"}
            />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={account?.phone || "—"}
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-forest-200 bg-forest-50/70 px-4 py-2.5 text-xs font-bold text-forest-700 hover:bg-forest-100"
          >
            Manage Profile
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div>
        <div className="mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-600">
            Shortcuts
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-ink">
            Quick Actions
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <QuickAction
            icon={Plus}
            title="Add Product"
            description="Create a new produce listing"
            onClick={() => onNavigate("products")}
          />
          <QuickAction
            icon={Package}
            title="Fulfil Orders"
            description="Pack active buyer requests"
            onClick={() => onNavigate("orders")}
          />
          <QuickAction
            icon={ShoppingBag}
            title="Source Produce"
            description="Browse local market inventory"
            onClick={() => onNavigate("my-orders")}
          />
        </div>
      </div>

      {/* Platform Dual-Role Card */}
      <div className="rounded-3xl border border-forest-100 bg-linear-to-r from-forest-50/80 via-white to-white p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-forest-700 text-white shadow-2xs">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-bold text-ink">
                Unified Marketplace Portal
              </h3>
              <p className="mt-0.5 max-w-xl text-sm leading-relaxed text-muted">
                Your account supports cross-sourcing produce from neighboring farms directly inside Koshi Bazaar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("my-orders")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-forest-800"
          >
            My Purchases
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}