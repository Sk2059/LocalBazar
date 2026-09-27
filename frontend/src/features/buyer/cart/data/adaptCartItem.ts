import type { CartItem } from "../../../../context/CartContext";
import type { Product } from "../../marketplace/data/products";
import type { CartItemApi } from "./api";

const apiOrigin = new URL(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
).origin;

function mediaUrl(path: string | null) {
  if (!path) return "/images/products/placeholder.jpg";
  return path.startsWith("http") ? path : `${apiOrigin}${path}`;
}

const farmingMethodMap = {
  organic: "Organic",
  natural: "Natural",
  conventional: "Conventional",
} as const satisfies Record<CartItemApi["product_farming_method"], Product["farmingMethod"]>;

/**
 * Converts a cart item coming from the API into the shape the cart UI
 * expects, so the rest of the app can keep working with a plain `Product`.
 */
export function toCartItem(apiItem: CartItemApi): CartItem {
  const price = Number(apiItem.product_price);
  const stock = apiItem.available_stock;

  const product: Product = {
    id: apiItem.product,
    name: apiItem.product_name,
    slug: apiItem.product_slug,
    category: apiItem.product_category_name,
    categorySlug: apiItem.product_category_slug,
    pricePerKg: price,
    // Mirror the marketplace adapter: a missing/zero bulk price means the
    // farmer never set bulk pricing, so the regular price applies.
    bulkPrice: Number(apiItem.product_bulk_price) || price,
    bulkMinimumQuantity: apiItem.product_bulk_minimum_quantity,
    unit: apiItem.product_unit,
    stock: stock,
    rating: Number(apiItem.product_rating),
    reviewCount: 0,
    farmer: {
      id: apiItem.farmer_id,
      name: apiItem.farmer_name,
      farmName: apiItem.farm_name,
      location: apiItem.farmer_location,
      verified: apiItem.farmer_verified,
    },
    image: mediaUrl(apiItem.product_image),
    farmingMethod: farmingMethodMap[apiItem.product_farming_method],
    isSeasonal: apiItem.product_is_seasonal,
    isFeatured: apiItem.product_is_featured,
  };

  return {
    product,
    // A persisted line can exceed the current stock when the farmer's
    // inventory dropped after the item was added. The cart shows only the
    // purchasable amount (the checkout endpoint re-validates anyway), and a
    // 0-quantity line means the product went out of stock entirely.
    quantity: stock > 0 ? Math.min(apiItem.quantity, stock) : 0,
    itemId: apiItem.id,
  };
}
