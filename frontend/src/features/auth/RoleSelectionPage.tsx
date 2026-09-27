import {
  ArrowRight,
  Check,
  Leaf,
  ShoppingBasket,
  Sprout,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    eyebrow: "For fresh food lovers",
    title: "I'm a Buyer",
    description:
      "Discover fresh produce directly from trusted local farmers.",
    icon: ShoppingBasket,
    accent: "gold",
    features: [
      "Browse fresh produce",
      "Shop directly from farmers",
      "Track your orders",
      "Secure payments",
    ],
    action: "Start Shopping",
    destination: "/signup",
  },
  {
    eyebrow: "For local growers",
    title: "I'm a Farmer",
    description:
      "Sell your harvest directly to customers and grow your farm business.",
    icon: Sprout,
    accent: "green",
    features: [
      "Sell your produce",
      "Manage your inventory",
      "Receive customer orders",
      "Buy from other farmers",
    ],
    action: "Apply as Farmer",
    destination: "/farmer/register",
  },
] as const;

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <main className="relative h-[calc(100dvh-4.5rem)] min-h-150 overflow-hidden bg-[#FCFBF7]">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Green glow */}
        <div
          className="
            absolute
            -left-40
            -top-30
            size-105
            rounded-full
            bg-[#EAF3E7]
            opacity-70
            blur-3xl
            animate-[pulse_7s_ease-in-out_infinite]
          "
        />

        {/* Gold glow */}
        <div
          className="
            absolute
            -right-40
            -bottom-45
            size-125
            rounded-full
            bg-[#F0D98A]
            opacity-20
            blur-3xl
            animate-[pulse_9s_ease-in-out_infinite]
          "
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(#173615 1px, transparent 1px), linear-gradient(90deg, #173615 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        {/* Decorative ring */}
        <div
          className="
            absolute
            -right-24
            top-10
            size-72
            rounded-full
            border
            border-forest-700/6
            animate-[spin_35s_linear_infinite]
          "
        />

        <Leaf
          className="
            absolute
            -left-10
            bottom-4
            rotate-[-25deg]
            text-forest-700/5
          "
          size={160}
          strokeWidth={0.7}
        />

        <Leaf
          className="
            absolute
            -right-10
            top-8
            rotate-22
            text-[#E5B73A]/[0.07]
          "
          size={160}
          strokeWidth={0.7}
        />
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-4 py-6 sm:px-8">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header
          className="
            mx-auto
            max-w-2xl
            text-center
            animate-[fadeInUp_0.6s_ease-out_both]
          "
        >
          {/* Brand icon */}
          <div
            className="
              relative
              mx-auto
              mb-3
              grid
              size-11
              place-items-center
              rounded-xl
              bg-[#173615]
              text-white
              shadow-[0_8px_22px_rgba(23,54,21,0.18)]
              sm:size-12
            "
          >
            <Leaf size={21} strokeWidth={1.8} />

            <span
              className="
                absolute
                -right-1
                -top-1
                size-2.5
                rounded-full
                border-2
                border-[#FCFBF7]
                bg-[#E5B73A]
              "
            />
          </div>

          {/* Eyebrow */}
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-[#E5B73A]" />

            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.24em]
                text-forest-700
              "
            >
              Welcome to Koshi Bazaar
            </p>

            <span className="h-px w-6 bg-[#E5B73A]" />
          </div>

          {/* Heading */}
          <h1
            className="
              font-display
              text-3xl
              font-semibold
              leading-[1.04]
              tracking-[-0.045em]
              text-[#173615]
              sm:text-4xl
              lg:text-[46px]
            "
          >
            Choose how you'll use
            <span className="block text-[#3D7335]">
              Koshi Bazaar.
            </span>
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-lg
              text-xs
              leading-5
              text-[#687265]
              sm:text-sm
            "
          >
            Choose your path today. You can change your preferences
            anytime from your account.
          </p>
        </header>

        {/* ===================================================
            ROLE CARDS
        ==================================================== */}

        <section
          className="
            mx-auto
            mt-7
            grid
            w-full
            max-w-5xl
            gap-4
            lg:grid-cols-2
            lg:gap-5
          "
        >
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isBuyer = role.accent === "gold";

            return (
              <article
                key={role.title}
                className={`
                  group
                  relative
                  flex
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-white
                  shadow-[0_12px_35px_rgba(23,54,21,0.07)]
                  transition-all
                  duration-400
                  hover:-translate-y-1.5
                  hover:shadow-[0_20px_45px_rgba(23,54,21,0.12)]
                  animate-[fadeInUp_0.6s_ease-out_both]
                  ${index === 1 ? "[animation-delay:100ms]" : ""}
                  ${
                    isBuyer
                      ? "border-[#E9DFC0] hover:border-[#D9B94B]"
                      : "border-[#DCE7D8] hover:border-[#7DA477]"
                  }
                `}
              >
                {/* Top accent */}
                <div
                  className={`
                    absolute
                    inset-x-0
                    top-0
                    h-1
                    ${
                      isBuyer
                        ? "bg-[#E5B73A]"
                        : "bg-forest-700"
                    }
                  `}
                />

                {/* Background glow */}
                <div
                  className={`
                    pointer-events-none
                    absolute
                    -right-16
                    -top-16
                    size-44
                    rounded-full
                    opacity-0
                    blur-3xl
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                    ${
                      isBuyer
                        ? "bg-[#E5B73A]/10"
                        : "bg-forest-700/10"
                    }
                  `}
                />

                <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                  {/* =================================================
                      TOP
                  ================================================== */}

                  <div className="flex items-center justify-between">
                    {/* Icon */}
                    <div
                      className={`
                        grid
                        size-12
                        place-items-center
                        rounded-xl
                        transition-all
                        duration-300
                        group-hover:-translate-y-1
                        group-hover:scale-105
                        ${
                          isBuyer
                            ? "bg-[#FFF6DB] text-[#173615]"
                            : "bg-[#EDF6EA] text-forest-700"
                        }
                      `}
                    >
                      <Icon size={24} strokeWidth={1.7} />
                    </div>

                    {/* Badge */}
                    <span
                      className={`
                        rounded-full
                        border
                        px-2.5
                        py-1
                        text-[8px]
                        font-extrabold
                        uppercase
                        tracking-[0.15em]
                        ${
                          isBuyer
                            ? "border-[#E9DCA8] bg-[#FFF9E9] text-[#8C6B16]"
                            : "border-[#D6E5D1] bg-[#F4F8F2] text-forest-700"
                        }
                      `}
                    >
                      {isBuyer ? "Shop" : "Grow"}
                    </span>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================== */}

                  <div className="mt-5">
                    <p
                      className={`
                        text-[9px]
                        font-extrabold
                        uppercase
                        tracking-[0.2em]
                        ${
                          isBuyer
                            ? "text-[#B88713]"
                            : "text-forest-700"
                        }
                      `}
                    >
                      {role.eyebrow}
                    </p>

                    <h2
                      className="
                        mt-1.5
                        font-display
                        text-2xl
                        font-semibold
                        tracking-[-0.03em]
                        text-[#173615]
                        sm:text-3xl
                      "
                    >
                      {role.title}
                    </h2>

                    <p
                      className="
                        mt-2
                        max-w-md
                        text-xs
                        leading-5
                        text-[#687265]
                        sm:text-sm
                      "
                    >
                      {role.description}
                    </p>
                  </div>

                  {/* =================================================
                      FEATURES
                  ================================================== */}

                  <div className="mt-5 border-t border-[#EDF0EA] pt-4">
                    <p
                      className="
                        mb-3
                        text-[8px]
                        font-extrabold
                        uppercase
                        tracking-[0.18em]
                        text-[#899286]
                      "
                    >
                      What you can do
                    </p>

                    <ul className="grid gap-2 sm:grid-cols-2">
                      {role.features.map((feature) => (
                        <li
                          key={feature}
                          className="
                            flex
                            items-center
                            gap-2
                            text-[11px]
                            font-semibold
                            text-[#40513D]
                            sm:text-xs
                          "
                        >
                          <span
                            className={`
                              grid
                              size-5
                              shrink-0
                              place-items-center
                              rounded-full
                              ${
                                isBuyer
                                  ? "bg-[#FFF5D8] text-[#A57B10]"
                                  : "bg-[#EDF6EA] text-forest-700"
                              }
                            `}
                          >
                            <Check
                              size={10}
                              strokeWidth={3}
                            />
                          </span>

                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* =================================================
                      CTA
                  ================================================== */}

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(role.destination)
                      }
                      className={`
                        group/button
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        px-4
                        py-3
                        text-xs
                        font-extrabold
                        text-white
                        shadow-md
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        ${
                          isBuyer
                            ? "bg-[#173615] hover:bg-forest-700"
                            : "bg-forest-700 hover:bg-[#173615]"
                        }
                      `}
                    >
                      {role.action}

                      <ArrowRight
                        size={14}
                        className="
                          transition-transform
                          duration-300
                          group-hover/button:translate-x-1
                        "
                      />
                    </button>
                  </div>
                </div>

                {/* Hover accent */}
                <div
                  className={`
                    absolute
                    bottom-0
                    left-1/2
                    h-0.5
                    w-0
                    -translate-x-1/2
                    rounded-full
                    transition-all
                    duration-500
                    group-hover:w-16
                    ${
                      isBuyer
                        ? "bg-[#E5B73A]"
                        : "bg-forest-700"
                    }
                  `}
                />
              </article>
            );
          })}
        </section>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            text-center
            animate-[fadeInUp_0.6s_0.35s_ease-out_both]
          "
        >
          <span className="h-px w-8 bg-[#DDE5D9]" />

          <p
            className="
              text-[9px]
              font-medium
              text-[#899286]
            "
          >
            You can change your preferences later
          </p>

          <span className="h-px w-8 bg-[#DDE5D9]" />
        </div>
      </div>
    </main>
  );
}