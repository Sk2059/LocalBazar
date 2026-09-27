import {
  ArrowLeft,
  ArrowRight,
  Check,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import type { CartItem } from "../../../context/CartContext";
import {
  getProductUnitPrice,
  hasBulkDiscount,
} from "../marketplace/data/products";
import Container from "../../../components/common/Container";

const DELIVERY_FEE = 50;
const FREE_DELIVERY_THRESHOLD = 1000;

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQty,
    subtotal,
    totalItems,
    loading,
    error,
  } = useCart();

  const navigate = useNavigate();

  const deliveryFee =
    items.length > 0 && subtotal < FREE_DELIVERY_THRESHOLD
      ? DELIVERY_FEE
      : 0;

  const total = subtotal + deliveryFee;

  const remainingForFreeDelivery = Math.max(
    FREE_DELIVERY_THRESHOLD - subtotal,
    0
  );

  const freeDeliveryProgress = Math.min(
    (subtotal / FREE_DELIVERY_THRESHOLD) * 100,
    100
  );

  /* =========================================================
      LOADING
  ========================================================= */

  if (loading && items.length === 0) {
    return (
      <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[#FAF8F3]">
        <div className="size-10 animate-spin rounded-full border-[3px] border-[#DCE8D8] border-t-forest-700" />
      </main>
    );
  }

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (items.length === 0) {
    return (
      <main className="relative flex min-h-[calc(100dvh-4.5rem)] items-center justify-center overflow-hidden bg-[#FAF8F3] px-4 py-10">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#EAF2E7] blur-3xl" />

          <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-[#F5E8C7]/40 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md text-center">

          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full border border-[#DCE8D8] bg-[#EEF5EE] text-forest-700 shadow-sm">
            <ShoppingCart
              size={38}
              strokeWidth={1.5}
            />
          </div>

          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-forest-700">
            Your basket is waiting
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
            Discover fresh vegetables, fruits, greens and other
            produce directly from farmers across Koshi.
          </p>

          <Link
            to="/marketplace"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition hover:-translate-y-0.5 hover:bg-forest-800"
          >
            Explore fresh produce

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-muted">
            <Leaf
              size={12}
              className="text-forest-700"
            />

            Fresh from local Koshi farmers
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] bg-[#FAF8F3]">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="border-b border-[#E7E3DB] bg-white">
        <Container className="py-5 sm:py-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-700">
                <ShoppingBag size={12} />
                Shopping bag
              </div>

              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Your cart
              </h1>

              <p className="mt-1 text-xs text-muted">
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"} from local farmers
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-[#E5E2DA] bg-[#FAF9F6] px-3 py-2 sm:flex">
              <Leaf
                size={14}
                className="text-forest-700"
              />

              <span className="text-xs font-bold text-forest-700">
                Koshi Bazaar
              </span>
            </div>
          </div>

        </Container>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <Container className="py-6 sm:py-8 lg:py-10">

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">

          {/* LEFT */}
          <section className="min-w-0">

            {/* Free delivery progress */}
            <DeliveryProgress
              subtotal={subtotal}
              progress={freeDeliveryProgress}
              remaining={remainingForFreeDelivery}
            />

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <span className="size-2 shrink-0 rounded-full bg-red-500" />

                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Cart items */}
            <CartItems
              items={items}
              removeFromCart={removeFromCart}
              updateQty={updateQty}
            />

            {/* Continue shopping */}
            <Link
              to="/marketplace"
              className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-700"
            >
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              Continue shopping
            </Link>
          </section>

          {/* RIGHT */}
          <OrderSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            totalItems={totalItems}
            onCheckout={() => navigate("/checkout")}
          />

        </div>
      </Container>
    </main>
  );
}

/* ============================================================
   DELIVERY PROGRESS
============================================================ */

function DeliveryProgress({
  subtotal,
  progress,
  remaining,
}: {
  subtotal: number;
  progress: number;
  remaining: number;
}) {
  const qualifies = subtotal >= FREE_DELIVERY_THRESHOLD;

  return (
    <div className="mb-5 rounded-2xl border border-[#DDE9D9] bg-forest-50 p-4">

      <div className="flex items-start gap-3">

        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-forest-700 shadow-sm">
          {qualifies ? (
            <Check size={17} />
          ) : (
            <Truck size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-forest-800">
              {qualifies
                ? "You've unlocked free delivery!"
                : `Add ${formatPrice(remaining)} more for free delivery`}
            </p>

            <span className="shrink-0 text-[10px] font-bold text-forest-700">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DCE7D9]">
            <div
              className="h-full rounded-full bg-forest-700 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-1.5 text-[10px] text-muted">
            Free delivery on orders above{" "}
            {formatPrice(FREE_DELIVERY_THRESHOLD)}.
          </p>

        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CART ITEMS
============================================================ */

function CartItems({
  items,
  removeFromCart,
  updateQty,
}: {
  items: CartItem[];
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
}) {
  return (
    <div className="space-y-3">

      {items.map(({ product, quantity }) => {
        const unitPrice = getProductUnitPrice(product, quantity);
        const lineTotal = unitPrice * quantity;

        const maxStock = product.stock ?? 999;

        const canIncrease = quantity < maxStock;

        return (
          <article
            key={product.id}
            className="group rounded-2xl border border-[#E5E2DA] bg-white p-3.5 shadow-[0_4px_20px_rgba(30,50,30,0.035)] transition hover:border-[#D8E2D5] hover:shadow-[0_8px_28px_rgba(30,50,30,0.06)] sm:p-4"
          >
            <div className="flex gap-3.5 sm:gap-5">

              {/* Product image */}
              <Link
                to={`/marketplace/product/${product.slug}`}
                className="relative shrink-0"
              >
                <div className="size-24 overflow-hidden rounded-xl bg-[#EFF5EE] sm:size-28">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                {product.isSeasonal && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[#FEF3D7] px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#A57916] shadow-sm">
                    Seasonal
                  </span>
                )}
              </Link>

              {/* Details */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <Link
                      to={`/marketplace/product/${product.slug}`}
                    >
                      <h2 className="truncate text-sm font-bold text-ink transition hover:text-forest-700 sm:text-base">
                        {product.name}
                      </h2>
                    </Link>

                    <p className="mt-1 truncate text-[11px] text-muted">
                      {product.farmer.farmName}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-[#9A9B94]">
                      {product.farmer.location}
                    </p>

                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-[#AAA9A2] transition hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${product.name} from cart`}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

                {/* Bottom row */}
                <div className="mt-4 flex items-end justify-between gap-3">

                  {/* Quantity */}
                  <div>

                    <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-[#A2A39D]">
                      Quantity
                    </p>

                    <div className="flex h-8 items-center overflow-hidden rounded-lg border border-[#DDDAD2] bg-[#FAFAF8]">

                      <button
                        type="button"
                        onClick={() =>
                          updateQty(
                            product.id,
                            Math.max(quantity - 1, 0)
                          )
                        }
                        className="grid h-full w-8 place-items-center text-muted transition hover:bg-[#EFF5EE] hover:text-forest-700 disabled:opacity-40"
                        disabled={quantity <= 1}
                        aria-label={`Decrease ${product.name} quantity`}
                      >
                        <Minus size={12} />
                      </button>

                      <span className="grid h-full min-w-8 place-items-center border-x border-[#E5E2DA] px-1 text-xs font-bold text-ink">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQty(
                            product.id,
                            quantity + 1
                          )
                        }
                        disabled={!canIncrease}
                        className="grid h-full w-8 place-items-center text-muted transition hover:bg-[#EFF5EE] hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Increase ${product.name} quantity`}
                      >
                        <Plus size={12} />
                      </button>

                    </div>

                    {!canIncrease && (
                      <p className="mt-1 text-[9px] text-[#A57916]">
                        Maximum stock reached
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">

                    <p className="text-[10px] text-muted">
                      {formatPrice(unitPrice)} / kg
                      {hasBulkDiscount(product) &&
                        quantity >= product.bulkMinimumQuantity &&
                        " (bulk)"}
                    </p>

                    <p className="mt-0.5 text-base font-bold text-forest-700">
                      {formatPrice(lineTotal)}
                    </p>

                  </div>

                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ============================================================
   ORDER SUMMARY
============================================================ */

function OrderSummary({
  subtotal,
  deliveryFee,
  total,
  totalItems,
  onCheckout,
}: {
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalItems: number;
  onCheckout: () => void;
}) {
  return (
    <aside>

      <div className="lg:sticky lg:top-24">

        <div className="overflow-hidden rounded-2xl border border-[#E3E0D8] bg-white shadow-[0_10px_35px_rgba(30,50,30,0.06)]">

          {/* Header */}
          <div className="border-b border-[#EEEAE3] bg-[#FAF9F6] px-5 py-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700">
                  Checkout
                </p>

                <h2 className="mt-0.5 font-display text-xl font-semibold text-ink">
                  Order summary
                </h2>
              </div>

              <div className="grid size-9 place-items-center rounded-xl bg-[#EEF5EE] text-forest-700">
                <ShoppingBag size={17} />
              </div>

            </div>
          </div>

          {/* Pricing */}
          <div className="px-5 py-5">

            <div className="space-y-3 text-sm">

              <div className="flex items-center justify-between">
                <span className="text-muted">
                  Subtotal
                </span>

                <span className="font-semibold text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">
                  Delivery
                </span>

                <span className="font-semibold text-ink">
                  {deliveryFee === 0 ? (
                    <span className="text-forest-700">
                      Free
                    </span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              <div className="border-t border-dashed border-[#DDDAD2] pt-4">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="font-bold text-ink">
                      Total
                    </p>

                    <p className="mt-0.5 text-[10px] text-muted">
                      {totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <p className="text-xl font-bold text-forest-700">
                    {formatPrice(total)}
                  </p>

                </div>
              </div>

            </div>

            {/* Checkout */}
            <button
              type="button"
              onClick={onCheckout}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-xl disabled:opacity-60"
            >
              Proceed to checkout

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            {/* Payment */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted">
              <ShieldCheck
                size={12}
                className="text-forest-700"
              />

              Secure checkout
            </div>

          </div>
        </div>

        {/* Trust cards */}
        <div className="mt-3 grid grid-cols-2 gap-3">

          <div className="rounded-xl border border-[#E5E2DA] bg-white p-3">
            <div className="mb-2 grid size-7 place-items-center rounded-lg bg-[#EFF5EE] text-forest-700">
              <Truck size={13} />
            </div>

            <p className="text-[10px] font-bold text-ink">
              Local delivery
            </p>

            <p className="mt-0.5 text-[9px] leading-4 text-muted">
              Fresh produce delivered locally
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E2DA] bg-white p-3">
            <div className="mb-2 grid size-7 place-items-center rounded-lg bg-[#FEF3D7] text-[#A57916]">
              <Sparkles size={13} />
            </div>

            <p className="text-[10px] font-bold text-ink">
              Farm fresh
            </p>

            <p className="mt-0.5 text-[9px] leading-4 text-muted">
              Directly sourced from farmers
            </p>
          </div>

        </div>

      </div>
    </aside>
  );
}