import type { Product } from "../data/products";
import MarketplaceProductCard from "./MarketplaceProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div
        className="
          rounded-[28px]
          border border-dashed border-[#C9D4C5]
          bg-white
          px-6 py-20
          text-center
          shadow-[0_8px_30px_rgba(23,54,21,0.05)]
        "
      >
        {/* Icon */}
        <div
          className="
            mx-auto
            flex h-16 w-16
            items-center justify-center
            rounded-2xl
            bg-[#F3F8F1]
            text-3xl
            shadow-sm
          "
        >
          🥬
        </div>

        {/* Heading */}
        <h3
          className="
            mt-6
            text-2xl
            font-extrabold
            tracking-[-0.03em]
            text-[#173615]
            sm:text-3xl
          "
        >
          No produce found
        </h3>

        {/* Description */}
        <p
          className="
            mx-auto mt-3
            max-w-lg
            text-sm
            leading-6
            text-[#6F7B6B]
            sm:text-base
          "
        >
          We couldn't find any produce matching your current search and
          filters. Try adjusting your filters or explore more fresh produce
          from local farmers.
        </p>

        {/* CTA */}
        <button
          type="button"
          className="
            mt-7
            inline-flex
            items-center justify-center
            rounded-xl
            bg-forest-700
            px-6 py-3
            text-sm
            font-bold
            text-white
            shadow-[0_7px_18px_rgba(45,90,39,0.20)]
            transition-all duration-200
            hover:bg-[#173615]
            hover:-translate-y-0.5
            hover:shadow-[0_10px_24px_rgba(23,54,21,0.22)]
            active:translate-y-0
            active:scale-[0.98]
          "
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-5
        md:grid-cols-2
        lg:grid-cols-3
        lg:gap-6
      "
    >
      {products.map((product) => (
        <MarketplaceProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}