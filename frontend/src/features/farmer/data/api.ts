import apiClient from "../../../api/apiClient";
import type { PaginatedResponse } from "../../buyer/marketplace/data/api";
import type {
  OrderApi as BuyerOrderApi,
} from "../../buyer/orders/data/api";
import type { CurrentUserApi } from "../../auth/data/api";

/**
 * Farmer-facing API layer.
 *
 * Covers the farm workspace — the fulfilment queue, catalogue, profile — plus
 * the farmer's activity *as a buyer* (personal info and orders they placed).
 * Both views exist because a farmer account can purchase produce too.
 */

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface FarmerProfileApi {
  id: number;
  user: number;
  farm_name: string;
  address: string;
  municipality: string;
  district: string;
  province: string;
  description: string;
  farm_image: string | null;
  verification_document: string | null;
  verification_status: VerificationStatus;
  verification_note: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A farmer's own line item inside a buyer's order. */
export interface FarmerOrderItemApi {
  id: number;
  product: number;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  unit: string;
  farmer_fulfilled: boolean;
  fulfilled_at: string | null;
  created_at: string;
}

/**
 * An order that contains at least one row from this farm. `items` is already
 * filtered to this farmer's rows by `FarmerOrderSerializer`, and
 * `pending_items` badges orders that still need packing.
 */
export interface FarmerOrderApi {
  id: number;
  customer_name: string;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_address: string;
  municipality: string;
  district: string;
  province: string;
  delivery_instructions: string;
  created_at: string;
  pending_items: number;
  items: FarmerOrderItemApi[];
}

export interface FarmerCategoryApi {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FarmingMethod = "organic" | "natural" | "conventional";

export interface FarmerProductApi {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_name: string;
  category_slug: string;
  farmer: number;
  farmer_name: string;
  farm_name: string;
  farmer_location: string;
  farmer_verified: boolean;
  price: string;
  bulk_price: string;
  bulk_minimum_quantity: number;
  rating: number;
  unit: string;
  stock: number;
  image: string | null;
  farming_method: FarmingMethod;
  is_seasonal: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function getFarmerProfile(): Promise<FarmerProfileApi> {
  return apiClient
    .get<FarmerProfileApi>("/profiles/farmer/")
    .then((response) => response.data);
}

/**
 * Updates editable farmer profile fields (everything except verification
 * workflow fields, which are read-only on this endpoint).
 */
export function updateFarmerProfile(
  payload: FormData,
): Promise<FarmerProfileApi> {
  return apiClient
    .put<FarmerProfileApi>("/profiles/farmer/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
}

/**
 * Submits (or re-submits) the farm for admin review. Sending a fresh
 * application resets a previous rejection to `pending`, so the note the admin
 * left is cleared on the server side.
 */
export function submitVerification(
  payload: FormData,
): Promise<FarmerProfileApi> {
  return apiClient
    .put<FarmerProfileApi>("/profiles/farmer/verification/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
}

export function getFarmerOrders(): Promise<FarmerOrderApi[]> {
  return apiClient
    .get<FarmerOrderApi[]>("/orders/farmer/orders/")
    .then((response) => response.data);
}

/** Marks one line item packed. Re-packing an already-packed row is a 400. */
export function fulfilOrderItem(itemId: number): Promise<FarmerOrderItemApi> {
  return apiClient
    .post<FarmerOrderItemApi>(`/orders/farmer/items/${itemId}/fulfil/`)
    .then((response) => response.data);
}

/**
 * Orders *placed by* this account (farmer acting as a buyer). Hits the same
 * endpoint the regular buyer UI uses — it filters by `customer=self.request.user`
 * regardless of role.
 */
export function getFarmerBuyerOrders(): Promise<BuyerOrderApi[]> {
  return apiClient
    .get<BuyerOrderApi[]>("/orders/")
    .then((response) => response.data);
}

/** The signed-in farmer's user account (name, email, phone, profile picture). */
export function getFarmerAccount(): Promise<CurrentUserApi> {
  return apiClient
    .get<CurrentUserApi>("/auth/me/")
    .then((response) => response.data);
}

/**
 * Self-service edit on the farmer's own user account. Accepts `name`, `phone`
 * and `profile_picture`. Email and role are locked server-side.
 */
export function updateFarmerAccount(
  payload: FormData,
): Promise<CurrentUserApi> {
  return apiClient
    .put<CurrentUserApi>("/auth/me/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
}

/** Active categories a farmer can file products under. */
export function getFarmerCategories(): Promise<FarmerCategoryApi[]> {
  return apiClient
    .get<FarmerCategoryApi[]>("/products/categories/")
    .then((response) => response.data);
}

/** The farmer's own catalogue (drafts + active + out-of-stock). */
export function getFarmerProducts(
  page = 1,
  pageSize = 50,
): Promise<PaginatedResponse<FarmerProductApi>> {
  return apiClient
    .get<PaginatedResponse<FarmerProductApi>>("/products/farmer/products/", {
      params: { page, page_size: pageSize },
    })
    .then((response) => response.data);
}

export function createFarmerProduct(
  payload: FormData,
): Promise<FarmerProductApi> {
  return apiClient
    .post<FarmerProductApi>("/products/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
}

/**
 * A *partial* update on purpose. The dialogue rebuilds the whole form, but the
 * curation flags (`is_featured`) are deliberately never part of it — featuring
 * is an admin decision, not the farmer's. A full `PUT` would apply the model
 * defaults for every field the form omits and silently un-feature the product;
 * `PATCH` leaves everything unsent exactly as it was.
 */
export function updateFarmerProduct(
  productId: number,
  payload: FormData,
): Promise<FarmerProductApi> {
  return apiClient
    .patch<FarmerProductApi>(`/products/${productId}/`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
}

export function deleteFarmerProduct(productId: number): Promise<void> {
  return apiClient
    .delete<void>(`/products/${productId}/`)
    .then((response) => response.data);
}
