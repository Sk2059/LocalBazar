import type { CurrentUserApi } from "./data/api";

/**
 * The page a given role lands on. Kept out of the component modules so React
 * Refresh stays happy (a file exporting a helper alongside components breaks
 * fast refresh) — the guard and the header menu both import it from here.
 */
export type UserRole = CurrentUserApi["role"];

export function dashboardPath(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "farmer") return "/farmer/dashboard";
  return "/buyer/dashboard";
}
