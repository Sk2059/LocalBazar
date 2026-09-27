import {
  ArrowRight,
  Apple,
  Carrot,
  Cherry,
  Leaf,
  Wheat,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Container from "../../../../components/common/Container";
import { getCategories, type CategoryApi } from "../../marketplace/data/api";

type Category = {
  slug: string;
  name: string;
  description: string;
  count: string;
  image: string;
  icon: React.ReactNode;
};

const categoryPresentation: Record<string, { image: string; icon: React.ReactNode }> = {
  vegetables: { image: "/images/categories/vagetable.png", icon: <Carrot size={19} /> },
  fruits: { image: "/images/categories/fruits.png", icon: <Apple size={19} /> },
  "leafy-greens": { image: "/images/categories/leafy.png", icon: <Leaf size={19} /> },
  seasonal: { image: "/images/categories/seasonal.png", icon: <Cherry size={19} /> },
  "grains-pulses": { image: "/images/categories/grain.png", icon: <Wheat size={19} /> },
};

const defaultPresentation = {
  image: "/images/categories/vagetable.png",
  icon: <Leaf size={19} />,
};

function toCategory(category: CategoryApi): Category {
  const presentation = categoryPresentation[category.slug] ?? defaultPresentation;

  return {
    slug: category.slug,
    name: category.name,
    description: category.description || "Fresh produce from local farms",
    count: "Explore produce",
    image: category.image || presentation.image,
    icon: presentation.icon,
  };
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.map(toCategory)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FAF8F3] py-20 sm:py-24 lg:py-28">
      

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 size-105 rounded-full bg-[#EDF4E9] blur-3xl" />

        <div className="absolute -right-40 bottom-0 size-100 rounded-full bg-[#F5EACF]/50 blur-3xl" />
      </div>

      <Container className="relative">

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            

            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-7 bg-[#D5A82E]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A57916]">
                Shop local
              </span>
            </div>

            <h2
              className="
                font-display
                text-[38px]
                font-semibold
                leading-[1.05]
                tracking-[-0.035em]
                text-[#182719]

                sm:text-[46px]

                lg:text-[52px]
              "
            >
              Everything fresh,
              <span className="text-[#316934]">
                {" "}
                from nearby farms.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#686963] sm:text-[15px]">
              Explore locally grown produce from farmers
              across Koshi Province. Choose what you need,
              discover who grows it, and bring farm-fresh
              food home.
            </p>
          </div>

          

          <Link
            to="/marketplace"
            className="
              group
              inline-flex
              shrink-0
              items-center
              gap-2
              self-start
              rounded-xl
              border
              border-[#D5DED1]
              bg-white/70
              px-4
              py-3
              text-xs
              font-extrabold
              text-[#315F32]
              shadow-sm
              transition-all

              hover:border-[#B8CCB2]
              hover:bg-white
              hover:shadow-md

              md:self-end
            "
          >
            View all produce

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>


        <div
          className="
            mt-10
            grid
            items-stretch
            gap-5

            sm:grid-cols-2

            lg:mt-12
            lg:grid-cols-4
          "
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
            />
          ))}
        </div>


        <div
          className="
            mt-10
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-[#DCE5D8]
            bg-[#F0F5EC]
            p-5

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-6
          "
        >
          <div className="flex items-center gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#316934] shadow-sm">
              <Leaf size={20} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#253525]">
                Supporting Koshi's farmers
              </p>

              <p className="mt-1 text-xs leading-5 text-[#74786F]">
                Every purchase helps local farmers reach
                more customers directly.
              </p>
            </div>
          </div>

          <Link
            to="/farmers"
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              font-extrabold
              text-[#316934]
              transition-colors
              hover:text-[#214D25]
            "
          >
            Meet our farmers

            <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}



function CategoryCard({
  category,
}: {
  category: Category;
}) {
  return (
    <Link
      to={`/marketplace?category=${encodeURIComponent(category.slug)}`}
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border border-[#E5E2DA]
        bg-white
        shadow-[0_10px_28px_rgba(35,55,35,0.06)]
        transition-all
        duration-500

        hover:-translate-y-2
        hover:border-[#CFDDC9]
        hover:shadow-[0_22px_46px_rgba(35,65,35,0.14)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#316934]/40
        focus-visible:ring-offset-4
      "
    >


      <div
        className="
          relative
          overflow-hidden
          bg-[#E8EFE4]
          h-55
          sm:h-57.5
        "
      >
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            brightness-[0.93]
            transition-[transform,filter]
            duration-700
            ease-out
            group-hover:scale-105
            group-hover:brightness-105
          "
        />

        {/* Image overlay */}

        <div
          className="
            absolute
            inset-0
            bg-linear-to-t
            from-[#102D13]/80
            via-[#102D13]/10
            to-[#102D13]/5
          "
        />

        <div
          className="
            absolute
            left-4
            top-4
            grid
            size-11
            place-items-center
            rounded-2xl
            border border-white/60
            bg-white/85
            text-[#316934]
            shadow-[0_8px_20px_rgba(16,45,19,0.16)]
            backdrop-blur-md
          "
        >
          {category.icon}
        </div>

   

        <span
          className="
            absolute
            bottom-4
            left-4
            rounded-full
            border border-white/25
            bg-[#102D13]/35
            px-3
            py-1.5
            text-[10px]
            font-extrabold
            uppercase
            tracking-[0.12em]
            text-white
            backdrop-blur-md
          "
        >
          {category.count}
        </span>

        <span className="absolute bottom-4 right-4 text-[10px] font-bold text-white/85 transition-transform duration-300 group-hover:translate-x-0.5">
          Browse <ArrowRight size={13} className="ml-1 inline" />
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A57916]">
              Local selection
            </p>

            <h3 className="truncate text-[16px] font-extrabold tracking-[-0.01em] text-[#1F2A20]">
              {category.name}
            </h3>

            <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-[#888A84]">
              {category.description}
            </p>
          </div>

          <span
            className="
              grid
              size-9
              shrink-0
              place-items-center
              rounded-xl
              bg-[#F0F5EC]
              text-[#316934]
              shadow-[inset_0_0_0_1px_rgba(49,105,52,0.08)]
              transition-all

              group-hover:bg-[#316934]
              group-hover:text-white
              group-hover:shadow-[0_6px_14px_rgba(49,105,52,0.22)]
            "
          >
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}