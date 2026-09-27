import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Container from "../../../components/common/Container";

// ============================================================
// FARMER DATA
// ============================================================

const farmersData = [
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
    farmingType: "Organic",
    story:
      "Growing fresh vegetables with traditional farming practices and care for the soil.",
    joined: "2021",
    verified: true,
    categories: ["Vegetables", "Leafy Greens"],
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
    farmingType: "Natural",
    story:
      "A family-run farm focused on seasonal vegetables and sustainable local agriculture.",
    joined: "2022",
    verified: true,
    categories: ["Vegetables", "Fruits"],
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
    farmingType: "Sustainable",
    story:
      "Providing naturally grown produce to families across the Koshi region.",
    joined: "2020",
    verified: true,
    categories: ["Grains & Pulses", "Seasonal"],
  },
  {
    id: 4,
    name: "Sunita Thapa",
    farmName: "Sunita's Garden",
    location: "Dharan, Sunsari",
    image: "/images/farmers/ramesh.png",
    farmImage: "/images/farmers/rameshfarm.png",
    rating: 4.7,
    reviews: 29,
    products: 11,
    farmingType: "Organic",
    story:
      "Dedicated to growing pesticide-free produce for local families in Dharan.",
    joined: "2023",
    verified: false,
    categories: ["Fruits", "Leafy Greens"],
  },
  {
    id: 5,
    name: "Bishnu Prasad",
    farmName: "Madhesh Fruit Farm",
    location: "Rajbiraj, Saptari",
    image: "/images/farmers/dilip.png",
    farmImage: "/images/farmers/dilip-farm.png",
    rating: 4.6,
    reviews: 33,
    products: 16,
    farmingType: "Natural",
    story:
      "Seasonal fruits and tropical produce direct from the Terai plains.",
    joined: "2021",
    verified: true,
    categories: ["Fruits", "Seasonal"],
  },
  {
    id: 6,
    name: "Kamala Gurung",
    farmName: "Hill Fresh Farm",
    location: "Dhankuta, Koshi",
    image: "/images/farmers/mina.png",
    farmImage: "/images/farmers/mina-farm.png",
    rating: 4.8,
    reviews: 41,
    products: 19,
    farmingType: "Organic",
    story:
      "Hill-grown organic vegetables delivered fresh to the plains.",
    joined: "2022",
    verified: true,
    categories: ["Vegetables", "Grains & Pulses"],
  },
];

type Farmer = (typeof farmersData)[number];

// ============================================================
// MAIN PAGE
// ============================================================

export default function FarmersPage() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("All");

  const methods = ["All", "Organic", "Natural", "Sustainable"];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return farmersData.filter((farmer) => {
      const matchesSearch =
        !query ||
        farmer.name.toLowerCase().includes(query) ||
        farmer.farmName.toLowerCase().includes(query) ||
        farmer.location.toLowerCase().includes(query);

      const matchesMethod =
        method === "All" || farmer.farmingType === method;

      return matchesSearch && matchesMethod;
    });
  }, [search, method]);

  const clearFilters = () => {
    setSearch("");
    setMethod("All");
  };

  const hasFilters = search.trim().length > 0 || method !== "All";

  return (
    <main className="min-h-screen bg-[#FCFBF7]">
      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative h-[22vh] min-h-47.5 max-h-58.75 overflow-hidden bg-[#173615]">
        {/* Premium background */}
        <div className="pointer-events-none absolute inset-0">
          {/* Main gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,#173615_0%,#245120_55%,#2D5A27_100%)]" />

          {/* Gold glow */}
          <div className="absolute -right-20 -top-28 size-72 rounded-full bg-[#E5B73A]/15 blur-3xl" />

          {/* Green glow */}
          <div className="absolute -bottom-32 left-[28%] size-64 rounded-full bg-[#7AA86E]/15 blur-3xl" />

          {/* Soft light */}
          <div className="absolute right-[30%] top-1/2 size-40 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

          {/* Botanical shape */}
          <Leaf
            className="absolute -right-5 top-1/2 hidden -translate-y-1/2 rotate-[-20deg] text-white/[0.07] lg:block"
            size={170}
            strokeWidth={0.8}
          />
        </div>

        <Container className="relative flex h-full items-center">
          <div className="grid w-full items-center gap-6 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
            {/* LEFT */}
            <div className="text-center lg:text-left">
              <div className="mb-2 inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#E5B73A]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#E5B73A] sm:text-[10px]">
                  Koshi Province
                </span>
              </div>

              <h1 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl lg:text-[42px]">
                Meet the farmers
                <span className="block text-[#E5B73A]">
                  behind your food.
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-[11px] leading-4 text-[#D5E9D2] sm:text-xs">
                Discover trusted local farmers and the fresh produce they grow
                across Koshi.
              </p>
            </div>

            {/* RIGHT — SEARCH */}
            <div className="w-full">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-300 focus-within:border-[#E5B73A]/50 focus-within:bg-white/15 focus-within:ring-4 focus-within:ring-[#E5B73A]/10">
                <div className="flex items-center rounded-xl bg-white">
                  <div className="ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F8F1] text-forest-700 sm:size-10">
                    <Search className="size-4" strokeWidth={2.2} />
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search farmers or farms..."
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs text-[#173615] outline-none placeholder:text-[#8B9589] sm:px-4 sm:text-sm"
                    aria-label="Search farmers"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mr-1 flex size-7 items-center justify-center rounded-full text-[#7C877A] transition hover:bg-[#F3F8F1] hover:text-forest-700"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    className="mr-0.5 rounded-lg bg-[#E5B73A] px-4 py-2.5 text-xs font-bold text-[#173615] transition hover:bg-[#F0C95A] sm:px-5 sm:text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================
          FILTER BAR
      ======================================================== */}

      <section className="sticky top-18 z-20 border-b border-[#E7E4DC] bg-[#FCFBF7]/95 backdrop-blur-xl">
        <Container className="py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Result count */}
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#F3F8F1]">
                <Leaf className="size-3.5 text-forest-700" />
              </div>

              <p className="text-xs text-[#6B7667]">
                <span className="font-bold text-[#173615]">
                  {filtered.length}
                </span>{" "}
                farmer{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Methods */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {methods.map((item) => {
                const active = method === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMethod(item)}
                    className={[
                      "shrink-0 rounded-lg px-3.5 py-2 text-[10px] font-bold transition-all duration-200",
                      active
                        ? "bg-[#173615] text-white shadow-[0_5px_14px_rgba(23,54,21,0.18)]"
                        : "border border-[#E0E4DC] bg-white text-[#657062] hover:border-[#AFC3AA] hover:bg-[#F3F8F1] hover:text-forest-700",
                    ].join(" ")}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================
          FARMERS
      ======================================================== */}

      <Container className="py-7 sm:py-9">
        {/* Active filters */}
        {hasFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium text-[#7B8578]">
              Filters:
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F8F1] px-2.5 py-1.5 text-[10px] font-semibold text-forest-700"
              >
                {search}
                <X className="size-3" />
              </button>
            )}

            {method !== "All" && (
              <button
                type="button"
                onClick={() => setMethod("All")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F8F1] px-2.5 py-1.5 text-[10px] font-semibold text-forest-700"
              >
                {method}
                <X className="size-3" />
              </button>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-semibold text-[#8A9287] underline underline-offset-2 hover:text-forest-700"
            >
              Clear
            </button>
          </div>
        )}

        {/* Cards */}
        {filtered.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((farmer) => (
              <FarmerCard key={farmer.id} farmer={farmer} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

// ============================================================
// FARMER CARD
// ============================================================

function FarmerCard({ farmer }: { farmer: Farmer }) {
  return (
    <Link
      to={`/farmers/${farmer.id}`}
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#F3F8F1] bg-[#FCFBF7] shadow-[0_8px_24px_rgba(23,54,21,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-forest-700 hover:shadow-[0_20px_44px_rgba(23,54,21,0.14)]">
        <div className="relative aspect-16/10 overflow-hidden bg-[#F3F8F1]">
          <img
            src={farmer.farmImage}
            alt={`${farmer.farmName} farm`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-[#173615]/80 via-[#173615]/10 to-transparent" />

          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-[#173615]/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
              {farmer.farmingType}
            </span>

            <div className="flex items-center gap-1.5 rounded-full bg-[#FCFBF7]/95 px-3 py-1.5 text-xs font-extrabold text-[#173615] shadow-lg">
              <Star size={13} fill="#E5B73A" className="text-[#E5B73A]" />
              {farmer.rating}
            </div>
          </div>

          <p className="absolute bottom-4 right-4 max-w-[75%] truncate text-right text-xs font-bold uppercase tracking-[0.16em] text-white/80">
            {farmer.location}
          </p>
        </div>

        <div className="relative z-10 -mt-8 px-5">
          <div className="size-16 overflow-hidden rounded-2xl border-4 border-[#FCFBF7] bg-[#F3F8F1] shadow-[0_6px_18px_rgba(23,54,21,0.18)] transition-transform duration-300 group-hover:scale-105">
            <img
              src={farmer.image}
              alt={farmer.name}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-extrabold tracking-tight text-[#173615] transition-colors duration-200 group-hover:text-forest-700">
                {farmer.name}
              </h3>

              <p className="mt-1 truncate text-sm font-semibold text-forest-700">
                {farmer.farmName}
              </p>
            </div>

            {farmer.verified && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F3F8F1] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-forest-700">
                <BadgeCheck size={14} />
                Verified
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-forest-700">
            <MapPin size={14} className="shrink-0 text-forest-700" />
            <span className="truncate">Fresh produce from {farmer.location}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 divide-x divide-forest-700/20 rounded-2xl border border-[#F3F8F1] bg-[#F3F8F1] py-3">
            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700/70">
                Products
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-[#173615]">
                {farmer.products}
              </p>
            </div>

            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700/70">
                Reviews
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-[#173615]">
                {farmer.reviews}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {farmer.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full border border-forest-700/20 bg-[#F3F8F1] px-2.5 py-1 text-[10px] font-bold text-forest-700"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#F3F8F1] pt-4">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-forest-700/70">
                Discover
              </span>
              <span className="text-xs font-bold text-forest-700">
                Explore this farm
              </span>
            </div>

            <span className="flex size-10 items-center justify-center rounded-xl bg-[#173615] text-white shadow-[0_6px_14px_rgba(23,54,21,0.16)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-forest-700">
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#CBD6C8] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[#F3F8F1] text-forest-700">
        <Search className="size-6" />
      </div>

      <h2 className="mt-4 font-display text-xl font-semibold text-[#173615]">
        No farmers found
      </h2>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#7A8575]">
        Try another farmer name, farm name, location, or farming method.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-xl bg-[#173615] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-forest-700"
      >
        Clear filters
      </button>
    </div>
  );
}