import type { Product } from "./products";
import type { ProductApi } from "./api";

const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").origin;

function mediaUrl(path: string | null) {
  if (!path) return "/images/products/placeholder.jpg";
  return path.startsWith("http") ? path : `${apiOrigin}${path}`;
}

export function toMarketplaceProduct(product: ProductApi): Product {
  const price = Number(product.price);
  const farmingMethod = {
    organic: "Organic",
    natural: "Natural",
    conventional: "Conventional",
  } as const satisfies Record<ProductApi["farming_method"], Product["farmingMethod"]>;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category_name,
    categorySlug: product.category_slug,
    pricePerKg: price,
    bulkPrice: Number(product.bulk_price) || price,
    bulkMinimumQuantity: product.bulk_minimum_quantity,
    unit: product.unit,
    stock: product.stock,
    rating: Number(product.rating),
    reviewCount: 0,
    farmer: {
      id: product.farmer,
      name: product.farmer_name,
      farmName: product.farm_name,
      location: product.farmer_location,
      verified: product.farmer_verified,
    },
    image: mediaUrl(product.image),
    farmingMethod: farmingMethod[product.farming_method],
    isSeasonal: product.is_seasonal,
    isFeatured: product.is_featured,
  };
}
