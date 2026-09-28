import apiClient from "../../../api/apiClient";
import type { OrderApi } from "../../buyer/orders/data/api";

/**
 * Admin console API layer.
 *
 * Every endpoint below is admin-only on the server (`IsAdminRole`), so the
 * console can render whatever comes back without re-checking permissions.
 */

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface AdminStatsApi {
  users: { total: number; buyers: number; farmers: number; admins: number };
  verification: {
    pending: number;
    verified: number;
    rejected: number;
  };
  orders: {
    total: number;
    revenue: string;
    [status: string]: number | string;
  };
  products: {
    total: number;
    active: number;
    out_of_stock: number;
    low_stock: number;
  };
  categories: number;
  recent_orders: {
    id: number;
    customer_name: string;
    total: string;
    status: string;
    payment_status: string;
    created_at: string;
  }[];
}

/** `AdminFarmerProfileSerializer`: a profile with the account fields the queue
 *  displays and an annotated catalogue size. */
export interface AdminFarmerApi {
  id: number;
  farmer_name: string;
  farmer_email: string;
  farmer_phone: string | null;
  profile_picture: string | null;
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
  product_count: number;
  created_at: string;
}

export interface AdminUserApi {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_picture: string | null;
  role: "buyer" | "farmer" | "admin";
  is_active: boolean;
  order_count: number;
  created_at: string;
}

export interface AdminUserUpdatePayload {
  name?: string;
  phone?: string;
  role?: AdminUserApi["role"];
  is_active?: boolean;
}

export type OrderStatusUpdate = {
  status: OrderApi["status"];
  payment_status?: OrderApi["payment_status"];
};

/**
 * `AdminCategorySerializer`: a category with a live product count. Unlike the
 * public list, this one includes archived (`is_active=false`) rows — the whole
 * point of the console tab.
 */
export interface AdminCategoryApi {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * `AdminDeliveryZoneSerializer` — structurally the public zone shape; the admin
 * endpoint just adds the paused ones to the list.
 */
export interface AdminDeliveryZoneApi {
  id: number;
  name: string;
  province: string;
  district: string;
  municipality: string;
  delivery_fee: string;
  estimated_delivery_days: number;
  minimum_order_amount: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminDeliveryZonePayload {
  name: string;
  province: string;
  district: string;
  municipality: string;
  delivery_fee: number | string;
  estimated_delivery_days: number;
  minimum_order_amount: number | string;
  is_active?: boolean;
}

/**
 * `ProductSerializer` — the admin catalogue row. Unlike the public list this
 * shape includes drafts and out-of-stock products, because the console has to
 * curate rows the marketplace deliberately hides.
 */
export interface AdminProductApi {
  id: number;
  name: string;
  slug: string;
  category_name: string;
  farmer_name: string;
  farm_name: string;
  price: string;
  unit: string;
  stock: number;
  image: string | null;
  is_seasonal: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

/** The console only ever toggles the curation flags; the farmer owns the rest. */
export interface AdminProductUpdatePayload {
  is_featured?: boolean;
  is_active?: boolean;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


export function getAdminStats(): Promise<AdminStatsApi> {
  return apiClient
    .get<AdminStatsApi>("/auth/admin/stats/")
    .then((response) => response.data);
}

export function getAdminFarmers(
  verificationStatus?: VerificationStatus,
): Promise<AdminFarmerApi[]> {
  return apiClient
    .get<AdminFarmerApi[]>("/profiles/admin/farmers/", {
      params: verificationStatus ? { verification_status: verificationStatus } : undefined,
    })
    .then((response) => response.data);
}

export function approveFarmer(farmerId: number): Promise<AdminFarmerApi> {
  return apiClient
    .post<AdminFarmerApi>(`/profiles/admin/farmers/${farmerId}/approve/`)
    .then((response) => response.data);
}

/** A rejection without a reason is a 400 on the server; the UI enforces it too. */
export function rejectFarmer(
  farmerId: number,
  verificationNote: string,
): Promise<AdminFarmerApi> {
  return apiClient
    .post<AdminFarmerApi>(
      `/profiles/admin/farmers/${farmerId}/reject/`,
      { verification_note: verificationNote },
    )
    .then((response) => response.data);
}

export function getAdminUsers(): Promise<AdminUserApi[]> {
  return apiClient
    .get<AdminUserApi[]>("/auth/admin/users/")
    .then((response) => response.data);
}

export function updateAdminUser(
  userId: number,
  payload: AdminUserUpdatePayload,
): Promise<AdminUserApi> {
  return apiClient
    .patch<AdminUserApi>(`/auth/admin/users/${userId}/`, payload)
    .then((response) => response.data);
}

export function getAdminOrders(): Promise<OrderApi[]> {
  return apiClient
    .get<OrderApi[]>("/orders/admin/orders/")
    .then((response) => response.data);
}

export function updateOrderStatus(
  orderId: number,
  payload: OrderStatusUpdate,
): Promise<OrderApi> {
  return apiClient
    .patch<OrderApi>(`/orders/admin/orders/${orderId}/status/`, payload)
    .then((response) => response.data);
}

// ── Products ─────────────────────────────────────────────────────────────────

/**
 * Every product in the catalogue, drafts and out-of-stock rows included. The
 * endpoint is paginated (page_size tops out at 60 server-side), so the console
 * asks for the maximum and renders one page — the catalogue is small enough
 * that paged navigation isn't worth the state.
 */
export function getAdminProducts(): Promise<AdminProductApi[]> {
  return apiClient
    .get<PaginatedResponse<AdminProductApi>>("/products/admin/products/", {
      params: { page_size: 60 },
    })
    .then((response) => response.data.results);
}

export function updateAdminProduct(
  productId: number,
  payload: AdminProductUpdatePayload,
): Promise<AdminProductApi> {
  return apiClient
    .patch<AdminProductApi>(`/products/admin/products/${productId}/`, payload)
    .then((response) => response.data);
}

export function deleteAdminProduct(productId: number): Promise<void> {
  return apiClient
    .delete(`/products/admin/products/${productId}/`)
    .then(() => undefined);
}

// ── Categories ──────────────────────────────────────────────────────────────

export function getAdminCategories(): Promise<AdminCategoryApi[]> {
  return apiClient
    .get<AdminCategoryApi[]>("/products/admin/categories/")
    .then((response) => response.data);
}

/**
 * Creates a category. The image is optional but, when attached, is the only
 * reason this uses multipart — the rest of the fields ride along as form text.
 * The server derives the slug from the name, so it's never sent.
 */
export function createAdminCategory(
  payload: FormData,
): Promise<AdminCategoryApi> {
  return apiClient
    .post<AdminCategoryApi>("/products/admin/categories/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
}

export function updateAdminCategory(
  categoryId: number,
  payload: FormData,
): Promise<AdminCategoryApi> {
  return apiClient
    .patch<AdminCategoryApi>(
      `/products/admin/categories/${categoryId}/`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    .then((response) => response.data);
}

export function deleteAdminCategory(categoryId: number): Promise<void> {
  return apiClient
    .delete(`/products/admin/categories/${categoryId}/`)
    .then(() => undefined);
}

// ── Delivery locations ─────────────────────────────────────────────────────

export function getAdminDeliveryZones(): Promise<AdminDeliveryZoneApi[]> {
  return apiClient
    .get<AdminDeliveryZoneApi[]>("/delivery/admin/zones/")
    .then((response) => response.data);
}

export function createAdminDeliveryZone(
  payload: AdminDeliveryZonePayload,
): Promise<AdminDeliveryZoneApi> {
  return apiClient
    .post<AdminDeliveryZoneApi>("/delivery/admin/zones/", payload)
    .then((response) => response.data);
}

export function updateAdminDeliveryZone(
  zoneId: number,
  payload: Partial<AdminDeliveryZonePayload>,
): Promise<AdminDeliveryZoneApi> {
  return apiClient
    .patch<AdminDeliveryZoneApi>(`/delivery/admin/zones/${zoneId}/`, payload)
    .then((response) => response.data);
}

export function deleteAdminDeliveryZone(zoneId: number): Promise<void> {
  return apiClient
    .delete(`/delivery/admin/zones/${zoneId}/`)
    .then(() => undefined);
}
