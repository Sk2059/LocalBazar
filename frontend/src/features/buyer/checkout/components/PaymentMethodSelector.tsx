import {
  Banknote,
  Check,
  ShieldCheck,
} from "lucide-react";

import type { PaymentMethod } from "../../orders/data/api";

/**
 * Cash-on-delivery vs Khalti picker, in the visual language of the rest of the
 * checkout form. Controlled: the page owns the value and validation.
 */
export default function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#F5F7F3] text-forest-700">
            <ShieldCheck className="size-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Payment method</h3>

            <p className="mt-0.5 text-xs text-[#7A8575]">
              Choose how you'd like to pay
            </p>
          </div>
        </div>

        <span className="hidden rounded-full bg-[#EFF5EE] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-forest-700 sm:inline-flex">
          SECURE PAYMENT
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Option
          selected={value === "cod"}
          onSelect={() => onChange("cod")}
          title="Cash on Delivery"
          description="Pay with cash when your order arrives"
          icon={
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F2F5EF] text-forest-700">
              <Banknote className="size-5" />
            </div>
          }
        />

        <Option
          selected={value === "khalti"}
          onSelect={() => onChange("khalti")}
          title="Khalti"
          description="Pay securely with Khalti eWallet"
          icon={
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F1FA]">
              <span className="text-base font-black text-[#5C2D91]">K</span>
            </div>
          }
        />
      </div>

      {value === "khalti" && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-[#FAF7FE] px-3 py-2.5 text-[11px] leading-4 text-[#6B5B7B]">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#5C2D91]" />

          <span>
            You'll be redirected to Khalti to approve the payment. Your order is
            confirmed once Khalti verifies it — never from this page alone.
          </span>
        </p>
      )}
    </div>
  );
}

function Option({
  selected,
  onSelect,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex min-h-28 w-full flex-col items-start rounded-xl border p-3.5 text-left transition-all duration-200 ${
        selected
          ? "border-forest-700 bg-[#F4F8F2] shadow-[0_6px_18px_rgba(45,90,39,0.10)]"
          : "border-[#E4E1DA] bg-white hover:border-[#A8C4A0] hover:bg-[#FBFCFA]"
      }`}
    >
      <span
        className={`absolute right-3.5 top-3.5 flex size-5 items-center justify-center rounded-full border transition ${
          selected
            ? "border-forest-700 bg-forest-700"
            : "border-[#C9CEC5] bg-white group-hover:border-[#7E9B78]"
        }`}
      >
        {selected && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>

      {icon}

      <div className="mt-3 pr-5">
        <p
          className={`text-sm font-semibold ${
            selected ? "text-[#1C3A18]" : "text-ink"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-4 text-[#7A8575]">
          {description}
        </p>
      </div>
    </button>
  );
}
