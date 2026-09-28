import {
  ArrowRight,
  MapPin,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Container from "../../../../components/common/Container";

import MarketplaceProductCard from "../../marketplace/components/MarketplaceProductCard";

import type { Product } from "../../marketplace/data/products";

import { toMarketplaceProduct } from "../../marketplace/data/adaptProduct";

import { getProducts } from "../../marketplace/data/api";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts({
          page: 1,
          page_size: 8,
          is_featured: true,
          ordering: "-created_at",
        });

        if (!mounted) return;

        const mappedProducts = response.results.map(
          toMarketplaceProduct,
        );

        setProducts(mappedProducts.slice(0, 8));
      } catch (err) {
        console.error(
          "Failed to load featured products:",
          err,
        );

        if (mounted) {
          setError(
            "Unable to load fresh products right now.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFeaturedProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-48 top-10 size-112.5 rounded-full bg-[#EEF5EA] blur-3xl" />

        <div className="absolute -left-48 bottom-0 size-100 rounded-full bg-[#FBF2DC]/60 blur-3xl" />
      </div>

      <Container className="relative">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-7 bg-[#D5A82E]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A57916]">
                Fresh today
              </span>
            </div>

            <h2
              className="
                max-w-2xl
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
              Fresh from
              <span className="text-[#316934]">
                {" "}
                nearby farms.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6B6D67] sm:text-[15px]">
              Discover produce harvested by local farmers
              and delivered fresh to your doorstep.
            </p>
          </div>

          {/* View all */}
          <Link
            to="/marketplace"
            className="
              group
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-[#D5DED1]
              bg-[#FAFCF8]
              px-4
              py-3
              text-xs
              font-extrabold
              text-[#315F32]
              transition-all

              hover:border-[#B9CDB4]
              hover:bg-white
              hover:shadow-md
            "
          >
            View all products

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {loading ? (
          <FeaturedProductsSkeleton />
        ) : error ? (
          <FeaturedProductsError />
        ) : products.length === 0 ? (
          <FeaturedProductsEmpty />
        ) : (
          <div
            className="
              mt-10
              grid
              gap-5

              sm:grid-cols-2

              lg:mt-12
              lg:grid-cols-4
            "
          >
            {products.slice(0, 8).map((product) => (
              <MarketplaceProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        {/* =====================================================
            TRUST STRIP
        ===================================================== */}

        {!loading && !error && products.length > 0 && (
          <div
            className="
              mt-10
              grid
              gap-px
              overflow-hidden
              rounded-2xl
              border
              border-[#E0E7DC]
              bg-[#E0E7DC]

              sm:grid-cols-3
            "
          >
            <InfoItem
              icon={<Truck size={18} />}
              title="Fresh delivery"
              description="From local farms to your door"
            />

            <InfoItem
              icon={<MapPin size={18} />}
              title="Local farmers"
              description="Know exactly where your food comes from"
            />

            <InfoItem
              icon={<ShoppingCart size={18} />}
              title="Easy shopping"
              description="Simple, secure and convenient checkout"
            />
          </div>
        )}
      </Container>
    </section>
  );
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function FeaturedProductsSkeleton() {
  return (
    <div
      className="
        mt-10
        grid
        gap-5

        sm:grid-cols-2

        lg:mt-12
        lg:grid-cols-4
      "
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-[#E6E4DE]
            bg-white
            shadow-[0_8px_28px_rgba(35,55,35,0.045)]
          "
        >
          {/* Image */}
          <div className="aspect-[1.05] animate-pulse bg-[#EFF4EB]" />

          {/* Content */}
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#E6EBE2]" />

            <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEF1EB]" />

            <div className="my-3 border-t border-[#EEECE6]" />

            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-2 w-14 animate-pulse rounded bg-[#EEF1EB]" />

                <div className="h-5 w-20 animate-pulse rounded bg-[#E6EBE2]" />
              </div>

              <div className="size-10 animate-pulse rounded-xl bg-[#E6EBE2]" />
            </div>

            <div className="h-3 w-24 animate-pulse rounded bg-[#EEF1EB]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ERROR STATE
============================================================ */

function FeaturedProductsError() {
  return (
    <div
      className="
        mt-10
        rounded-[22px]
        border
        border-[#E6E4DE]
        bg-white
        px-6
        py-12
        text-center
        shadow-sm
      "
    >
      <div
        className="
          mx-auto
          grid
          size-12
          place-items-center
          rounded-full
          bg-[#F3F8F1]
          text-[#316934]
        "
      >
        <ShoppingCart size={20} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#182719]">
        Products unavailable
      </h3>

      <p className="mt-1 text-xs text-[#7B8178]">
        Unable to load featured products right now.
      </p>

      <Link
        to="/marketplace"
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-[#2F6633]
          px-4
          py-2.5
          text-xs
          font-bold
          text-white
          transition
          hover:bg-[#25572A]
        "
      >
        Browse marketplace

        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function FeaturedProductsEmpty() {
  return (
    <div
      className="
        mt-10
        rounded-[22px]
        border
        border-[#E6E4DE]
        bg-white
        px-6
        py-12
        text-center
        shadow-sm
      "
    >
      <div
        className="
          mx-auto
          grid
          size-12
          place-items-center
          rounded-full
          bg-[#F3F8F1]
          text-[#316934]
        "
      >
        <MapPin size={20} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#182719]">
        Fresh products are coming soon
      </h3>

      <p className="mt-1 text-xs text-[#7B8178]">
        Check the marketplace for available produce.
      </p>

      <Link
        to="/marketplace"
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          text-xs
          font-bold
          text-[#316934]
          hover:underline
        "
      >
        Explore marketplace

        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#F4F8F1] px-5 py-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#316934] shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-extrabold text-[#2A352B]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-[#858980]">
          {description}
        </p>
      </div>
    </div>
  );
}
