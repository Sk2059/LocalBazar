import {
  ArrowRight,
  Heart,
  MapPin,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import Container from "../../../../components/common/Container";
import { useCart } from "../../../../context/CartContext";
import { products as marketplaceProducts } from "../../marketplace/data/products";

type Product = {
  id: number;
  name: string;
  farmer: string;
  location: string;
  pricePerKg: number;
  bulkPrice: number;
  unit: string;
  rating: number;
  reviews: number;
  image: string;
  freshness: string;
  category: string;
  stock: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    farmer: "Hari Organic Farm",
    location: "Biratnagar, Morang",
    pricePerKg: 95,
    bulkPrice: 85,
    unit: "kg",
    rating: 4.9,
    reviews: 28,
    image: "/images/products/tomatoes.jpeg",
    freshness: "Harvested today",
    category: "Vegetables",
    stock: "In stock",
  },
  {
    id: 2,
    name: "Fresh Cauliflower",
    farmer: "Koshi Green Farm",
    location: "Itahari, Sunsari",
    pricePerKg: 80,
    bulkPrice: 72,
    unit: "kg",
    rating: 4.8,
    reviews: 21,
    image: "/images/products/cauliflower.png",
    freshness: "Harvested today",
    category: "Vegetables",
    stock: "In stock",
  },
  {
    id: 3,
    name: "Local Mangoes",
    farmer: "Madhesh Fruit Farm",
    location: "Dharan, Sunsari",
    pricePerKg: 180,
    bulkPrice: 162,
    unit: "kg",
    rating: 4.9,
    reviews: 35,
    image: "/images/products/mangoes.png",
    freshness: "Fresh harvest",
    category: "Fruits",
    stock: "In stock",
  },
  {
    id: 4,
    name: "Fresh Potatoes",
    farmer: "Green Valley Farm",
    location: "Birat Chowk, Morang",
    pricePerKg: 70,
    bulkPrice: 63,
    unit: "kg",
    rating: 4.7,
    reviews: 19,
    image: "/images/products/potatoes.png",
    freshness: "Fresh harvest",
    category: "Vegetables",
    stock: "In stock",
  },
];

export default function FreshProducts() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
   

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-48 top-10 size-112.5 rounded-full bg-[#EEF5EA] blur-3xl" />

        <div className="absolute -left-48 bottom-0 size-100 rounded-full bg-[#FBF2DC]/60 blur-3xl" />
      </div>

      <Container className="relative">
      

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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlisted={wishlist.includes(product.id)}
              onWishlist={() =>
                toggleWishlist(product.id)
              }
            />
          ))}
        </div>


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
      </Container>
    </section>
  );
}



function ProductCard({
  product,
  wishlisted,
  onWishlist,
}: {
  product: Product;
  wishlisted: boolean;
  onWishlist: () => void;
}) {
  const { addToCart } = useCart();

  return (
    <article
      className="
        group
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

        {/* Freshness */}

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
            text-[#316934]
            shadow-sm
            backdrop-blur-md
          "
        >
          {product.freshness}
        </span>

        {/* Wishlist */}

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={onWishlist}
          className="
            absolute
            right-3
            top-3
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
            fill={wishlisted ? "currentColor" : "none"}
            className={
              wishlisted
                ? "text-[#B84C43]"
                : ""
            }
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-extrabold drop-shadow-md">
              {product.farmer}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-black/25 px-2.5 py-1 text-[9px] font-bold backdrop-blur-md">
              {product.category}
            </span>
          </div>
        </div>
      </div>



      <div className="p-4">
        {/* Product name */}

        <Link
          to={`/marketplace/product/${product.name.toLowerCase().replace(/ /g, "-")}`}
          className="block"
        >
          <h3 className="text-[15px] font-extrabold leading-tight text-[#202A21] transition-colors group-hover:text-[#316934]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-1 text-[9px] text-[#969791]">
            <MapPin size={10} />
            {product.location}
        </div>

        {/* Divider */}

        <div className="my-3 border-t border-[#EEECE6]" />

        {/* Price + Add */}

        <div className="flex items-end justify-between gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#92938D]">Regular</p>
              <p className="mt-0.5 whitespace-nowrap text-[17px] font-black tracking-tight text-[#234A27]">
                Rs. {product.pricePerKg}<span className="ml-0.5 text-[9px] font-semibold text-[#92938D]">/kg</span>
              </p>
            </div>
            <div className="border-l border-[#EEECE6] pl-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-forest-700">Bulk</p>
              <p className="mt-0.5 whitespace-nowrap text-[14px] font-extrabold text-forest-700">
                Rs. {product.bulkPrice}<span className="ml-0.5 text-[9px] font-semibold">/kg</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const marketplaceProduct = marketplaceProducts.find((item) => item.id === product.id);
                if (marketplaceProduct) addToCart(marketplaceProduct);
              }}
              className="
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
                aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={18} />
            </button>

            <div className="flex items-center gap-0.5 text-[#D69B18]" aria-label={`${product.rating} out of 5 stars`}>
              <Star size={12} fill="currentColor" />
              <span className="text-[10px] font-extrabold text-[#4D514B]">{product.rating}</span>
            </div>
          </div>
        </div>

        {/* Stock */}

        <div className="mt-3 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[#5E9A58]" />

          <span className="text-[9px] font-bold text-[#6E756B]">
            {product.stock}
          </span>
        </div>
      </div>
    </article>
  );
}


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