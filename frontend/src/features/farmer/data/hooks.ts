import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { CurrentUserApi } from "../../auth/data/api";

import {
  createFarmerProduct,
  deleteFarmerProduct,
  fulfilOrderItem,
  getFarmerAccount,
  getFarmerBuyerOrders,
  getFarmerCategories,
  getFarmerOrders,
  getFarmerProducts,
  getFarmerProfile,
  submitVerification,
  type FarmerProductApi,
  type FarmerProfileApi,
  updateFarmerAccount,
  updateFarmerProduct,
  updateFarmerProfile,
} from "./api";

/**
 * Farmer feature query hooks.
 *
 * Cache keys:
 * - `["farmer-profile"]`        — the editable farm profile + verification state
 * - `["farmer-account"]`        — the farmer's *user* account (name, phone, avatar)
 * - `["farmer-orders"]`         — the fulfilment queue (orders TO the farm)
 * - `["farmer-buyer-orders"]`   — orders BY this farmer (acting as a customer)
 * - `["farmer-categories"]`     — active product categories
 * - `["farmer-products"]`       — the farmer's own catalogue
 */

export function useFarmerProfile() {
  return useQuery({
    queryKey: ["farmer-profile"],
    queryFn: getFarmerProfile,
  });
}

export function useUpdateFarmerProfile() {
  const queryClient = useQueryClient();

  return useMutation<FarmerProfileApi, Error, FormData>({
    mutationFn: (payload) => updateFarmerProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(["farmer-profile"], profile);
    },
  });
}

export function useFarmerAccount() {
  return useQuery({
    queryKey: ["farmer-account"],
    queryFn: getFarmerAccount,
  });
}

export function useUpdateFarmerAccount() {
  const queryClient = useQueryClient();

  return useMutation<CurrentUserApi, Error, FormData>({
    mutationFn: (payload) => updateFarmerAccount(payload),
    onSuccess: (account) => {
      queryClient.setQueryData(["farmer-account"], account);
      queryClient.setQueryData(["current-user"], account);
    },
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation<FarmerProfileApi, Error, FormData>({
    mutationFn: (payload) => submitVerification(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(["farmer-profile"], profile);
    },
  });
}

export function useFarmerOrders() {
  return useQuery({
    queryKey: ["farmer-orders"],
    queryFn: getFarmerOrders,
  });
}

export function useFulfilOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => fulfilOrderItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["farmer-orders"],
      });
    },
  });
}

export function useFarmerBuyerOrders() {
  return useQuery({
    queryKey: ["farmer-buyer-orders"],
    queryFn: getFarmerBuyerOrders,
  });
}

export function useFarmerCategories() {
  return useQuery({
    queryKey: ["farmer-categories"],
    queryFn: getFarmerCategories,
  });
}

export function useFarmerProducts() {
  return useQuery({
    queryKey: ["farmer-products"],
    queryFn: () => getFarmerProducts(1, 100),
  });
}

export function useCreateFarmerProduct() {
  const queryClient = useQueryClient();

  return useMutation<FarmerProductApi, Error, FormData>({
    mutationFn: (payload) => createFarmerProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["farmer-products"],
      });
    },
  });
}

export function useUpdateFarmerProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    FarmerProductApi,
    Error,
    { productId: number; payload: FormData }
  >({
    mutationFn: ({ productId, payload }) =>
      updateFarmerProduct(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["farmer-products"],
      });
    },
  });
}

export function useDeleteFarmerProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (productId) => deleteFarmerProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["farmer-products"],
      });
    },
  });
}
