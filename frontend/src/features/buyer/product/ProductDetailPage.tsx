import {
  ArrowLeft, BadgeCheck, Heart, MapPin, Minus, Plus,
  ShieldCheck, ShoppingCart, Truck, Leaf,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProduct, getProducts } from "../marketplace/data/api";
import { toMarketplaceProduct } from "../marketplace/data/adaptProduct";
import type { Product } from "../marketplace/data/products";
import { hasBulkDiscount } from "../marketplace/data/products";
import { useCart } from "../../../context/CartContext";
import Container from "../../../components/common/Container";
import RatingStars from "../../../components/common/RatingStars";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);
  // A single result keyed by `slug` lets `loading` be derived, so the effect
  // only updates state from async callbacks — never mid-render.
  type ProductResult = {
    slug: string;
    product: Product | null;
    related: Product[];
  };

  const [result, setResult] = useState<ProductResult | null>(null);

  useEffect(() => {
    if (!slug) return;

    let active = true;

    getProduct(slug)
      .then(async (data) => {
        if (!data) {
          if (active) setResult({ slug, product: null, related: [] });
          return;
        }

        const currentProduct = toMarketplaceProduct(data);
        const relatedResponse = await getProducts({
          category: data.category_slug,
          page_size: 4,
        });

        if (!active) return;

        setResult({
          slug,
          product: currentProduct,
          related: relatedResponse.results
            .filter((item) => item.slug !== data.slug)
            .map(toMarketplaceProduct),
        });
      })
      .catch(() => {
        if (active) setResult({ slug, product: null, related: [] });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const current = result?.slug === slug ? result : null;
  const loading = !current;
  const product = current?.product ?? null;
  const related = current?.related ?? [];

  if (loading) {
    return <div className="flex min-h-96 items-center justify-center text-sm text-muted">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-ink">Product not found</p>
          <Link to="/marketplace" className="mt-4 inline-block text-sm text-forest-700 underline">Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="border-b border-[#E5E2DA] bg-white">
        <Container className="py-3">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <Link to="/" className="hover:text-forest-700">Home</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-forest-700">Marketplace</Link>
            <span>/</span>
            <span className="font-medium text-ink">{product.name}</span>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-12">
        <button type="button" onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#6B7C66] transition hover:text-forest-700">
          <ArrowLeft size={16} />Back
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductImage product={product} liked={liked} onToggleLike={() => setLiked((v) => !v)} />
          <ProductInfo product={product} qty={qty} setQty={setQty} addedMsg={addedMsg} onAddToCart={handleAddToCart} />
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-[#182719]">More from {product.category}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} to={`/marketplace/product/${r.slug}`}
                  className="group overflow-hidden rounded-[18px] border border-[#E1E5DE] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-square overflow-hidden bg-[#EFF5EE]">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                    <p className="mt-1 text-xs font-bold text-forest-700">Rs. {r.pricePerKg} / {r.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}


function ProductImage({ product, liked, onToggleLike }: { product: Product; liked: boolean; onToggleLike: () => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E5E2DA] bg-[#EFF5EE] shadow-sm">
      <div className="relative aspect-square">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isSeasonal && <span className="rounded-full bg-[#E5B73A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#3E3011]">Seasonal</span>}
          {product.farmingMethod === "Organic" && <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-forest-700 shadow-sm">Organic</span>}
        </div>
        <button type="button" onClick={onToggleLike}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-105">
          <Heart size={18} className={liked ? "fill-[#B84C3A] text-[#B84C3A]" : "text-[#53604F]"} />
        </button>
      </div>
    </div>
  );
}

function ProductInfo({ product, qty, setQty, addedMsg, onAddToCart }: {
  product: Product; qty: number; setQty: (q: number) => void; addedMsg: boolean; onAddToCart: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#A57916]">
        <span className="h-px w-5 bg-[#D5A82E]" />{product.category}
      </div>
      <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight tracking-tight text-[#182719] sm:text-[38px]">{product.name}</h1>

      <div className="mt-3 flex items-center gap-3">
        <RatingStars rating={product.rating} />
        <span className="text-xs text-muted">Product rating</span>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="font-display text-4xl font-semibold text-[#234A27]">Rs. {product.pricePerKg}</span>
        <span className="mb-1 text-sm text-muted">/ {product.unit}</span>
      </div>
      {hasBulkDiscount(product) && (
        <p className="mt-1 text-sm font-semibold text-[#5E9A58]">
          Rs. {product.bulkPrice} / {product.unit} for{" "}
          {product.bulkMinimumQuantity}+ {product.unit}
        </p>
      )}
      <p className={`mt-2 text-sm font-medium ${product.stock <= 10 ? "text-red-500" : "text-[#5E9A58]"}`}>
        {product.stock <= 10 ? `Only ${product.stock} left in stock` : `${product.stock} in stock`}
      </p>

      <div className="mt-6 rounded-2xl border border-[#E5E2DA] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#D5E9D2] text-sm font-bold text-forest-700">
            {product.farmer.name.split(" ").map((p) => p[0]).join("").slice(0,2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-ink">{product.farmer.farmName}</p>
              {product.farmer.verified && <ShieldCheck size={14} className="text-forest-700" />}
            </div>
            <p className="text-xs text-muted">{product.farmer.name}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <MapPin size={13} />{product.farmer.location}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-xl border border-[#E0DDD6] bg-white">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="flex size-11 items-center justify-center rounded-l-xl transition hover:bg-[#F0F5EC]"><Minus size={16} /></button>
          <span className="w-12 text-center text-sm font-bold text-ink">{qty}</span>
          <button type="button" onClick={() => setQty(Math.min(product.stock, qty + 1))} className="flex size-11 items-center justify-center rounded-r-xl transition hover:bg-[#F0F5EC]"><Plus size={16} /></button>
        </div>
        <button type="button" onClick={onAddToCart}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 ${addedMsg ? "bg-[#5E9A58]" : "bg-forest-700 hover:bg-forest-800"} shadow-forest-700/20`}>
          <ShoppingCart size={17} />
          {addedMsg ? "Added to cart!" : "Add to cart"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: <Truck size={16} />, text: "Local delivery available" },
          { icon: <Leaf size={16} />, text: `${product.farmingMethod} farming` },
          { icon: <BadgeCheck size={16} />, text: "Verified farmer" },
          { icon: <ShieldCheck size={16} />, text: "Quality guaranteed" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 rounded-xl bg-[#F4F8F1] px-4 py-3">
            <span className="shrink-0 text-forest-700">{icon}</span>
            <span className="text-[11px] font-bold text-[#3A4A3B]">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
