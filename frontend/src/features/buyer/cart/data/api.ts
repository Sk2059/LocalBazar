import apiClient from "../../../../api/apiClient";
import type { ProductApi } from "../../marketplace/data/api";

export interface CartItemApi {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  product_price: string;
  product_bulk_price: string;
  product_bulk_minimum_quantity: number;
  product_category_name: string;
  product_category_slug: string;
  product_rating: string;
  product_unit: string;
  product_image: string | null;
  product_farming_method: ProductApi["farming_method"];
  product_is_seasonal: boolean;
  product_is_featured: boolean;
  available_stock: number;
  farmer_id: number;
  farmer_name: string;
  farm_name: string;
  farmer_location: string;
  farmer_verified: boolean;
  quantity: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface CartApi {
  id: number;
  items: CartItemApi[];
  total_items: number;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches the cart for the authenticated user. The endpoint creates the cart
 * on demand, so this never returns a 404.
 */
export async function getCart(): Promise<CartApi> {
  const response = await apiClient.get<CartApi>("/cart/");
  return response.data;
}

/**
 * Adds a product to the cart. If the product is already in the cart the
 * quantity is merged, and the resulting cart item is returned.
 */
export async function addCartItem(
  product: number,
  quantity: number,
): Promise<CartItemApi> {
  const response = await apiClient.post<CartItemApi>("/cart/items/", {
    product,
    quantity,
  });
  return response.data;
}

export async function updateCartItem(
  itemId: number,
  quantity: number,
): Promise<CartItemApi> {
  const response = await apiClient.patch<CartItemApi>(
    `/cart/items/${itemId}/`,
    { quantity },
  );
  return response.data;
}

export async function removeCartItem(itemId: number): Promise<void> {
  await apiClient.delete(`/cart/items/${itemId}/`);
}
