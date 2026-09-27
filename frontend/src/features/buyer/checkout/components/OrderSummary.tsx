import {
  ArrowRight,
  Info,
  ShieldCheck,
  Truck,
} from "lucide-react";

import type { CartItem } from "../../../../context/CartContext";
import {
  getProductUnitPrice,
  hasBulkDiscount,
} from "../../marketplace/data/products";
import type { DeliveryEstimate } from "../../delivery/data/matchZone";

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-NP")}`;
}

/**
 * Order summary for the checkout page.
 *
 * The delivery fee and minimum-order hint come from the server's delivery
 * zones, so nothing here is invented on the client; when the typed address
 * isn't a zone we serve yet, the fee is shown as "calculated at checkout"
 * rather than guessed. Every figure is clearly an *estimate* — the totals the
 * buyer is actually charged are the ones the server returns with the order.
 */
export default function OrderSummary({
  items,
  subtotal,
  totalItems,
  estimate,
  locationComplete,
  submitting,
  submitLabel,
  onSubmit,
}: {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  estimate: DeliveryEstimate | null;
  locationComplete: boolean;
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
}) {
  const estimatedTotal = subtotal + (estimate?.deliveryFee ?? 0);

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.06)]">
        <div className="border-b border-[#EAE7E0] px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            Order summary
          </h2>

          <p className="mt-0.5 text-xs text-muted">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <ul className="max-h-72 divide-y divide-[#F0EDE6] overflow-y-auto px-5">
          {items.map((item) => {
            const unit = getProductUnitPrice(item.product, item.quantity);

            return (
              <li
                key={item.product.id}
                className="flex items-center gap-3 py-3"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-[#EAE7E0] bg-[#F6F8F4]">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.product.name}
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted">
                    {formatPrice(unit)} / {item.product.unit}{" "}
                    {hasBulkDiscount(item.product) && (
                      <span className="font-semibold text-forest-700">
                        · bulk price
                      </span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ink">
                    {formatPrice(unit * item.quantity)}
                  </p>

                  <p className="text-[10px] text-muted">×{item.quantity}</p>
                </div>
              </li>
            );
          })}
        </ul>


        <div className="space-y-2.5 border-t border-[#EAE7E0] px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-ink">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <Truck className="size-3.5" />
              Delivery
            </span>

            {estimate ? (
              <span className="font-semibold text-ink">
                {estimate.deliveryFee === 0 ? (
                  <span className="text-forest-700">Free</span>
                ) : (
                  formatPrice(estimate.deliveryFee)
                )}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-muted">
                {locationComplete
                  ? "Unavailable here"
                  : "Calculated at checkout"}
              </span>
            )}
          </div>

          {estimate && estimate.shortOfMinimum > 0 && (
            <div className="flex items-start gap-1.5 rounded-xl bg-harvest-50 px-3 py-2.5 text-[11px] leading-4 text-harvest-800">
              <Info className="mt-0.5 size-3.5 shrink-0" />

              <span>
                Add {formatPrice(estimate.shortOfMinimum)} more — this area has
                a {formatPrice(estimate.minimumOrder)} minimum order.
              </span>
            </div>
          )}

          <div className="border-t border-dashed border-[#DDDAD2] pt-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-ink">Estimated total</p>

                <p className="mt-0.5 text-[10px] text-muted">
                  Confirmed at checkout
                </p>
              </div>

              <p className="font-display text-2xl font-bold text-forest-700">
                {formatPrice(estimatedTotal)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-xl disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                {submitLabel}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-muted">
            <ShieldCheck size={12} className="text-forest-700" />
            Secure checkout
          </div>
        </div>
      </div>
    </aside>
  );
}

