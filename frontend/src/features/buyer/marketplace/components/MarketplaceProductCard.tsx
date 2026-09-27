import {
  Heart,
  MapPin,
  Plus,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { useCart } from "../../../../context/CartContext";

interface MarketplaceProductCardProps {
  product: Product;
}

export default function MarketplaceProductCard({
  product,
}: MarketplaceProductCardProps) {
  const [liked, setLiked] = useState(false);
  const { addToCart } = useCart();

  const isLowStock = product.stock <= 10;

  const badgeText = product.isSeasonal ? "Seasonal" : product.farmingMethod;

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-[#E6E4DE]
        bg-white
        shadow-[0_8px_28px_rgba(35,55,35,0.045)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#D2DFCD]
        hover:shadow-[0_18px_45px_rgba(35,65,35,0.10)]
      "
    >
      {/* =====================================================
          IMAGE
          ===================================================== */}
      <div className="relative aspect-[1.05] overflow-hidden bg-[#EFF4EB]">
          <img
            src={product.image}
            alt={product.name}
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

          {/* Image gradient */}

          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />

          {/* Badge */}

          <span
            className="
              absolute
              left-3
              top-3
              rounded-full
              border
              border-white/60
              bg-white/90
              px-2.5
              py-1.5
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.08em]
              text-[#316934]
              shadow-sm
              backdrop-blur-md
            "
          >
            {badgeText}
          </span>

          {/* Wishlist */}

          <button
            type="button"
            aria-label={`Add ${product.name} to wishlist`}
            onClick={() => setLiked(!liked)}
            className="
              absolute
              right-3
              top-3
              z-20
              grid
              size-9
              place-items-center
              rounded-full
              border
              border-white/60
              bg-white/90
              text-[#555951]
              shadow-sm
              backdrop-blur-md
              transition-all

              hover:bg-white
              hover:text-[#B84C43]
            "
          >
            <Heart
              size={16}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-[#B84C43]" : ""}
            />
          </button>

          {/* Farmer + category */}

          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-[11px] font-extrabold drop-shadow-md">
                {product.farmer.farmName}

                {product.farmer.verified && (
                  <ShieldCheck size={12} className="shrink-0 text-white" />
                )}
              </p>

              <span className="mt-1 inline-flex rounded-full bg-black/25 px-2.5 py-1 text-[9px] font-bold backdrop-blur-md">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENT
            ===================================================== */}
        <div className="p-4">
          {/* Product name */}

          <Link
            to={`/marketplace/product/${product.slug}`}
            className="block after:absolute after:inset-0 after:content-['']"
            aria-label={`View ${product.name} product details`}
          >
            <h3 className="line-clamp-2 text-[15px] font-extrabold leading-tight text-[#202A21] transition-colors group-hover:text-[#316934]">
              {product.name}
            </h3>
          </Link>

          {/* Location */}

          <div className="mt-1 flex items-center gap-1 text-[9px] text-[#969791]">
            <MapPin size={10} />

            {product.farmer.location}
          </div>

          {/* Divider */}

          <div className="my-3 border-t border-[#EEECE6]" />

          {/* Price + Add */}

          <div className="flex items-end justify-between gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#92938D]">
                  Regular
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[17px] font-black tracking-tight text-[#234A27]">
                  Rs. {product.pricePerKg}
                  <span className="ml-0.5 text-[9px] font-semibold text-[#92938D]">
                    /{product.unit}
                  </span>
                </p>
              </div>

              <div className="border-l border-[#EEECE6] pl-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-forest-700">
                  Bulk
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[14px] font-extrabold text-forest-700">
                  Rs. {product.bulkPrice}
                  <span className="ml-0.5 text-[9px] font-semibold">
                    /{product.unit}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => addToCart(product)}
                aria-label={`Add ${product.name} to cart`}
                className="
                  relative
                  z-20
                  grid
                  size-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-[#2F6633]
                  text-white
                  shadow-[0_7px_16px_rgba(47,102,51,0.18)]
                  transition-all

                  hover:bg-[#25572A]
                  hover:shadow-[0_9px_20px_rgba(47,102,51,0.25)]

                  active:scale-95
                "
              >
                <Plus size={18} />
              </button>

              <div
                className="flex items-center gap-0.5 text-[#D69B18]"
                aria-label={`${product.rating} out of 5 stars`}
              >
                <Star size={12} fill="currentColor" />

                <span className="text-[10px] font-extrabold text-[#4D514B]">
                  {product.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Stock */}

          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${
                isLowStock ? "bg-[#B84C3A]" : "bg-[#5E9A58]"
              }`}
            />

            <span
              className={`text-[9px] font-bold ${
                isLowStock ? "text-[#B84C3A]" : "text-[#6E756B]"
              }`}
            >
              {isLowStock
                ? `Only ${product.stock} left`
                : `${product.stock} available`}
            </span>
          </div>
        </div>

    </article>
  );
}