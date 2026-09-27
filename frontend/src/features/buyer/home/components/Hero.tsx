import {
  ArrowRight,
  Check,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Tractor,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


import Container from "../../../../components/common/Container";
import Button from "../../../../components/common/Button";

export default function Hero() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const popularSearches = [
    "Tomato",
    "Potato",
    "Cauliflower",
    "Mango",
  ];

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/marketplace");
      return;
    }

    navigate(
      `/marketplace?search=${encodeURIComponent(value)}`,
    );
  };

  const handlePopularSearch = (value: string) => {
    setSearch(value);

    navigate(
      `/marketplace?search=${encodeURIComponent(value)}`,
    );
  };

  return (
    <section className="relative min-h-[calc(100dvh-4.75rem)] overflow-hidden bg-[#FAF8F3]">
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top right soft green glow */}
        <div className="absolute -right-32 -top-32 h-130 w-130 rounded-full bg-[#EAF2E7] blur-3xl" />

        {/* Bottom left warm glow */}
        <div className="absolute -bottom-48 -left-48 h-125 w-125 rounded-full bg-[#F5E8C7]/50 blur-3xl" />

        {/* Tiny decorative dot */}
        <div className="absolute left-[7%] top-[46%] h-2 w-2 rounded-full bg-[#D9A93A]/70" />

        {/* Decorative leaf */}
        <DecorativeLeaf
          className="absolute right-[3%] top-[8%] hidden rotate-20 text-[#B6CE68] lg:block"
        />

        <DecorativeLeaf
          className="absolute left-[39%] bottom-[10%] hidden rotate-[-25deg] text-[#C7D99A] xl:block"
        />

        <DecorativeLeaf
          className="absolute left-[2%] bottom-[18%] hidden rotate-30 text-[#E1E8C8] lg:block"
        />
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <Container className="relative">
        <div
          className="
            grid
            min-h-[calc(100dvh-4.75rem)]
            items-center
            gap-8
            py-8

            sm:gap-10
            sm:py-10

            lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]
            lg:gap-12
            lg:overflow-visible
            lg:py-6

            xl:gap-16
            xl:py-8
          "
        >
          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <div className="relative z-20 max-w-162.5 lg:pr-2 xl:pr-6">
            {/* -----------------------------------------------
                LOCATION BADGE
            ------------------------------------------------ */}

            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#CFE0C8]
                bg-white/80
                px-3
                py-1.5
                shadow-[0_4px_16px_rgba(30,70,30,0.06)]
                backdrop-blur-md
              "
            >
              <span className="grid size-5 place-items-center rounded-full bg-[#EAF3E6] text-[#2F6330]">
                <MapPin
                  size={11}
                  strokeWidth={2.7}
                />
              </span>

              <span
                className="
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.13em]
                  text-[#315F32]
                "
              >
                Koshi Province, Nepal
              </span>

              <span className="size-1 rounded-full bg-[#D69F24]" />

              <span className="text-[10px] font-bold text-[#77756F]">
                Local marketplace
              </span>
            </div>

            {/* -----------------------------------------------
                HEADING
            ------------------------------------------------ */}

            <h1
              className="
                max-w-162.5
                font-display
                text-[45px]
                font-semibold
                leading-[0.98]
                tracking-[-0.045em]
                text-[#172719]

                sm:text-[58px]

                md:text-[64px]

                lg:text-[58px]

                xl:text-[68px]
              "
            >
              Fresh from the

              <span className="relative block w-fit text-[#2D6731]">
                farm.

                {/* Gold underline */}
                <span
                  className="
                    absolute
                    -bottom-1
                    left-0
                    h-1.75
                    w-[88%]
                    rounded-full
                    bg-[#E6C878]
                    opacity-80
                  "
                />
              </span>

              <span className="block">
                Straight to you.
              </span>
            </h1>

            {/* -----------------------------------------------
                DESCRIPTION
            ------------------------------------------------ */}

            <p
              className="
                mt-6
                max-w-155
                text-[14px]
                leading-7
                text-[#535A53]

                sm:text-[15px]
                sm:leading-7

                xl:text-base
              "
            >
              Discover fresh vegetables, fruits and local
              produce directly from farmers across Koshi
              Province. Shop local, know your farmer, and
              enjoy produce at its best.
            </p>

            {/* =================================================
                SEARCH
            ================================================== */}

            <form
              onSubmit={handleSearch}
              className="mt-7 max-w-150"
            >
              <div
                className="
                  flex
                  min-h-15
                  items-center
                  rounded-[17px]
                  border
                  border-[#E3E1DB]
                  bg-white
                  p-1.5
                  shadow-[0_15px_45px_rgba(35,55,35,0.09)]
                  transition-all

                  focus-within:border-[#B9D1B4]
                  focus-within:shadow-[0_18px_50px_rgba(35,75,35,0.12)]
                "
              >
                <Search
                  size={20}
                  strokeWidth={1.8}
                  className="ml-4 shrink-0 text-[#8D8B85]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search vegetables, fruits, farmers..."
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    text-[13px]
                    font-medium
                    text-[#263426]
                    outline-none
                    placeholder:text-[#AAA8A2]
                  "
                />

                <button
                  type="submit"
                  className="
                    hidden
                    min-h-12.5
                    items-center
                    gap-2
                    rounded-[13px]
                    bg-[#2D6731]
                    px-6
                    text-[12px]
                    font-extrabold
                    text-white
                    shadow-[0_7px_18px_rgba(45,103,49,0.2)]
                    transition-all

                    hover:bg-[#25592A]
                    hover:shadow-[0_10px_22px_rgba(45,103,49,0.25)]

                    active:scale-[0.98]

                    sm:flex
                  "
                >
                  Search

                  <ArrowRight size={16} />
                </button>
              </div>

              {/* -----------------------------------------------
                  POPULAR SEARCHES
              ------------------------------------------------ */}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-bold text-[#96938D]">
                  Popular:
                </span>

                {popularSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      handlePopularSearch(item)
                    }
                    className="
                      rounded-full
                      border
                      border-[#E5E2DB]
                      bg-white
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      text-[#66645F]
                      shadow-sm
                      transition-all

                      hover:border-[#C9DAC4]
                      hover:bg-[#F2F7EF]
                      hover:text-[#2D6731]
                    "
                  >
                    {item}
                  </button>
                ))}
              </div>
            </form>

            {/* =================================================
                CTA BUTTONS
            ================================================== */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="
                    w-full
                    min-w-58.75
                    rounded-[13px]
                    bg-[#2D6731]
                    shadow-[0_10px_25px_rgba(45,103,49,0.18)]
                    hover:bg-[#25592A]
                    sm:w-auto
                  "
                >
                  Explore fresh produce

                  <ArrowRight size={17} />
                </Button>
              </Link>

              <Link
                to="/farmers"
                className="
                  inline-flex
                  min-h-13.5
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[13px]
                  border
                  border-[#BFCFBA]
                  bg-white/40
                  px-6
                  text-[13px]
                  font-extrabold
                  text-[#244A28]
                  transition-all

                  hover:bg-white
                  hover:shadow-sm

                  sm:w-auto
                "
              >
                Meet local farmers

                <ArrowRight size={16} />
              </Link>
            </div>

            {/* =================================================
                TRUST FEATURES
            ================================================== */}

            <div
              className="
                mt-7
                flex
                flex-wrap
                gap-x-7
                gap-y-3
                border-t
                border-[#E4E1D9]
                pt-5
              "
            >
              <TrustItem
                icon={<Users size={16} />}
                text="Local farmers"
              />

              <TrustItem
                icon={<Leaf size={16} />}
                text="Fresh harvests"
              />

              <TrustItem
                icon={<ShieldCheck size={16} />}
                text="Secure checkout"
              />
            </div>
          </div>

          {/* =================================================
              RIGHT IMAGE AREA
          ================================================== */}

          <div
            className="
              relative
              z-10
              mx-auto
              w-full
              max-w-155

              lg:h-[min(70vh,560px)]
              lg:max-w-152.5
              xl:max-w-162.5
            "
          >
            {/* -----------------------------------------------
                BACK LAYER
            ------------------------------------------------ */}

            <div
              className="
                absolute
                -inset-x-3
                -bottom-3
                -top-3
                rounded-[38px]
                border
                border-[#DCE8D8]
                bg-[#F4F7EF]/70

                sm:-inset-x-4
                sm:-bottom-4
                sm:-top-4
              "
            />

            {/* -----------------------------------------------
                SECOND BACK FRAME
            ------------------------------------------------ */}

            <div
              className="
                absolute
                -inset-x-1
                -bottom-1
                -top-1
                rounded-[36px]
                border
                border-[#D7E3D2]
                bg-white/30
              "
            />

            {/* -----------------------------------------------
                MAIN IMAGE
            ------------------------------------------------ */}

            <div
              className="
                relative
                aspect-[0.84]
                w-full
                overflow-hidden
                rounded-[31px]
                bg-[#315E31]
                shadow-[0_30px_80px_rgba(30,65,30,0.20)]

                lg:h-full
                lg:aspect-auto
              "
            >
              <img
                src="/farmer_hero.png"
                alt="Local farmer with freshly harvested produce"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  object-center
                "
              />

              {/* Image overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-linear-to-t
                  from-[#102D13]/35
                  via-transparent
                  to-white/5
                "
              />

              {/* Subtle image border */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-[31px]
                  border
                  border-white/15
                "
              />
            </div>

            {/* =================================================
                FRESH HARVEST FLOATING CARD
            ================================================== */}

            <FloatingCard
              position="leftTop"
              icon={
                <Leaf
                  size={17}
                  strokeWidth={2}
                />
              }
              iconClass="bg-[#E9F2E5] text-[#2E6632]"
              title="Fresh harvest"
              subtitle="Harvested locally"
              check
            />

            {/* =================================================
                DIRECT FLOATING CARD
            ================================================== */}

            <FloatingCard
              position="rightTop"
              icon={
                <Tractor
                  size={17}
                  strokeWidth={2}
                />
              }
              iconClass="bg-[#F8EFD8] text-[#B17B0E]"
              title="Direct"
              subtitle="From farm to buyer"
            />

            {/* =================================================
                LOCAL FARMER CARD
            ================================================== */}

            <FloatingCard
              position="leftMiddle"
              icon={
                <Users
                  size={17}
                  strokeWidth={2}
                />
              }
              iconClass="bg-[#E9F2E5] text-[#2E6632]"
              title="Local"
              subtitle="Farmer network"
            />

            {/* =================================================
                TRUSTED CARD
            ================================================== */}

            <div
              className="
                absolute
                bottom-4
                right-3
                rounded-[19px]
                border
                border-white/70
                bg-white/95
                px-4
                py-3
                shadow-[0_15px_35px_rgba(30,50,30,0.16)]
                backdrop-blur-xl

                sm:bottom-5
                sm:right-5
                sm:px-5
                sm:py-3.5
              "
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FBF1D7] text-[#D59610]">
                  <Star
                    size={16}
                    fill="currentColor"
                  />
                </div>

                <div>
                  <p className="text-[12px] font-extrabold text-[#1D291D]">
                    Local & trusted
                  </p>

                  <p className="mt-0.5 text-[9px] font-medium text-[#8A8984]">
                    Know where your food comes from
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full bg-[#EAF1E5] text-[#376A3A]">
        {icon}
      </span>

      <span className="text-[11px] font-extrabold text-[#394239]">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   FLOATING CARD
========================================================= */

function FloatingCard({
  position,
  icon,
  iconClass,
  title,
  subtitle,
  check = false,
}: {
  position:
    | "leftTop"
    | "rightTop"
    | "leftMiddle";

  icon: React.ReactNode;

  iconClass: string;

  title: string;

  subtitle: string;

  check?: boolean;
}) {
  const positions = {
    leftTop:
      "left-4 top-6 sm:left-6 sm:top-8",

    rightTop:
      "right-3 top-12 sm:right-5 sm:top-14",

    leftMiddle:
      "left-[-12px] top-[46%] sm:left-[-20px]",
  };

  return (
    <div
      className={`
        absolute
        z-20
        rounded-[18px]
        border
        border-white/80
        bg-white/95
        p-3
        shadow-[0_15px_35px_rgba(30,50,30,0.15)]
        backdrop-blur-xl
        ${positions[position]}
      `}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-extrabold text-[#1E291F]">
              {title}
            </p>

            {check && (
              <Check
                size={14}
                strokeWidth={2.5}
                className="text-[#34723A]"
              />
            )}
          </div>

          <p className="mt-0.5 whitespace-nowrap text-[9px] font-medium text-[#999790]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DECORATIVE LEAF
========================================================= */

function DecorativeLeaf({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={`h-12 w-12 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M67 9C43 9 21 18 14 39C9 55 17 67 32 69C51 71 66 51 67 9Z"
        fill="currentColor"
        fillOpacity="0.65"
      />

      <path
        d="M17 63C27 47 39 34 59 18"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}