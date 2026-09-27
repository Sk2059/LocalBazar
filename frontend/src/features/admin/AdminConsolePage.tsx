import { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";

import OverviewTab from "./OverviewTab";
import VerificationQueue from "./VerificationQueue";
import UsersTab from "./UsersTab";
import OrdersTab from "./OrdersTab";
import CategoriesTab from "./CategoriesTab";
import DeliveryLocationsTab from "./DeliveryLocationsTab";

type Tab =
  | "overview"
  | "farmers"
  | "users"
  | "orders"
  | "categories"
  | "delivery";

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
  { value: "farmers", label: "Farmers", icon: <ShieldCheck size={15} /> },
  { value: "users", label: "Users", icon: <Users size={15} /> },
  { value: "orders", label: "Orders", icon: <ShoppingBag size={15} /> },
  { value: "categories", label: "Categories", icon: <Layers size={15} /> },
  { value: "delivery", label: "Delivery", icon: <Truck size={15} /> },
];

/**
 * The admin console. Each tab owns its own queries, so switching tabs is instant
 * after the first visit and a slow orders fetch never blocks the stats grid.
 *
 * The whole route sits behind `RequireRole(["admin"])` in `AppRoutes`, so by the
 * time this renders the token is known to carry an admin role.
 */
export default function AdminConsolePage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">
          Administration
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold text-ink">Marketplace console</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Verify farms, moderate accounts, and keep orders moving.
        </p>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-stone-200 pb-4">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
              tab === item.value
                ? "bg-forest-700 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && <OverviewTab onGotoFarmers={() => setTab("farmers")} />}
        {tab === "farmers" && <VerificationQueue />}
        {tab === "users" && <UsersTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "delivery" && <DeliveryLocationsTab />}
      </div>
    </div>
  );
}
