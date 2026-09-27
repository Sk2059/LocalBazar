import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Container from "../../../components/common/Container";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { useCart } from "../../../context/CartContext";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useDeliveryZones } from "../delivery/hooks/useDeliveryZones";
import { findDeliveryZone } from "../delivery/data/matchZone";
import { useInitiateKhalti } from "../payments/hooks/usePayments";
import { stashPendingPayment } from "../payments/data/pendingPayment";
import type { PaymentMethod } from "../orders/data/api";
import { useCheckout } from "../orders/hooks/useOrders";
import { describeCheckoutError } from "./data/errors";
import OrderSummary from "./components/OrderSummary";
import PaymentMethodSelector from "./components/PaymentMethodSelector";

// ====================================================================
//  VALIDATION
// ====================================================================

/**
 * Mirrors `CheckoutSerializer` on the server. The province defaults to Koshi,
 * where every seeded delivery zone lives; buyers can still edit it freely.
 */
const checkoutSchema = z.object({
  delivery_address: z
    .string()
    .min(6, "Enter a street, tole or landmark we can deliver to."),
  municipality: z.string().min(2, "Enter your municipality or city."),
  district: z.string().min(2, "Enter your district."),
  province: z.string().min(2, "Enter your province."),
  delivery_instructions: z.string().optional(),
  // Only required when paying with Khalti (validated on submit, not by Zod,
  // so cash-on-delivery buyers never see an irrelevant error).
  khaltiPhone: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const DEFAULT_VALUES: CheckoutFormValues = {
  delivery_address: "",
  municipality: "",
  district: "",
  province: "Koshi Province",
  delivery_instructions: "",
  khaltiPhone: "",
};

// ====================================================================
//  INPUTS
// ====================================================================

function inputClasses(hasError: boolean, withIcon: boolean) {
  return [
    "w-full rounded-xl border bg-white py-2.5 text-ink outline-none transition placeholder:text-[#A1AAA0]",
    withIcon ? "pl-10 pr-3" : "px-3",
    hasError
      ? "border-red-300 focus:border-red-500"
      : "border-[#E1DED6] focus:border-forest-700 focus:ring-2 focus:ring-[#2D5A27]/10",
  ].join(" ");
}

function InputField({
  label,
  icon,
  error,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9585]">
            {icon}
          </span>
        )}

        <input
          {...props}
          className={inputClasses(Boolean(error), Boolean(icon))}
        />
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}


// ====================================================================
//  TEXTAREA
// ====================================================================

function TextAreaField({
  label,
  icon,
  error,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-3.5 text-[#8A9585]">
            {icon}
          </span>
        )}

        <textarea
          {...props}
          className={`${inputClasses(
            Boolean(error),
            Boolean(icon),
          )} resize-none`}
        />
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ====================================================================
//  PAGE
// ====================================================================

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  const checkout = useCheckout();
  const initiate = useInitiateKhalti();
  const { data: zones } = useDeliveryZones();
  const { data: user } = useCurrentUser();
  const toast = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Prefill the Khalti number from the account once it loads.
  useEffect(() => {
    if (user?.phone && !getValues("khaltiPhone")) {
      setValue("khaltiPhone", user.phone);
    }
  }, [user?.phone, getValues, setValue]);

  const watched = watch();

  // Advisory only: shows what the server charges for a matching zone so the
  // fee isn't a surprise. Unknown locations are never guessed.
  const estimate = zones
    ? findDeliveryZone(
        zones,
        {
          province: watched.province,
          district: watched.district,
          municipality: watched.municipality,
        },
        subtotal,
      )
    : null;

  const locationComplete = Boolean(
    watched.province && watched.district && watched.municipality,
  );

  const submitting = checkout.isPending || initiate.isPending;

  const submitLabel =
    paymentMethod === "khalti" ? "Continue to Khalti" : "Place order";

  async function onSubmit(values: CheckoutFormValues) {
    const phoneDigits = (values.khaltiPhone ?? "").replace(/\D/g, "");

    // Khalti needs a mobile number before the order is created.
    if (
      paymentMethod === "khalti" &&
      (phoneDigits.length !== 10 || !phoneDigits.startsWith("9"))
    ) {
      setError("khaltiPhone", {
        type: "manual",
        message:
          "Enter a valid 10-digit Nepali mobile number starting with 9.",
      });

      return;
    }

    try {
      // The server snapshots prices, decrements stock, resolves the delivery
      // zone and clears the cart atomically; its response is the record of
      // what was actually charged.
      const order = await checkout.mutateAsync({
        payment_method: paymentMethod,
        delivery_address: values.delivery_address.trim(),
        municipality: values.municipality.trim(),
        district: values.district.trim(),
        province: values.province.trim(),
        delivery_instructions:
          values.delivery_instructions?.trim() || undefined,
      });

      // Mirror the server-side cart clear locally. Fire-and-forget: the order
      // is already safely placed and nothing downstream depends on the result.
      void clearCart();

      if (paymentMethod === "khalti") {
        // Hand off to the gateway's hosted page. The browser navigates away,
        // so nothing after this point is guaranteed to run.
        const started = await initiate.mutateAsync({
          order_id: order.id,
          phone: phoneDigits,
        });

        stashPendingPayment({
          pidx: started.pidx,
          paymentId: started.payment_id,
          orderId: order.id,
          amount: order.total,
          demoCode: started.demo_code,
          createdAt: Date.now(),
        });

        window.location.href = started.payment_url;

        return;
      }

      toast.success(
        "Order placed successfully",
        `Order #${order.id} is confirmed. Please keep the cash ready for delivery.`,
      );

      navigate(`/orders/${order.id}`, {
        state: { justPlaced: true },
      });
    } catch (error) {
      const described = describeCheckoutError(error);
      toast.error(described.title, described.message);
    }
  }

  // ==========================================================
  //  EMPTY CART
  // ==========================================================

  if (items.length === 0) {
    return (
      <main className="relative flex min-h-[calc(100dvh-4.5rem)] items-center justify-center overflow-hidden bg-[#FAF8F3] px-4 py-10">
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
            Nothing to check out
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
            Add fresh produce from farmers across Koshi, then come back here to
            place your order.
          </p>

          <Link
            to="/marketplace"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition-all hover:-translate-y-0.5 hover:bg-forest-800"
          >
            Browse the marketplace

            <ArrowLeft className="size-4 rotate-180" />
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================================
  //  CHECKOUT
  // ==========================================================

  return (
    <main className="min-h-[calc(100dvh-4.5rem)] bg-[#FAF8F3] py-8 sm:py-10">
      <Container>
        <Link
          to="/cart"
          className="inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-forest-700 transition hover:border-forest-300 hover:bg-forest-50"
          aria-label="Back to cart"
        >
          <ArrowLeft className="size-4.5" />
        </Link>

        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-harvest-500">
            Checkout
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Delivery &amp; payment
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-muted">
            Stock, totals and the delivery fee are confirmed by us when you
            place the order — you're never charged more than the estimate
            shown.
          </p>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ============================================== FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <section className="overflow-hidden rounded-2xl border border-[#E6E2DA] bg-white shadow-[0_10px_35px_rgba(45,90,39,0.05)]">
              <div className="border-b border-[#EAE7E0] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#F5F7F3] text-forest-700">
                    <MapPin className="size-4" />
                  </div>

                  <div>
                    <h2 className="font-display text-base font-semibold text-ink">
                      Delivery address
                    </h2>

                    <p className="mt-0.5 text-xs text-[#7A8575]">
                      Where should we bring your produce?
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <div className="sm:col-span-2">
                  <InputField
                    label="Delivery address"
                    icon={<MapPin className="size-4" />}
                    placeholder="Street, tole, landmark…"
                    autoComplete="street-address"
                    error={errors.delivery_address?.message}
                    {...register("delivery_address")}
                  />
                </div>

                <InputField
                  label="Municipality / City"
                  placeholder="Biratnagar"
                  autoComplete="address-level2"
                  error={errors.municipality?.message}
                  {...register("municipality")}
                />

                <InputField
                  label="District"
                  placeholder="Morang"
                  autoComplete="address-level1"
                  error={errors.district?.message}
                  {...register("district")}
                />

                <InputField
                  label="Province"
                  placeholder="Koshi Province"
                  autoComplete="address-level1"
                  error={errors.province?.message}
                  {...register("province")}
                />

                <div className="sm:col-span-2">
                  <TextAreaField
                    label="Delivery instructions"
                    icon={<MessageSquare className="size-4" />}
                    rows={3}
                    placeholder="Optional notes for the courier (gate code, landmark…)"
                    error={errors.delivery_instructions?.message}
                    {...register("delivery_instructions")}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E6E2DA] bg-white px-5 py-5 shadow-[0_10px_35px_rgba(45,90,39,0.05)] sm:px-6">
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              {paymentMethod === "khalti" && (
                <div className="mt-5 sm:max-w-xs">
                  <InputField
                    label="Khalti mobile number"
                    icon={<Smartphone className="size-4" />}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    error={errors.khaltiPhone?.message}
                    {...register("khaltiPhone")}
                  />
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition-all hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60 lg:hidden"
            >
              {submitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </form>

          {/* ============================================== SUMMARY */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            totalItems={totalItems}
            estimate={estimate}
            locationComplete={locationComplete}
            submitting={submitting}
            submitLabel={submitLabel}
            onSubmit={handleSubmit(onSubmit)}
          />
        </div>
      </Container>
    </main>
  );
}

