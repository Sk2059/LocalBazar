import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  MapPin,
  Star,
  Sprout,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

import Container from "../../../../components/common/Container";

type Farmer = {
  id: number;
  name: string;
  farmName: string;
  location: string;
  image: string;
  farmImage: string;
  rating: number;
  reviews: number;
  products: number;
  farmingType: string;
  story: string;
};

const farmers: Farmer[] = [
  {
    id: 1,
    name: "Ramesh Kumar",
    farmName: "Hari Organic Farm",
    location: "Biratnagar, Morang",
    image: "/images/farmers/ramesh.png",
    farmImage: "/images/farmers/rameshfarm.png",
    rating: 4.9,
    reviews: 46,
    products: 18,
    farmingType: "Organic farming",
    story:
      "Growing fresh vegetables with traditional farming practices and care for the soil.",
  },
  {
    id: 2,
    name: "Mina Rai",
    farmName: "Koshi Green Farm",
    location: "Itahari, Sunsari",
    image: "/images/farmers/mina.png",
    farmImage: "/images/farmers/mina-farm.png",
    rating: 4.8,
    reviews: 38,
    products: 14,
    farmingType: "Natural farming",
    story:
      "A family-run farm focused on seasonal vegetables and sustainable local agriculture.",
  },
  {
    id: 3,
    name: "Dilip Chaudhary",
    farmName: "Green Valley Farm",
    location: "Birat Chowk, Morang",
    image: "/images/farmers/dilip.png",
    farmImage: "/images/farmers/dilip-farm.png",
    rating: 4.9,
    reviews: 52,
    products: 22,
    farmingType: "Sustainable farming",
    story:
      "Providing naturally grown produce to families across the Koshi region.",
  },
];

export default function FarmerSpotlight() {
  return (
    <section className="relative overflow-hidden bg-[#F7F6F0] py-20 sm:py-24 lg:py-28">
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-20 size-125 rounded-full bg-[#EAF2E6] blur-3xl" />

        <div className="absolute -right-48 bottom-0 size-112.5 rounded-full bg-[#F4E7C9]/50 blur-3xl" />
      </div>

      <Container className="relative">
        {/* =================================================
            SECTION HEADER
        ================================================== */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-7 bg-[#D5A82E]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A57916]">
                Know your farmer
              </span>
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
              Meet the people
              <span className="text-[#316934]">
                {" "}
                behind your food.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6B6D67] sm:text-[15px]">
              Discover the farmers who grow the produce you
              love. Shop directly from trusted local farms and
              support the people behind Koshi's agriculture.
            </p>
          </div>

          <Link
            to="/farmers"
            className="
              group
              inline-flex
              shrink-0
              items-center
              gap-2
              self-start
              rounded-xl
              border
              border-[#D5DED1]
              bg-white/70
              px-4
              py-3
              text-xs
              font-extrabold
              text-[#315F32]
              transition-all

              hover:border-[#B8CCB2]
              hover:bg-white
              hover:shadow-md

              lg:self-end
            "
          >
            Explore all farmers

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* =================================================
            FARMER CARDS
        ================================================== */}

        <div
          className="
            mt-10
            grid
            gap-5

            md:grid-cols-2

            lg:mt-12
            lg:grid-cols-3
          "
        >
          {farmers.map((farmer) => (
            <FarmerCard
              key={farmer.id}
              farmer={farmer}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* =========================================================
   FARMER CARD
========================================================= */

function FarmerCard({
  farmer,
}: {
  farmer: Farmer;
}) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[26px]
        border
        border-[#DFE5DB]
        bg-white
        shadow-[0_8px_30px_rgba(35,55,35,0.05)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#CBDCC6]
        hover:shadow-[0_20px_50px_rgba(35,65,35,0.11)]
      "
    >
      {/* =================================================
          FARM IMAGE
      ================================================== */}

      <div className="relative h-56.25 overflow-hidden">
        <img
          src={farmer.farmImage}
          alt={`${farmer.farmName} farm`}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700

            group-hover:scale-105
          "
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#102D13]/55 via-transparent to-black/5" />

        {/* Farming type */}

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/40 bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-md">
          <Sprout
            size={13}
            className="text-[#316934]"
          />

          <span className="text-[9px] font-extrabold text-[#315F32]">
            {farmer.farmingType}
          </span>
        </div>

        {/* Rating */}

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 text-white backdrop-blur-md">
          <Star
            size={12}
            fill="currentColor"
            className="text-[#F1C85B]"
          />

          <span className="text-[10px] font-extrabold">
            {farmer.rating}
          </span>

          <span className="text-[9px] text-white/75">
            ({farmer.reviews})
          </span>
        </div>

        {/* Product count */}

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 backdrop-blur-md">
          <Store
            size={12}
            className="text-[#316934]"
          />

          <span className="text-[9px] font-extrabold text-[#315F32]">
            {farmer.products} products
          </span>
        </div>
      </div>

      {/* =================================================
          FARMER PROFILE
      ================================================== */}

      <div className="relative px-5 pb-5">
        {/* Avatar */}

        <div className="-mt-9 relative z-10">
          <div className="size-17.5 rounded-2xl border-4 border-white bg-[#E9F0E5] shadow-[0_8px_20px_rgba(30,55,30,0.12)]">
            <img
              src={farmer.image}
              alt={farmer.name}
              loading="lazy"
              className="h-full w-full rounded-[13px] object-cover"
            />
          </div>
        </div>

        {/* Name */}

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[16px] font-extrabold text-[#202A21]">
              {farmer.name}
            </h3>

            <BadgeCheck
              size={17}
              fill="#E8F2E4"
              className="text-[#34733A]"
            />
          </div>

          <p className="mt-1 text-[11px] font-bold text-[#697066]">
            {farmer.farmName}
          </p>

          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-[#999B94]">
            <MapPin size={11} />

            {farmer.location}
          </div>
        </div>

        {/* Story */}

        <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-[#747870]">
          {farmer.story}
        </p>

        {/* Divider */}

        <div className="my-4 border-t border-[#ECEAE4]" />

        {/* View farm */}

        <Link
          to={`/farmers/${farmer.id}`}
          className="
            group/link
            flex
            items-center
            justify-between
            rounded-xl
            bg-[#F1F6EE]
            px-4
            py-3
            transition-all

            hover:bg-[#E7F0E3]
          "
        >
          <span className="text-[11px] font-extrabold text-[#315F32]">
            Visit {farmer.farmName}
          </span>

          <span className="grid size-7 place-items-center rounded-full bg-white text-[#316934] shadow-sm transition-transform group-hover/link:translate-x-0.5">
            <ChevronRight size={14} />
          </span>
        </Link>
      </div>
    </article>
  );
}