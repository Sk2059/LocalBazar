import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-forest-700 text-white shadow-lg shadow-forest-700/15 hover:bg-forest-800",
    secondary:
      "bg-harvest-500 text-white shadow-lg shadow-harvest-500/15 hover:bg-harvest-600",
    outline:
      "border border-forest-700 bg-transparent text-forest-700 hover:bg-forest-50",
    ghost:
      "bg-transparent text-forest-700 hover:bg-forest-50",
  };

  const sizes = {
    sm: "min-h-9 px-4 text-xs",
    md: "min-h-11 px-5 text-sm",
    lg: "min-h-[54px] px-7 text-sm",
  };

  return (
    <button
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold",
        "transition-all duration-200",
        "hover:-translate-y-0.5 active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-forest-500/30",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}