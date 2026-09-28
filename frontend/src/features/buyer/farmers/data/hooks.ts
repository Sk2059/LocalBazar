import { useQuery } from "@tanstack/react-query";

import { getProducts } from "../../marketplace/data/api";

import { getFarmer, getFarmers } from "./api";
import { toFarmer } from "./adaptFarmer";

/**
 * Farmers feature query hooks.
 *
 * Cache keys: `["farmers"]` (directory) and `["farmers", farmerId]` /
 * `["farmer-products", farmerId]` (detail). The directory asks for a large
 * page so the filters (search + farming method) can run entirely client-side
 * — the catalogue is small, and that keeps the page instant while typing.
 */

export function useFarmers() {
  return useQuery({
    queryKey: ["farmers"],
    queryFn: () => getFarmers({ page_size: 100 }),
    select: (data) => data.results.map(toFarmer),
  });
}

export function useFarmer(farmerId: number | undefined) {
  return useQuery({
    queryKey: ["farmers", farmerId],
    enabled: farmerId !== undefined,
    queryFn: () => getFarmer(farmerId as number),
    select: toFarmer,
  });
}

export function useFarmerProducts(farmerId: number | undefined) {
  return useQuery({
    queryKey: ["farmer-products", farmerId],
    enabled: farmerId !== undefined,
    queryFn: () => getProducts({ farmer: farmerId as number, page_size: 100 }),
  });
}
