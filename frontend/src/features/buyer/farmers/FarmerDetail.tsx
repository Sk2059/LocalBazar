import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Leaf,
  MapPin,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useFarmer, useFarmerProducts } from "./data/hooks";
import { toMarketplaceProduct } from "../marketplace/data/adaptProduct";

export default function FarmerDetail() {
  const { farmerId } = useParams<{ farmerId: string }>();

  const farmerIdNumber = Number(farmerId);

  const { data: farmer, isLoading, isError } = useFarmer(farmerIdNumber);

  const { data: farmerProductsData } = useFarmerProducts(farmerIdNumber);

  const farmerProducts = (farmerProductsData?.results ?? []).map(
    toMarketplaceProduct,
  );

  /*
  |--------------------------------------------------------------------------
  | Loading / failed to load / not found
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FCFBF7] px-4">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-[#E2E7DE] border-t-forest-700" />

          <p className="mt-5 text-sm font-semibold text-[#707A6E]">
            Loading farm…
          </p>
        </div>
      </main>
    );
  }

  if (isError || !farmer) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FCFBF7] px-4">
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#F3F8F1]">
            <Leaf
              size={28}
              className="text-forest-700"
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#173615]">
            {isError ? "Couldn't load this farm" : "Farmer not found"}
          </h1>

          <p className="mt-2 text-sm text-[#707A6E]">
            {isError
              ? "Something went wrong reaching this farm. Please try again."
              : "The farmer you're looking for doesn't exist."}
          </p>

          <Link
            to="/farmers"
            className="
              mt-6 inline-flex items-center gap-2
              rounded-xl
              bg-[#173615]
              px-5 py-3
              text-sm font-bold
              text-white
              transition
              hover:bg-forest-700
            "
          >
            <ArrowLeft size={16} />
            Back to farmers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFBF7]">

      {/* ============================================================
          HERO
      ============================================================ */}

      <section className="relative overflow-hidden bg-[#173615]">

        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#173615_0%,#21491D_50%,#2D5A27_100%)]" />

          <div className="absolute -right-24 -top-32 size-96 rounded-full bg-[#E5B73A]/10 blur-3xl" />

          <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-[#5F9257]/20 blur-3xl" />

          <div className="absolute right-[30%] top-1/2 size-56 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* Back */}
          <Link
            to="/farmers"
            className="
              inline-flex items-center gap-2
              text-xs font-bold
              text-[#D5E9D2]
              transition-colors
              hover:text-white
            "
          >
            <ArrowLeft size={15} />
            Back to farmers
          </Link>

          <div className="mt-6 grid items-center gap-7 pb-8 lg:grid-cols-[auto_1fr]">

            {/* Farmer photo */}
            <div className="relative mx-auto lg:mx-0">
              <div
                className="
                  size-28 overflow-hidden
                  rounded-3xl
                  border-4 border-white/15
                  bg-white/10
                  shadow-2xl
                  sm:size-36
                "
              >
                <img
                  src={farmer.image}
                  alt={farmer.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {farmer.verified && (
                <div
                  className="
                    absolute -bottom-2 -right-2
                    flex size-9 items-center justify-center
                    rounded-full
                    border-4 border-[#173615]
                    bg-[#E5B73A]
                  "
                >
                  <BadgeCheck
                    size={17}
                    className="text-[#173615]"
                  />
                </div>
              )}
            </div>

            {/* Farmer information */}
            <div className="text-center lg:text-left">

              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">

                <span
                  className="
                    rounded-full
                    bg-[#E5B73A]
                    px-3 py-1.5
                    text-[10px] font-extrabold
                    uppercase tracking-wider
                    text-[#173615]
                  "
                >
                  {farmer.farmingType}
                </span>

                {farmer.verified && (
                  <span
                    className="
                      inline-flex items-center gap-1.5
                      rounded-full
                      border border-white/15
                      bg-white/10
                      px-3 py-1.5
                      text-[10px] font-bold
                      text-white
                      backdrop-blur-md
                    "
                  >
                    <BadgeCheck size={12} />
                    Verified Farmer
                  </span>
                )}

              </div>

              <h1
                className="
                  mt-3
                  font-display
                  text-3xl font-semibold
                  tracking-tight text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {farmer.name}
              </h1>

              <p className="mt-1 text-base font-semibold text-[#D5E9D2]">
                {farmer.farmName}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#D5E9D2] lg:justify-start">

                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {farmer.location}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Star
                    size={14}
                    fill="#E5B73A"
                    className="text-[#E5B73A]"
                  />

                  <strong className="text-white">
                    {farmer.rating}
                  </strong>

                  ({farmer.orders} orders)
                </span>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Stats */}
        <div
          className="
            grid grid-cols-2
            overflow-hidden
            rounded-2xl
            border border-[#E2E7DE]
            bg-white
            shadow-[0_8px_28px_rgba(23,54,21,0.06)]
            sm:grid-cols-4
          "
        >
          <Stat
            label="Products"
            value={String(farmer.products)}
          />

          <Stat
            label="Orders"
            value={String(farmer.orders)}
          />

          <Stat
            label="Rating"
            value={`${farmer.rating}/5`}
          />

          <Stat
            label="Member since"
            value={farmer.joined}
          />
        </div>

        {/* ============================================================
            ABOUT FARM
        ============================================================ */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          <div className="flex flex-col justify-center">

            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-harvest-500">
              About the farm
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold text-[#173615] sm:text-4xl">
              Grown with care.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#687365]">
              {farmer.story}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {farmer.categories.map((category) => (
                <span
                  key={category}
                  className="
                    rounded-full
                    border border-[#DDE7D9]
                    bg-[#F3F8F1]
                    px-3 py-1.5
                    text-xs font-bold
                    text-forest-700
                  "
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Farm image */}
          <div className="relative h-64 overflow-hidden rounded-3xl sm:h-72">

            <img
              src={farmer.farmImage}
              alt={farmer.farmName}
              className="
                h-full w-full object-cover
                transition-transform duration-500
                hover:scale-105
              "
            />

            <div className="absolute inset-0 bg-linear-to-t from-[#173615]/75 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5">
              <p className="text-xs font-medium text-white/75">
                Farming locally in
              </p>

              <p className="mt-1 text-lg font-extrabold text-white">
                {farmer.location}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            PRODUCTS
        ============================================================ */}

        <div className="mt-14">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-harvest-500">
                From this farm
              </p>

              <h2 className="mt-2 font-display text-3xl font-semibold text-[#173615] sm:text-4xl">
                Fresh from {farmer.farmName}
              </h2>

              <p className="mt-2 text-sm text-[#6B7567]">
                Browse produce currently available from this farmer.
              </p>
            </div>

            <div className="rounded-full bg-[#F3F8F1] px-3 py-1.5 text-xs font-bold text-forest-700">
              {farmerProducts.length} products available
            </div>

          </div>

          {/* Product grid */}
          {farmerProducts.length > 0 ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {farmerProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/marketplace/product/${product.slug}`}
                  className="group"
                >
                  <article
                    className="
                      overflow-hidden
                      rounded-2xl
                      border border-[#E3E8E0]
                      bg-white
                      shadow-[0_4px_16px_rgba(23,54,21,0.05)]
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:border-[#B8CCB3]
                      hover:shadow-[0_16px_35px_rgba(23,54,21,0.12)]
                    "
                  >

                    {/* Product image */}
                    <div className="relative h-48 overflow-hidden bg-[#F3F8F1]">

                      <img
                        src={product.image}
                        alt={product.name}
                        className="
                          h-full w-full object-cover
                          transition-transform duration-500
                          group-hover:scale-105
                        "
                      />

                      {/* Farming method */}
                      <span
                        className="
                          absolute left-3 top-3
                          rounded-full
                          bg-white/95
                          px-2.5 py-1
                          text-[10px] font-extrabold
                          text-forest-700
                          shadow-sm
                        "
                      >
                        {product.farmingMethod}
                      </span>

                      {/* Seasonal */}
                      {product.isSeasonal && (
                        <span
                          className="
                            absolute right-3 top-3
                            rounded-full
                            bg-[#E5B73A]
                            px-2.5 py-1
                            text-[10px] font-extrabold
                            text-[#173615]
                            shadow-sm
                          "
                        >
                          Seasonal
                        </span>
                      )}
                    </div>

                    {/* Product content */}
                    <div className="p-4">

                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#7B8777]">
                        {product.category}
                      </p>

                      <h3
                        className="
                          mt-1
                          text-base font-extrabold
                          text-[#173615]
                          transition-colors
                          group-hover:text-forest-700
                        "
                      >
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <Star
                          size={13}
                          fill="#E5B73A"
                          className="text-[#E5B73A]"
                        />

                        <span className="font-bold text-[#173615]">
                          {product.rating}
                        </span>

                        <span className="text-[#8A9185]">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-4 flex items-center justify-between">

                        <div>
                          <span className="text-lg font-extrabold text-[#173615]">
                            Rs. {product.pricePerKg} / kg
                          </span>

                          <span className="ml-1 text-xs text-[#7B8479]">
                            /{product.unit}
                          </span>
                        </div>

                        <span
                          className="
                            flex size-9 items-center justify-center
                            rounded-xl
                            bg-[#173615]
                            text-white
                            transition-all
                            group-hover:bg-forest-700
                            group-hover:scale-105
                          "
                        >
                          <ShoppingCart size={16} />
                        </span>

                      </div>

                      {/* Stock */}
                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-[11px] font-medium text-[#778071]">
                          {product.stock} {product.unit} available
                        </span>

                        <ArrowRight
                          size={14}
                          className="
                            text-[#A5ADA1]
                            transition-all
                            group-hover:translate-x-1
                            group-hover:text-forest-700
                          "
                        />

                      </div>
                    </div>
                  </article>
                </Link>
              ))}

            </div>
          ) : (
            <div
              className="
                mt-7 rounded-2xl
                border border-[#E2E7DE]
                bg-white
                p-10 text-center
              "
            >
              <Leaf
                size={30}
                className="mx-auto text-forest-700"
              />

              <h3 className="mt-3 font-bold text-[#173615]">
                No products available
              </h3>

              <p className="mt-1 text-sm text-[#737C70]">
                This farmer hasn't listed any products yet.
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Stats component
|--------------------------------------------------------------------------
*/

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        border-b border-[#EEF0EB]
        px-4 py-5
        text-center
        sm:border-b-0
        sm:border-l
        first:sm:border-l-0
      "
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A8475]">
        {label}
      </p>

      <p className="mt-1 text-lg font-extrabold text-[#173615]">
        {value}
      </p>
    </div>
  );
}