import type { DeliveryZoneApi } from "./api";

/**
 * Matches a typed-in delivery address against the server's delivery zones.
 *
 * The result drives the *estimated* fee and minimum-order hint shown on the
 * checkout summary. It is deliberately only advisory: the server re-resolves
 * the zone at checkout and charges whatever it computes, so a mismatch here
 * must never change what the buyer is actually charged.
 */

export interface DeliveryEstimate {
  zone: DeliveryZoneApi;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDays: number;
  /** How much more the basket needs to reach the zone's minimum, 0 if met. */
  shortOfMinimum: number;
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findDeliveryZone(
  zones: DeliveryZoneApi[],
  location: {
    province: string;
    district: string;
    municipality: string;
  },
  subtotal: number,
): DeliveryEstimate | null {
  const province = norm(location.province);
  const district = norm(location.district);
  const municipality = norm(location.municipality);

  if (!province || !district || !municipality) return null;

  const zone = zones.find(
    (candidate) =>
      norm(candidate.province) === province &&
      norm(candidate.district) === district &&
      norm(candidate.municipality) === municipality &&
      candidate.is_active,
  );

  if (!zone) return null;

  return {
    zone,
    deliveryFee: Number(zone.delivery_fee),
    minimumOrder: Number(zone.minimum_order_amount),
    estimatedDays: zone.estimated_delivery_days,
    shortOfMinimum: Math.max(Number(zone.minimum_order_amount) - subtotal, 0),
  };
}
