import apiClient from "../../../api/apiClient";

/**
 * Farmer-facing API layer.
 *
 * Everything here is scoped server-side to the requesting farmer — the queue
 * only ever returns line items that belong to their farm — so the client can
 * render it without filtering.
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

export function getFarmerProfile(): Promise<FarmerProfileApi> {
  return apiClient
    .get<FarmerProfileApi>("/profiles/farmer/")
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
