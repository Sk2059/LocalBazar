import {
  ChevronDown,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { useCart } from "../../context/CartContext";
import {
  AUTH_CHANGE_EVENT,
  clearTokens,
  isAuthenticated,
} from "../../api/auth";
import { queryClient } from "../../api/queryClient";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { dashboardPath } from "../../features/auth/paths";
import { useFarmerProfile } from "../../features/farmer/data/hooks";
import { useToast } from "../ui/toast/ToastProvider";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  // Re-render whenever the tokens change anywhere in the app (login, the 401
  // interceptor, …) so the header never shows a stale auth state.
  const [, setAuthTick] = useState(0);

  useEffect(() => {
    const handler = () => setAuthTick((value) => value + 1);
    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  }, []);

  const signedIn = isAuthenticated();

  // The account behind those tokens — drives the dropdown's dashboard link and
  // the farmer verification badge. Fails closed while it loads.
  const { data: me } = useCurrentUser();
  const role = me?.role;
  const dashboard = role ? dashboardPath(role) : "/buyer/dashboard";
  const dashboardLabel =
    role === "admin"
      ? "Admin console"
      : role === "farmer"
        ? "Farmer dashboard"
        : "My dashboard";

  function handleSignOut() {
    clearTokens();
    setAccountOpen(false);
    setMobileOpen(false);
    // Drop anything cached behind the now-invalid token.
    void queryClient.clear();
    toast.info("Signed out", "You've been signed out of your account.");
    navigate("/", { replace: true });
  }

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Marketplace", path: "/marketplace" },
    { label: "Farmers", path: "/farmers" },
    { label: "My Orders", path: "/orders" },
    { label: "How It Works", path: "/how-it-works" },
  ];

  return (
    <header className="sticky top-0 z-50">
 
      <div className="border-b border-stone-200/70 bg-cream/90 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-19 w-[calc(100%-2rem)] max-w-295 items-center gap-5 sm:w-[calc(100%-3rem)]">

          <Link
            to="/"
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(false);
            }}
            className="group flex shrink-0 items-center gap-2.5"
          >
            
            <span className="relative grid size-10.5 place-items-center overflow-hidden rounded-[13px] bg-forest-700 text-white shadow-[0_8px_20px_rgba(45,90,39,0.18)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_25px_rgba(45,90,39,0.25)]">
              <span className="absolute inset-0 bg-linear-to-br from-white/15 to-transparent" />

              <Leaf
                size={21}
                strokeWidth={2.1}
                className="relative"
              />
            </span>

            
            <span className="flex flex-col leading-none">
              <span className="font-display text-[20px] font-semibold tracking-[-0.02em] text-forest-700">
                Koshi
              </span>

              <span className="mt-1.25 text-[9px] font-extrabold uppercase tracking-[0.22em] text-harvest-500">
                Bazaar
              </span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className="group relative"
              >
                {({ isActive }) => (
                  <span
                    className={[
                      "relative flex items-center rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold transition-all duration-200",
                      isActive
                        ? "bg-forest-50 text-forest-700"
                        : "text-stone-600 hover:bg-stone-100/70 hover:text-forest-700",
                    ].join(" ")}
                  >
                    {item.label}

                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-harvest-500" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

         
          <div className="ml-auto flex items-center gap-1.5">

           
            <div className="hidden md:block">
              {searchOpen ? (
                <div className="flex h-10 w-55 items-center rounded-xl border border-stone-200 bg-white px-3 shadow-sm transition-all xl:w-65">
                  <Search
                    size={17}
                    className="shrink-0 text-stone-400"
                  />

                  <input
                    autoFocus
                    type="text"
                    placeholder="Search fresh produce..."
                    className="min-w-0 flex-1 bg-transparent px-2.5 text-xs font-medium text-ink outline-none placeholder:text-stone-400"
                    onBlur={() => setSearchOpen(false)}
                  />

                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="grid size-6 shrink-0 place-items-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-ink"
                    aria-label="Close search"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="group grid size-10 place-items-center rounded-xl text-stone-600 transition hover:bg-forest-50 hover:text-forest-700"
                >
                  <Search
                    size={18}
                    strokeWidth={1.9}
                    className="transition-transform duration-200 group-hover:scale-105"
                  />
                </button>
              )}
            </div>

           
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search"
              className="grid size-10 place-items-center rounded-xl text-stone-600 transition hover:bg-forest-50 hover:text-forest-700 md:hidden"
            >
              <Search
                size={19}
                strokeWidth={1.9}
              />
            </button>

            
            <span className="mx-1 hidden h-7 w-px bg-stone-200 md:block" />

            
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="group relative grid size-10 place-items-center rounded-xl text-stone-700 transition hover:bg-forest-50 hover:text-forest-700"
            >
              <ShoppingCart
                size={19}
                strokeWidth={1.9}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              
              <span className="absolute right-0 top-0 grid min-h-4.25 min-w-4.25 place-items-center rounded-full border-2 border-cream bg-harvest-500 px-1 text-[8px] font-extrabold leading-none text-white">
                {totalItems}
              </span>
            </Link>


            {signedIn ? (
              <div className="relative ml-1 hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  onBlur={() =>
                    window.setTimeout(() => setAccountOpen(false), 120)
                  }
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  className="group flex h-10 items-center gap-2 rounded-xl border border-forest-700 bg-forest-700 px-4 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-md"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-white/10">
                    <UserRound size={13} />
                  </span>

                  <span>Account</span>

                  <ChevronDown
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-y-0.5"
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-[0_14px_40px_rgba(28,43,25,0.14)]">
                    <div className="rounded-xl bg-cream/70 px-3 py-2.5">
                      <p className="truncate text-xs font-extrabold text-ink">
                        {me?.name ?? "Your account"}
                      </p>

                      <p className="truncate text-[10px] text-muted">
                        {me?.email}
                      </p>

                      {role && (
                        <span className="mt-1.5 inline-block rounded-full bg-forest-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-forest-700">
                          {role}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5">
                      <Link
                        to={dashboard}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-ink transition hover:bg-forest-50"
                      >
                        <LayoutDashboard
                          size={15}
                          className="text-forest-700"
                        />

                        {dashboardLabel}
                      </Link>

                      {role === "farmer" && (
                        <FarmerVerificationBadge onNavigate={() => setAccountOpen(false)} />
                      )}

                      {role !== "admin" && (
                        <Link
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-ink transition hover:bg-forest-50"
                        >
                          <Package
                            size={15}
                            className="text-forest-700"
                          />

                          My orders
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-ink transition hover:bg-forest-50"
                      >
                        <UserRound
                          size={15}
                          className="text-forest-700"
                        />

                        My profile
                      </Link>
                    </div>

                    <button
                      type="button"
                      onMouseDown={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} />

                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 hidden h-10 items-center gap-2 rounded-xl border border-forest-700 bg-forest-700 px-4 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-md sm:flex"
              >
                <span className="grid size-5 place-items-center rounded-full bg-white/10">
                  <UserRound size={13} />
                </span>

                <span>Sign in</span>
              </Link>
            )}

            
            <button
              type="button"
              aria-label={
                mobileOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              onClick={() =>
                setMobileOpen((value) => !value)
              }
              className="ml-1 grid size-10 place-items-center rounded-xl text-stone-700 transition hover:bg-forest-50 hover:text-forest-700 lg:hidden"
            >
              {mobileOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-stone-200/70 bg-cream px-4 py-3 md:hidden">
            <div className="mx-auto flex h-11 max-w-295 items-center rounded-xl border border-stone-200 bg-white px-3 shadow-sm">
              <Search
                size={17}
                className="shrink-0 text-stone-400"
              />

              <input
                autoFocus
                type="text"
                placeholder="Search vegetables, fruits, farmers..."
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-ink outline-none placeholder:text-stone-400"
              />

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="grid size-7 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-ink"
                aria-label="Close search"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        
        {mobileOpen && (
          <div className="border-t border-stone-200/70 bg-cream lg:hidden">
            <div className="mx-auto w-[calc(100%-2rem)] max-w-295 py-3 sm:w-[calc(100%-3rem)]">
              <nav className="flex flex-col">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        "flex items-center justify-between border-b border-stone-200/80 py-4 text-sm font-bold transition",
                        isActive
                          ? "text-forest-700"
                          : "text-ink",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{item.label}</span>

                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-harvest-500" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              
              {signedIn ? (
                <>
                  <Link
                    to={dashboard}
                    onClick={() => setMobileOpen(false)}
                    className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-700 text-sm font-bold text-white shadow-lg shadow-forest-700/10 transition hover:bg-forest-800"
                  >
                    <LayoutDashboard size={17} />

                    {dashboardLabel}
                  </Link>

                  {role === "farmer" && (
                    <FarmerVerificationBadge onNavigate={() => setMobileOpen(false)} />
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-700 text-sm font-bold text-white shadow-lg shadow-forest-700/10 transition hover:bg-forest-800"
                >
                  <UserRound size={17} />

                  Sign in to your account
                </Link>
              )}

              {signedIn ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-red-600"
                >
                  <LogOut size={16} />

                  Sign out
                </button>
              ) : (
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-forest-700"
                >
                  Create an account

                  <ChevronDown
                    size={14}
                    className="-rotate-90"
                  />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * A farmer's verification state, shown wherever the account menu appears. Only
 * ever mounted for farmers, so the profile query can't 404 on a buyer or admin.
 */
function FarmerVerificationBadge({ onNavigate }: { onNavigate?: () => void }) {
  const { data: profile } = useFarmerProfile();

  if (!profile) return null;

  const { verification_status: status } = profile;

  const tone =
    status === "verified"
      ? "text-forest-700 bg-forest-50"
      : status === "rejected"
        ? "text-red-600 bg-red-50"
        : "text-amber-700 bg-amber-50";

  const label =
    status === "verified"
      ? "Farm verified"
      : status === "rejected"
        ? "Verification rejected — review the note and re-apply"
        : "Verification pending — awaiting admin review";

  return (
    <Link
      to="/farmer/dashboard"
      onClick={onNavigate}
      className={`mt-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${tone}`}
    >
      <ShieldCheck size={15} />

      {label}
    </Link>
  );
}