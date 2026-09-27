import apiClient from "../../../../api/apiClient";

/**
 * Delivery zone data. Zones are public (`AllowAny`) so the checkout page can
 * show an honest delivery-fee *estimate* before the order is placed. The final
 * fee is always whatever the server charges at checkout — never recomputed
 * from these numbers on the client.
 */
export interface DeliveryZoneApi {
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

export async function getDeliveryZones(): Promise<DeliveryZoneApi[]> {
  const response = await apiClient.get<DeliveryZoneApi[]>("/delivery/zones/");
  return response.data;
}
