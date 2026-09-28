import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  approveFarmer,
  createAdminCategory,
  createAdminDeliveryZone,
  deleteAdminCategory,
  deleteAdminDeliveryZone,
  deleteAdminProduct,
  getAdminCategories,
  getAdminDeliveryZones,
  getAdminFarmers,
  getAdminOrders,
  getAdminProducts,
  getAdminStats,
  getAdminUsers,
  rejectFarmer,
  updateAdminCategory,
  updateAdminDeliveryZone,
  updateAdminProduct,
  updateAdminUser,
  updateOrderStatus,
  type AdminDeliveryZonePayload,
  type AdminProductUpdatePayload,
  type AdminUserUpdatePayload,
  type OrderStatusUpdate,
  type VerificationStatus,
} from "./api";

/**
 * Admin console query hooks.
 *
 * One key per console section. Mutations invalidate their own list (and the
 * stats, whose numbers they move) rather than optimistically patching, so the
 * server's counts stay authoritative.
 */

const KEYS = {
  stats: ["admin-stats"],
  farmers: ["admin-farmers"],
  users: ["admin-users"],
  orders: ["admin-orders"],
  categories: ["admin-categories"],
  deliveryZones: ["admin-delivery-zones"],
  products: ["admin-products"],
} as const;

/** The public zone list the checkout page estimates delivery fees from. */
const PUBLIC_ZONES_KEY = ["delivery-zones"];

export function useAdminStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: getAdminStats,
  });
}

export function useAdminFarmers(status?: VerificationStatus) {
  return useQuery({
    queryKey: [...KEYS.farmers, status ?? "all"],
    queryFn: () => getAdminFarmers(status),
  });
}

export function useApproveFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (farmerId: number) => approveFarmer(farmerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.farmers });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useRejectFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmerId, note }: { farmerId: number; note: string }) =>
      rejectFarmer(farmerId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.farmers });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: KEYS.users,
    queryFn: getAdminUsers,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: AdminUserUpdatePayload;
    }) => updateAdminUser(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.users });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: KEYS.orders,
    queryFn: getAdminOrders,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: number;
      payload: OrderStatusUpdate;
    }) => updateOrderStatus(orderId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.orders });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

// ── Products ─────────────────────────────────────────────────────────────────

export function useAdminProducts() {
  return useQuery({
    queryKey: KEYS.products,
    queryFn: getAdminProducts,
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number;
      payload: AdminProductUpdatePayload;
    }) => updateAdminProduct(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.products });
      // Featuring a product moves the homepage's "Fresh today" row, and the
      // stats card counts active products, so both are refreshed.
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => deleteAdminProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.products });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

// ── Categories ──────────────────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: KEYS.categories,
    queryFn: getAdminCategories,
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => createAdminCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.categories });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, payload }: {
      categoryId: number;
      payload: FormData;
    }) => updateAdminCategory(categoryId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.categories });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => deleteAdminCategory(categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.categories });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

// ── Delivery locations ─────────────────────────────────────────────────────

export function useAdminDeliveryZones() {
  return useQuery({
    queryKey: KEYS.deliveryZones,
    queryFn: getAdminDeliveryZones,
  });
}

export function useCreateAdminDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminDeliveryZonePayload) =>
      createAdminDeliveryZone(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.deliveryZones });
      // The checkout page quotes fees from the public list, so keep it honest.
      void queryClient.invalidateQueries({ queryKey: PUBLIC_ZONES_KEY });
    },
  });
}

export function useUpdateAdminDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, payload }: {
      zoneId: number;
      payload: Partial<AdminDeliveryZonePayload>;
    }) => updateAdminDeliveryZone(zoneId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.deliveryZones });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_ZONES_KEY });
    },
  });
}

export function useDeleteAdminDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: number) => deleteAdminDeliveryZone(zoneId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.deliveryZones });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_ZONES_KEY });
    },
  });
}
