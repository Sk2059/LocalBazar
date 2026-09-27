import apiClient from "../../../../api/apiClient";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "khalti";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/**
 * The payment record attached to an order. Mirrors
 * `OrderPaymentSerializer` on the server, which is nested read-only on the
 * order payload, so `null` only happens for legacy rows without a payment.
 */
export interface OrderPaymentApi {
  id: number;
  provider: "khalti" | "cod";
  status: "initiated" | "pending" | "completed" | "failed" | "refunded";
  amount: string;
  transaction_id: string | null;
  pidx: string | null;
  phone: string;
  created_at: string;
  paid_at: string | null;
}

export interface OrderItemApi {
  id: number;
  product: number;
  product_name: string;
  product_image: string | null;
  farmer_name: string;
  farm_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  created_at: string;
}

export interface OrderApi {
  id: number;
  customer: number;
  customer_name: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_address: string;
  municipality: string;
  district: string;
  province: string;
  delivery_instructions: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
  payment: OrderPaymentApi | null;
  items: OrderItemApi[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutPayload {
  payment_method: PaymentMethod;
  delivery_address: string;
  municipality: string;
  district: string;
  /** Optional; the API falls back to "Koshi Province". */
  province?: string;
  delivery_instructions?: string;
}

/**
 * Places an order from the authenticated user's cart. The server snapshots
 * prices, decrements stock and clears the cart atomically, so the returned
 * order is the authoritative record of what was actually charged.
 */
export async function checkout(
  payload: CheckoutPayload,
): Promise<OrderApi> {
  const response = await apiClient.post<OrderApi>(
    "/orders/checkout/",
    payload,
  );
  return response.data;
}

/** Lists the authenticated user's orders, newest first. */
export async function getOrders(): Promise<OrderApi[]> {
  const response = await apiClient.get<OrderApi[]>("/orders/");
  return response.data;
}

export async function getOrder(orderId: number): Promise<OrderApi> {
  const response = await apiClient.get<OrderApi>(`/orders/${orderId}/`);
  return response.data;
}
