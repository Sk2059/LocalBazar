import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "green" | "gold" | "neutral" | "danger";
}

export default function Badge({
  children,
  variant = "green",
}: BadgeProps) {
  const variants = {
    green:
      "bg-forest-100 text-forest-700",
    gold:
      "bg-harvest-100 text-harvest-800",
    neutral:
      "bg-stone-100 text-stone-700",
    danger:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded-full px-2.5 py-1",
        "text-[11px] font-extrabold leading-none",
        variants[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}