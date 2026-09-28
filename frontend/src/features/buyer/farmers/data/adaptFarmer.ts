import type { FarmerApi } from "./api";

const apiOrigin = new URL(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
).origin;

/**
 * Bundled artwork for farms that haven't uploaded their own yet. Picked by id
 * so a given farm always shows the same photo while the data loads.
 */
const FALLBACK_FARM_IMAGES = [
  "/images/farmers/rameshfarm.png",
  "/images/farmers/mina-farm.png",
  "/images/farmers/dilip-farm.png",
];

const FALLBACK_AVATARS = [
  "/images/farmers/ramesh.png",
  "/images/farmers/mina.png",
  "/images/farmers/dilip.png",
];

const METHOD_LABELS: Record<string, Farmer["farmingType"]> = {
  organic: "Organic",
  natural: "Natural",
  conventional: "Conventional",
};

/**
 * A farm as the buyer-facing pages use it: the snake_case API payload
 * flattened into the fields the components already render, with media URLs
 * made absolute and sensible fallbacks for anything the farmer hasn't filled
 * in yet.
 */
export interface Farmer {
  id: number;
  name: string;
  farmName: string;
  location: string;
  image: string;
  farmImage: string;
  rating: number;
  orders: number;
  products: number;
  farmingType: "Organic" | "Natural" | "Conventional";
  farmingMethods: string[];
  story: string;
  joined: string;
  verified: boolean;
  categories: string[];
}

function mediaUrl(path: string | null, fallback: string) {
  if (!path) return fallback;

  // Django serves already-absolute URLs; anything else is a path that needs
  // the API origin prefixing.
  return path.startsWith("http") ? path : `${apiOrigin}${path}`;
}

function pickFallback(list: string[], seed: number) {
  return list[Math.abs(seed) % list.length] ?? list[0];
}

export function toFarmer(api: FarmerApi): Farmer {
  const [primaryMethod] = api.farming_methods;

  return {
    id: api.id,
    name: api.farmer_name,
    farmName: api.farm_name,
    location: api.location,
    image: mediaUrl(api.profile_picture, pickFallback(FALLBACK_AVATARS, api.id)),
    farmImage: mediaUrl(api.farm_image, pickFallback(FALLBACK_FARM_IMAGES, api.id)),
    rating: Math.round(api.avg_rating * 10) / 10,
    orders: api.orders_count,
    products: api.product_count,
    farmingType: (primaryMethod && METHOD_LABELS[primaryMethod]) || "Natural",
    farmingMethods: api.farming_methods,
    story:
      api.description?.trim() ||
      `${api.farm_name} grows fresh produce for families across ${api.province || "Nepal"}.`,
    joined: api.joined,
    verified: api.verified,
    categories: api.categories,
  };
}
