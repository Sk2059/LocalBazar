const apiOrigin = new URL(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
).origin;

/**
 * Resolves an order item's stored image path to an absolute URL. Product
 * images are stored relative to the API origin, and `null` (never stored)
 * falls back to the marketplace placeholder.
 */
export function orderItemImage(path: string | null): string {
  if (!path) return "/images/products/placeholder.jpg";
  return path.startsWith("http") ? path : `${apiOrigin}${path}`;
}
