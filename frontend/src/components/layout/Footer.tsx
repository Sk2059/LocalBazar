import {
  ArrowUpRight,
  Globe,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 overflow-hidden bg-forest-900 text-white">

      <div className="border-b border-white/10">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-295 py-12 sm:w-[calc(100%-3rem)] sm:py-16">
          <div className="relative overflow-hidden rounded-[28px] bg-forest-700 px-6 py-10 sm:px-10 lg:px-12">
            
            <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/4" />

            <div className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-harvest-500/8" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              
              
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5">
                  <Sprout
                    size={14}
                    className="text-harvest-300"
                  />

                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/70">
                    Grow local. Buy local.
                  </span>
                </div>

                <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Good food starts with
                  <span className="text-harvest-300">
                    {" "}good farmers.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                  Discover fresh produce from farmers around
                  Koshi Province and help strengthen the local
                  farming community.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to="/marketplace"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-extrabold text-forest-800 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-cream hover:shadow-xl"
                >
                  Explore marketplace

                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

  
      <div className="mx-auto grid w-[calc(100%-2rem)] max-w-295 gap-12 py-14 sm:w-[calc(100%-3rem)] sm:py-16 lg:grid-cols-[1.7fr_1fr_1fr_1.2fr]">

        <div>
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5"
          >
          
            <span className="relative grid size-11 place-items-center overflow-hidden rounded-[14px] bg-white text-forest-700 shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5">
              <span className="absolute inset-0 bg-linear-to-br from-forest-50 to-transparent" />

              <Leaf
                size={21}
                strokeWidth={2}
                className="relative"
              />
            </span>

            <span className="flex flex-col leading-none">
              <span className="font-display text-[21px] font-semibold tracking-tight text-white">
                Koshi
              </span>

              <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-harvest-300">
                Bazaar
              </span>
            </span>
          </Link>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
            A direct marketplace connecting local farmers
            with buyers across Koshi Province — making
            fresh, local produce easier to discover and buy.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-white/50">
            <MapPin
              size={15}
              className="shrink-0 text-harvest-300"
            />

            <span>Koshi Province, Nepal</span>
          </div>

          <div className="mt-7 flex items-center gap-2">
            <a
              href="#"
              aria-label="Koshi Bazaar website"
              className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Globe size={16} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            Marketplace
          </h3>

          <nav className="mt-5 flex flex-col gap-3.5">
            <Link
              to="/marketplace"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Browse produce
            </Link>

            <Link
              to="/marketplace"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Fresh harvests
            </Link>

            <Link
              to="/farmers"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Meet farmers
            </Link>

            <Link
              to="/marketplace?bulk=true"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Bulk & wholesale
            </Link>

            <Link
              to="/how-it-works"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              How it works
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            For Buyers
          </h3>

          <nav className="mt-5 flex flex-col gap-3.5">
            <Link
              to="/cart"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Shopping cart
            </Link>

            <Link
              to="/orders"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              My orders
            </Link>

            <Link
              to="/orders"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Track order
            </Link>

            <Link
              to="/profile"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              My account
            </Link>

            <Link
              to="/help"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Help & support
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            For Farmers
          </h3>

          <nav className="mt-5 flex flex-col gap-3.5">
            <Link
              to="/farmer/register"
              className="group flex w-fit items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
            >
              Become a farmer

              <ArrowUpRight
                size={12}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              to="/farmer/login"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Farmer login
            </Link>

            <Link
              to="/farmer/dashboard"
              className="w-fit text-xs text-white/50 transition-colors hover:text-white"
            >
              Farmer dashboard
            </Link>
          </nav>

          <div className="mt-7 border-t border-white/10 pt-6">
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/40">
              Need help?
            </h4>

            <div className="mt-3 flex flex-col gap-2.5">
              <a
                href="mailto:hello@koshibazaar.com"
                className="flex items-center gap-2 text-xs text-white/55 transition hover:text-white"
              >
                <Mail
                  size={14}
                  className="text-harvest-300"
                />

                hello@koshibazaar.com
              </a>

              <a
                href="tel:+9770000000000"
                className="flex items-center gap-2 text-xs text-white/55 transition hover:text-white"
              >
                <Phone
                  size={14}
                  className="text-harvest-300"
                />

                +977 000 000 0000
              </a>
            </div>
          </div>
        </div>
      </div>

  
      <div>
        <div className="mx-auto flex w-[calc(100%-2rem)] max-w-295 flex-col gap-4 py-6 text-[10px] text-white/35 sm:w-[calc(100%-3rem)] sm:flex-row sm:items-center sm:justify-between">
          
          <p>
            © {year} Koshi Bazaar. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              to="/privacy"
              className="transition hover:text-white/70"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition hover:text-white/70"
            >
              Terms
            </Link>

            <Link
              to="/help"
              className="transition hover:text-white/70"
            >
              Support
            </Link>

            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="inline-flex items-center gap-1 text-white/50 transition hover:text-white"
            >
              Back to top

              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}