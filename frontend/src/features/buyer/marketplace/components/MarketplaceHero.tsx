import { Leaf, Search, Sprout } from "lucide-react";
import { useState } from "react";

export default function MarketplaceHero() {
  const [search, setSearch] = useState("");

  return (
    <section
      className="
        relative
        flex
        h-[15vh]
        min-h-32
        items-center
        overflow-hidden
        border-b
        border-[#173615]
        bg-[#173615]
      "
    >
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Main gradient */}
        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(105deg,#173615_0%,#21491D_42%,#2D5A27_68%,#395F32_100%)]
          "
        />

        {/* Warm glow */}
        <div
          className="
            absolute
            -right-24
            -top-32
            h-80
            w-80
            rounded-full
            bg-harvest-500/15
            blur-3xl
          "
        />

        {/* Green glow */}
        <div
          className="
            absolute
            -bottom-32
            -left-24
            h-80
            w-80
            rounded-full
            bg-[#6FA565]/20
            blur-3xl
          "
        />

        {/* Soft radial highlight */}
        <div
          className="
            absolute
            right-[25%]
            top-1/2
            h-40
            w-40
            -translate-y-1/2
            rounded-full
            bg-[#A8C4A0]/10
            blur-3xl
          "
        />

        {/* Fine premium pattern */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Botanical decoration */}
        <Leaf
          className="
            absolute
            -left-6
            top-1/2
            hidden
            -translate-y-1/2
            rotate-[-25deg]
            text-white/10
            lg:block
          "
          size={150}
          strokeWidth={0.8}
        />

        <Leaf
          className="
            absolute
            right-[42%]
            top-1/2
            hidden
            -translate-y-1/2
            rotate-25
            text-[#E5B73A]/10
            xl:block
          "
          size={110}
          strokeWidth={0.8}
        />

        <Sprout
          className="
            absolute
            -bottom-6.25
            right-[7%]
            hidden
            text-white/10
            lg:block
          "
          size={100}
          strokeWidth={0.8}
        />
      </div>

      {/* Content */}
      <div
        className="
          relative
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            grid
            items-center
            gap-4
            lg:grid-cols-[1.1fr_0.9fr]
            lg:gap-10
          "
        >
          {/* LEFT — Main message */}
          <div className="text-center lg:text-left">
            <div
              className="
                mb-1
                flex
                items-center
                justify-center
                gap-2
                lg:justify-start
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#E5B73A]" />

              <span
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-[#E5B73A]
                  sm:text-[9px]
                "
              >
                Koshi Bazaar
              </span>
            </div>

            <h1
              className="
                font-display
                text-xl
                font-semibold
                leading-[1.05]
                tracking-[-0.035em]
                text-white
                sm:text-2xl
                lg:text-3xl
              "
            >
              Fresh from the farm.
              <span className="block text-[#E5B73A]">
                Straight to you.
              </span>
            </h1>
          </div>

          {/* RIGHT — Search */}
          <div className="w-full">
            <div
              className="
                rounded-2xl
                border
                border-white/15
                bg-white/10
                p-1
                shadow-[0_16px_40px_rgba(0,0,0,0.18)]
                backdrop-blur-md
                transition-all
                duration-300
                focus-within:border-[#E5B73A]/50
                focus-within:bg-white/15
                focus-within:ring-4
                focus-within:ring-[#E5B73A]/10
              "
            >
              <div className="flex items-center rounded-xl bg-white">
                {/* Search icon */}
                <div
                  className="
                    ml-1
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#EFF5EE]
                    text-forest-700
                    sm:h-9
                    sm:w-9
                  "
                >
                  <Search
                    size={16}
                    strokeWidth={2.2}
                  />
                </div>

                {/* Search input */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Connect search filtering here
                    }
                  }}
                  placeholder="Search fresh produce..."
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-2.5
                    py-2.5
                    text-[11px]
                    text-ink
                    outline-none
                    placeholder:text-[#899286]
                    sm:px-3
                    sm:text-xs
                  "
                  aria-label="Search produce"
                />

                {/* Search button */}
                <button
                  type="button"
                  className="
                    mr-0.5
                    rounded-lg
                    bg-harvest-500
                    px-3
                    py-2
                    text-[11px]
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#A57814]
                    sm:px-4
                    sm:py-2.5
                    sm:text-xs
                  "
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}