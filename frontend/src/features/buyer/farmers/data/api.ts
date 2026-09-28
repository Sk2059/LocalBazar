import apiClient from "../../../../api/apiClient";

import type { PaginatedResponse } from "../../marketplace/data/api";

/**
 * A farm's public profile, as returned by `/api/v1/profiles/farmers/`.
 *
 * `id` is the farm's *account* id — the same value `product.farmer` and
 * `order_item.farmer` carry — so links work identically from a product card,
 * an order or the directory.
 */
export interface FarmerApi {
  id: number;
  farmer_name: string;
  farm_name: string;
  description: string;
  municipality: string;
  district: string;
  province: string;
  location: string;
  farm_image: string | null;
  profile_picture: string | null;
  verified: boolean;
  joined: string;
  product_count: number;
  avg_rating: number;
  orders_count: number;
  categories: string[];
  farming_methods: string[];
  created_at: string;
}

export interface FarmerQuery {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export async function getFarmers(params: FarmerQuery = {}) {
  const response = await apiClient.get<PaginatedResponse<FarmerApi>>(
    "/profiles/farmers/",
    { params },
  );

  return response.data;
}

export async function getFarmer(farmerId: number) {
  const response = await apiClient.get<FarmerApi>(
    `/profiles/farmers/${farmerId}/`,
  );

  return response.data;
}
