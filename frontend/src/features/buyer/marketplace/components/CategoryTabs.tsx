import {
  Apple,
  Carrot,
  Leaf,
  Wheat,
  Sprout,
} from "lucide-react";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: { name: string; slug: string }[];
}

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categories,
}: CategoryTabsProps) {
  const categoryTabs = [
    { name: "All Produce", slug: "", icon: Sprout },
    ...categories.map((category) => ({
      ...category,
      icon: category.name.toLowerCase().includes("fruit")
        ? Apple
        : category.name.toLowerCase().includes("leaf")
          ? Leaf
          : category.name.toLowerCase().includes("grain")
            ? Wheat
            : Carrot,
    })),
  ];

  return (
    <section className="border-b border-[#E6E2D8] bg-[#FCFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex min-w-max items-center gap-2 sm:gap-2.5">
            {categoryTabs.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.slug;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => onCategoryChange(category.slug)}
                  className={[
                    "group relative inline-flex shrink-0 items-center gap-2",
                    "rounded-xl border px-3.5 py-2.5",
                    "text-xs font-semibold sm:px-4 sm:text-sm",
                    "transition-all duration-300 ease-out",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8941A]/40",
                    active
                      ? [
                          "border-[#315D2D]",
                          "bg-[linear-gradient(135deg,#173615_0%,#2D5A27_100%)]",
                          "text-white",
                          "shadow-[0_8px_20px_rgba(23,54,21,0.22)]",
                          "-translate-y-px",
                        ].join(" ")
                      : [
                          "border-[#E1E4DC]",
                          "bg-white",
                          "text-[#596558]",
                          "shadow-[0_2px_8px_rgba(30,50,30,0.03)]",
                          "hover:-translate-y-px",
                          "hover:border-[#9DB797]",
                          "hover:bg-[#F3F8F1]",
                          "hover:text-forest-700",
                          "hover:shadow-[0_8px_18px_rgba(45,90,39,0.08)]",
                        ].join(" "),
                  ].join(" ")}
                >
                  {/* Icon container */}
                  <span
                    className={[
                      "flex size-7 items-center justify-center rounded-lg",
                      "transition-all duration-300",
                      active
                        ? "bg-[#E5B73A] text-[#173615]"
                        : "bg-[#F1F5EF] text-[#5C8156] group-hover:bg-[#DCEBD9] group-hover:text-forest-700",
                    ].join(" ")}
                  >
                    <Icon
                      size={15}
                      strokeWidth={2.2}
                    />
                  </span>

                  <span className="whitespace-nowrap">
                    {category.name}
                  </span>

                  {/* Active indicator */}
                  {active && (
                    <span className="absolute inset-x-5 -bottom-1.25 h-0.75 rounded-full bg-[#E5B73A]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}