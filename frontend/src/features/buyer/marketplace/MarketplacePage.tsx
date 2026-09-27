
import { useEffect, useState } from "react";
import MarketplaceHero from "./components/MarketplaceHero";
import CategoryTabs from "./components/CategoryTabs";
import MarketplaceToolbar from "./components/MarketplaceToolbar";
import ProductGrid from "./components/ProductGrid";
import { getCategories, getProducts, type CategoryApi } from "./data/api";
import { toMarketplaceProduct } from "./data/adaptProduct";
import type { Product } from "./data/products";

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("");
  const [sortBy, setSortBy] = useState("-created_at");
  const [search, setSearch] = useState("");
  const [farmingMethod, setFarmingMethod] = useState("");
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("Unable to load product categories."));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      getProducts({
        page,
        page_size: 12,
        search: search || undefined,
        category: activeCategory || undefined,
        farming_method: farmingMethod
          ? (farmingMethod.toLowerCase() as "organic" | "natural" | "conventional")
          : undefined,
        is_seasonal: seasonalOnly || undefined,
        min_stock: inStockOnly ? 1 : undefined,
        ordering: sortBy,
      })
        .then((data) => {
          setProducts(data.results.map(toMarketplaceProduct));
          setTotal(data.count);
          setHasNext(Boolean(data.next));
          setHasPrevious(Boolean(data.previous));
          setError(null);
        })
        .catch(() => setError("Unable to load products. Please try again."))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [activeCategory, farmingMethod, inStockOnly, page, search, seasonalOnly, sortBy]);

  const clearFilters = () => {
    setActiveCategory("");
    setSearch("");
    setFarmingMethod("");
    setSeasonalOnly(false);
    setInStockOnly(false);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#FCFBF7]">
      {/* =====================================================
          HERO
          ===================================================== */}
      <MarketplaceHero />

      {/* =====================================================
          MARKETPLACE CONTENT
          ===================================================== */}
      <section
        id="products"
        className="
          mx-auto
          max-w-7xl
          px-4
          py-7
          sm:px-6 sm:py-8
          lg:px-8 lg:py-9
        "
      >
        <div className="mb-7">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2
                className="
                  mt-1
                  text-2xl
                  font-extrabold
                  tracking-[-0.035em]
                  text-[#567403]
                  sm:text-[28px]
                "
              >
                Browse by category
              </h2>
            </div>
          </div>

          <div
            className="
              rounded-2xl
              border border-[#E6E9E1]
              bg-white
              p-1.5
              shadow-[0_4px_18px_rgba(23,54,21,0.04)]
            "
          >
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              categories={categories}
            />
          </div>
        </div>
        <div
          className="
            grid
            gap-6
            lg:grid-cols-[220px_minmax(0,1fr)]
            lg:gap-7
          "
        >
          <aside className="hidden lg:block">
            <div
              className="
                sticky top-24
                overflow-hidden
                rounded-[22px]
                border border-[#E4E8E0]
                bg-white
                shadow-[0_5px_22px_rgba(23,54,21,0.05)]
              "
            >
              {/* Filter header */}
              <div
                className="
                  border-b border-[#EEF0EB]
                  bg-[#F3F8F1]
                  px-4 py-4
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-extrabold
                        uppercase
                        tracking-[0.14em]
                        text-forest-700
                      "
                    >
                      Refine
                    </p>

                    <h2
                      className="
                        mt-0.5
                        text-sm
                        font-extrabold
                        text-[#173615]
                      "
                    >
                      Filter produce
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      rounded-lg
                      px-2 py-1.5
                      text-[11px]
                      font-bold
                      text-forest-700
                      transition-colors
                      hover:bg-white
                      hover:text-[#173615]
                    "
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-6 px-4 py-5">
                <FilterSection title="Availability">
                  <FilterOption label="In stock" checked={inStockOnly} onChange={setInStockOnly} />
                  <FilterOption label="Seasonal only" checked={seasonalOnly} onChange={setSeasonalOnly} />
                </FilterSection>

                <FilterSection title="Farming method">
                  {[
                    ["Organic", "organic"],
                    ["Natural", "natural"],
                    ["Conventional", "conventional"],
                  ].map(([label, value]) => (
                    <FilterOption
                      key={value}
                      label={label}
                      checked={farmingMethod === value}
                      onChange={() => setFarmingMethod(farmingMethod === value ? "" : value)}
                    />
                  ))}
                </FilterSection>
              </div>
            </div>
          </aside>

          <div className="min-w-0 ">
            {/* Toolbar */}
            <div
              className="
              bg-amber-100
                rounded-2xl
                border 
                border-amber-200
                p-2
                shadow-[0_4px_18px_rgba(23,54,21,0.04)]
                
              "
            >
              <MarketplaceToolbar
                resultCount={total}
                sortBy={sortBy}
                onSortChange={(value) => { setSortBy(value); setPage(1); }}
                search={search}
                onSearchChange={(value) => { setSearch(value); setPage(1); }}
                activeFilterCount={Number(Boolean(activeCategory)) + Number(Boolean(farmingMethod)) + Number(seasonalOnly) + Number(inStockOnly)}
              />
            </div>

            {/* Product grid */}
            <div className="mt-5">
              {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
              {loading ? <p className="p-8 text-center text-sm text-[#6F7B6B]">Loading fresh produce...</p> : <ProductGrid products={products} />}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button type="button" disabled={!hasPrevious || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm text-[#6F7B6B]">Page {page}</span>
                <button type="button" disabled={!hasNext || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Next</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   FILTER SECTION
   ============================================================ */

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className="
          mb-2.5
          text-[10px]
          font-extrabold
          uppercase
          tracking-[0.13em]
          text-[#53604F]
          
        "
      >
        {title}
      </h3>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   FILTER OPTION
   ============================================================ */

function FilterOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label
      className="
        group
        flex
        cursor-pointer
        items-center
        gap-2.5
        rounded-lg
        px-2 py-1.5
        text-xs
        font-medium
        text-[#6B7C66]
        transition-colors
        hover:bg-[#F3F8F1]
        hover:text-forest-700
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="
          h-3.5 w-3.5
          cursor-pointer
          rounded
          border-[#C8CEC5]
          accent-forest-700
          focus:ring-forest-700
        "
      />

      <span className="transition-colors group-hover:text-forest-700">
        {label}
      </span>
    </label>
  );
}

