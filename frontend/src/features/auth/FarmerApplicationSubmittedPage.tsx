import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Leaf,
  ShoppingBasket,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const buyerActions = [
  "Browse products",
  "Add products to cart",
  "Place orders",
  "Manage your buyer account",
];

export default function FarmerApplicationSubmittedPage() {
  return (
    <main className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-[#FCFBF7] px-4 py-10 sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 size-96 rounded-full bg-[#F3F8F1] blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-105 rounded-full bg-[#E5B73A]/10 blur-3xl" />
        <Leaf
          className="absolute -bottom-10 left-8 rotate-[-25deg] text-[#173615]/5"
          size={180}
          strokeWidth={0.7}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-[#E3E8E0] bg-white shadow-[0_20px_60px_rgba(23,54,21,0.1)]">
          <div className="h-1.5 bg-[#E5B73A]" />

          <div className="p-6 sm:p-10">
            <div className="text-center">
              <div className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-[#F3F8F1] text-forest-700 shadow-[0_10px_24px_rgba(45,90,39,0.12)]">
                <CheckCircle2 size={34} strokeWidth={1.8} />
                <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-[#E5B73A] text-[#173615] ring-4 ring-white">
                  <Leaf size={12} strokeWidth={2.5} />
                </span>
              </div>

              <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.22em] text-forest-700">
                Farmer application received
              </p>

              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#173615] sm:text-4xl">
                Your farmer application has been submitted.
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#687265]">
                Our team will review your application before activating farmer
                selling privileges.
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-[#E3E8E0] bg-[#FCFBF7] p-4">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#899286]">
                  Application ID
                </p>
                <p className="mt-2 font-mono text-lg font-bold tracking-wide text-[#173615]">
                  KB-FRM-00124
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#E9DFC0] bg-[#FFF9E9] p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E5B73A]/25 text-[#8C6B16]">
                  <Clock3 size={20} />
                </span>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#8C6B16]">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#173615]">
                    Under Review
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-lg border-t border-[#EDF0EA] pt-7">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-[#173615] text-white">
                  <ShoppingBasket size={17} />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-[#173615]">
                    While you wait, you can still:
                  </h2>
                  <p className="mt-0.5 text-xs text-[#899286]">
                    Keep enjoying the buyer side of Koshi Bazaar.
                  </p>
                </div>
              </div>

              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {buyerActions.map((action) => (
                  <li
                    key={action}
                    className="flex items-center gap-2.5 text-xs font-semibold text-[#40513D]"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#F3F8F1] text-forest-700">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <Link
                to="/marketplace"
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#173615] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#173615]/15 transition hover:-translate-y-0.5 hover:bg-forest-700"
              >
                Browse products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/profile"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DDE7D9] bg-[#F3F8F1] px-5 py-3.5 text-sm font-extrabold text-forest-700 transition hover:border-forest-700 hover:bg-forest-100"
              >
                <UserRound size={16} />
                Manage account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
