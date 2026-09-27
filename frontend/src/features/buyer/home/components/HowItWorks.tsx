import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  PackageCheck,
  Search,
  ShoppingBasket,
  Sprout,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import Container from "../../../../components/common/Container";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover fresh produce",
    description:
      "Browse vegetables, fruits, grains and seasonal produce from farmers around Koshi Province.",
  },
  {
    number: "02",
    icon: ShoppingBasket,
    title: "Choose & order",
    description:
      "Pick your products, select quantities and add everything you need to your basket.",
  },
  {
    number: "03",
    icon: Truck,
    title: "We deliver",
    description:
      "Choose your delivery zone and receive fresh farm produce at your doorstep.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-105 w-175 -translate-x-1/2 rounded-full bg-[#EEF4E9] blur-3xl" />

        <div className="absolute -right-40 bottom-0 size-87.5 rounded-full bg-[#F8EED5]/50 blur-3xl" />
      </div>

      <Container className="relative">
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="h-px w-7 bg-[#D5A82E]" />

            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A57916]">
              Simple from farm to home
            </span>

            <span className="h-px w-7 bg-[#D5A82E]" />
          </div>

          <h2
            className="
              font-display
              text-[38px]
              font-semibold
              leading-[1.05]
              tracking-[-0.035em]
              text-[#182719]

              sm:text-[46px]

              lg:text-[52px]
            "
          >
            Fresh food shouldn't
            <span className="text-[#316934]">
              {" "}
              be complicated.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6B6D67] sm:text-[15px]">
            From discovering a local farmer to receiving
            fresh produce at your door, Koshi Bazaar keeps
            the entire experience simple.
          </p>
        </div>

        {/* =================================================
            VISUAL JOURNEY
        ================================================== */}

        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* Connecting line */}

          <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden h-px bg-[#D9E2D4] lg:block" />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative text-center"
                >
                  {/* Number / icon */}

                  <div className="relative z-10 mx-auto grid size-24 place-items-center rounded-[28px] border border-[#DCE6D8] bg-[#F5F9F2] shadow-[0_10px_30px_rgba(35,65,35,0.07)]">
                    <div className="grid size-14 place-items-center rounded-2xl bg-white text-[#316934] shadow-sm">
                      <Icon size={24} strokeWidth={1.8} />
                    </div>

                    <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-[#D4A62A] text-[9px] font-black text-white shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}

                  <div className="mt-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A7A99F]">
                      Step {step.number}
                    </span>

                    <h3 className="mt-2 text-[17px] font-extrabold text-[#202A21]">
                      {step.title}
                    </h3>

                    <p className="mx-auto mt-2 max-w-xs text-[11px] leading-5 text-[#777B74]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================
            FARM → HOME VISUAL
        ================================================== */}

        <div
          className="
            relative
            mt-16
            overflow-hidden
            rounded-[28px]
            border
            border-[#DDE6D9]
            bg-[#F2F6EF]
            p-6

            sm:p-8

            lg:mt-20
            lg:p-10
          "
        >
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-[#DDEBD8]" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-[#F3E7C8]" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* FARM */}

            <div className="flex items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-[#316934] shadow-sm">
                <Sprout size={24} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8B9186]">
                  Step 01
                </p>

                <h3 className="mt-1 text-[15px] font-extrabold text-[#253225]">
                  Local farm
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-[#777D73]">
                  Produce is harvested by farmers around
                  Koshi Province.
                </p>
              </div>
            </div>

            {/* CONNECTION */}

            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-[#6B9565]">
                <span className="h-px w-10 bg-[#B8CCB3]" />

                <ArrowRight size={18} />

                <span className="h-px w-10 bg-[#B8CCB3]" />
              </div>
            </div>

            {/* MOBILE ARROW */}

            <div className="flex justify-center lg:hidden">
              <div className="grid size-9 place-items-center rounded-full bg-white text-[#6B9565] shadow-sm">
                <ArrowRight size={16} className="rotate-90" />
              </div>
            </div>

            {/* HOME */}

            <div className="flex items-center gap-4 lg:justify-end">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-[#316934] shadow-sm">
                <PackageCheck size={24} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8B9186]">
                  Step 03
                </p>

                <h3 className="mt-1 text-[15px] font-extrabold text-[#253225]">
                  Your doorstep
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-[#777D73]">
                  Fresh produce arrives at your selected
                  delivery location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            BENEFITS
        ================================================== */}

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Benefit
            icon={<CheckCircle2 size={16} />}
            text="Trusted local farmers"
          />

          <Benefit
            icon={<Sprout size={16} />}
            text="Fresh seasonal produce"
          />

          <Benefit
            icon={<MapPin size={16} />}
            text="Transparent farm locations"
          />

          <Benefit
            icon={<Truck size={16} />}
            text="Convenient local delivery"
          />
        </div>

        {/* CTA */}

        <div className="mt-10 text-center">
          <Link
            to="/marketplace"
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#2F6633]
              px-5
              py-3.5
              text-xs
              font-extrabold
              text-white
              shadow-[0_10px_24px_rgba(47,102,51,0.18)]
              transition-all

              hover:-translate-y-0.5
              hover:bg-[#25572A]
              hover:shadow-[0_14px_30px_rgba(47,102,51,0.25)]
            "
          >
            Start shopping

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E3E8DF] bg-[#FAFCF8] px-4 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#E9F2E6] text-[#316934]">
        {icon}
      </span>

      <span className="text-[10px] font-bold text-[#62685F]">
        {text}
      </span>
    </div>
  );
}