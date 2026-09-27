
import {
  ChevronDown,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";

interface MarketplaceToolbarProps {
  resultCount: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  activeFilterCount?: number;
}

export default function MarketplaceToolbar({
  resultCount,
  sortBy,
  onSortChange,
  search,
  onSearchChange,
  onFilterClick,
  activeFilterCount = 0,
}: MarketplaceToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-yellow-100 ">
      {/* =====================================================
          RESULT INFO
          ===================================================== */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="
              hidden h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg
              bg-[#42b90f]
              text-forest-700
              sm:flex
            "
          >
            <PackageSearch size={16} />
          </div>

          <div>
            <h2
              className="
                text-base
                font-extrabold
                tracking-[-0.02em]
                text-[#173615]
                sm:text-lg
              "
            >
              Fresh produce
            </h2>

            <p className="mt-0.5 text-[11px] font-medium text-[#7B8678] sm:text-xs">
              {resultCount}{" "}
              {resultCount === 1 ? "product" : "products"} available
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTROLS
          ===================================================== */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <label className="min-w-0 flex-1 sm:max-w-xs">
          <span className="sr-only">Search products</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search produce..."
            className="w-full rounded-xl border border-[#DCE2D8] bg-white px-3 py-2.5 text-xs font-medium text-[#53604F] outline-none placeholder:text-[#9AA498] focus:border-forest-700"
          />
        </label>
        {/* Mobile filter */}
        <button
          type="button"
          onClick={onFilterClick}
          className="
            relative
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border border-[#DCE2D8]
            bg-white
            px-3
            py-2.5
            text-xs
            font-bold
            text-[#53604F]
            shadow-[0_2px_8px_rgba(23,54,21,0.03)]
            transition-all
            hover:border-forest-700/30
            hover:bg-[#F3F8F1]
            hover:text-forest-700
            active:scale-[0.98]
            lg:hidden
          "
        >
          <SlidersHorizontal size={15} />

          <span className="hidden xs:inline">
            Filters
          </span>

          {activeFilterCount > 0 && (
            <span
              className="
                grid
                h-4 min-w-4
                place-items-center
                rounded-full
                bg-[#E5B73A]
                px-1
                text-[9px]
                font-extrabold
                text-[#173615]
              "
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <label
          className="
            relative
            flex
            items-center
            overflow-hidden
            rounded-xl
            border border-[#DCE2D8]
            bg-white
            shadow-[0_2px_8px_rgba(23,54,21,0.03)]
            transition-all
            hover:border-forest-700/30
            hover:bg-[#F3F8F1]
          "
        >
          <span className="sr-only">
            Sort products
          </span>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="
              cursor-pointer
              appearance-none
              bg-transparent
              py-2.5
              pl-3
              pr-9
              text-[11px]
              font-bold
              text-[#53604F]
              outline-none
              sm:text-xs
              sm:pr-10
            "
          >
            <option value="featured">
              Featured
            </option>

            <option value="price-low">
              Price: Low to high
            </option>

            <option value="price-high">
              Price: High to low
            </option>

            <option value="-created_at">
              Newest
            </option>
          </select>

          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className="
              pointer-events-none
              absolute
              text-forest-700
              right-3
            "
          />
        </label>
      </div>
    </div>
  );
}

