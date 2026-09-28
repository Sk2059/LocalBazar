import { useState, type ReactNode } from "react";
import {
  Layers,
  Leaf,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import OverviewTab from "./OverviewTab";
import VerificationQueue from "./VerificationQueue";
import UsersTab from "./UsersTab";
import OrdersTab from "./OrdersTab";
import CategoriesTab from "./CategoriesTab";
import ProductsTab from "./ProductsTab";
import DeliveryLocationsTab from "./DeliveryLocationsTab";

type Tab =
  | "overview"
  | "farmers"
  | "users"
  | "orders"
  | "categories"
  | "products"
  | "delivery";

interface TabConfig {
  value: Tab;
  label: string;
  icon: typeof LayoutDashboard;
  section: "Overview" | "Management" | "Logistics";
}

const TABS: TabConfig[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard, section: "Overview" },
  { value: "farmers", label: "Farmer Verifications", icon: ShieldCheck, section: "Management" },
  { value: "users", label: "User Accounts", icon: Users, section: "Management" },
  { value: "orders", label: "Marketplace Orders", icon: ShoppingBag, section: "Management" },
  { value: "products", label: "Products", icon: Leaf, section: "Management" },
  { value: "categories", label: "Product Categories", icon: Layers, section: "Logistics" },
  { value: "delivery", label: "Delivery Zones", icon: Truck, section: "Logistics" },
];

/**
 * The admin console. Each tab owns its own queries, so switching tabs is instant.
 * Component states are preserved using hidden containers to prevent remounting fetch calls.
 */
export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTabConfig = TABS.find((t) => t.value === activeTab);

  function handleNavigate(tab: Tab) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }

  return (
    <main className="min-h-[calc(100dvh-4.75rem)] bg-cream/40 antialiased">
      {/* Mobile Drawer Backdrop */}
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
                Admin Console
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
              {TABS.filter((t) => t.section === "Overview").map((item) => (
                <SidebarItem
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.value}
                  onClick={() => handleNavigate(item.value)}
                />
              ))}
            </div>

            <div>
              <SidebarLabel>Management</SidebarLabel>
              {TABS.filter((t) => t.section === "Management").map((item) => (
                <SidebarItem
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.value}
                  onClick={() => handleNavigate(item.value)}
                />
              ))}
            </div>

            <div>
              <SidebarLabel>Logistics & Config</SidebarLabel>
              {TABS.filter((t) => t.section === "Logistics").map((item) => (
                <SidebarItem
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.value}
                  onClick={() => handleNavigate(item.value)}
                />
              ))}
            </div>
          </nav>

          {/* Admin Role Footer Card */}
          <div className="border-t border-stone-100 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-cream/50 p-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest-700 text-white font-bold">
                <UserCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-ink">System Admin</p>
                <p className="truncate text-[11px] text-muted">Full Access Mode</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ─────────────────────────────────────
            MAIN CONTENT AREA
        ───────────────────────────────────── */}
        <section className="min-w-0 flex-1">
          {/* Mobile Top Header */}
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-ink hover:bg-stone-100"
            >
              <Menu size={21} />
            </button>
            <p className="font-display text-base font-semibold text-ink">
              {activeTabConfig?.label || "Admin Console"}
            </p>
            <div className="w-8" />
          </div>

          <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {/* Page Header Header */}
            <div className="mb-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-harvest-600">
                Administration
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Marketplace Management
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                Verify farms, moderate user accounts, organize categories, and track order logistics across the region.
              </p>
            </div>

            {/* Rendered Tabs (Preserving component instances & state) */}
            <div className={activeTab === "overview" ? "block" : "hidden"}>
              <OverviewTab onGotoFarmers={() => handleNavigate("farmers")} />
            </div>

            <div className={activeTab === "farmers" ? "block" : "hidden"}>
              <VerificationQueue />
            </div>

            <div className={activeTab === "users" ? "block" : "hidden"}>
              <UsersTab />
            </div>

            <div className={activeTab === "orders" ? "block" : "hidden"}>
              <OrdersTab />
            </div>

            <div className={activeTab === "categories" ? "block" : "hidden"}>
              <CategoriesTab />
            </div>

            <div className={activeTab === "products" ? "block" : "hidden"}>
              <ProductsTab />
            </div>

            <div className={activeTab === "delivery" ? "block" : "hidden"}>
              <DeliveryLocationsTab />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════
   HELPER NAVIGATION COMPONENTS
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
  icon: typeof LayoutDashboard;
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