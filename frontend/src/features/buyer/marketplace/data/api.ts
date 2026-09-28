import apiClient from "../../../../api/apiClient";

export interface CategoryApi {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductApi {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_name: string;
  category_slug: string;
  farmer: number;
  farmer_name: string;
  farm_name: string;
  farmer_location: string;
  farmer_verified: boolean;
  price: string;
  bulk_price: string;
  bulk_minimum_quantity: number;
  rating: number;
  unit: string;
  stock: number;
  image: string | null;
  farming_method: "organic" | "natural" | "conventional";
  is_seasonal: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductQuery {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  farming_method?: ProductApi["farming_method"];
  farmer?: number;
  is_seasonal?: boolean;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  min_rating?: number;
  ordering?: string;
}

export async function getCategories() {
  const response = await apiClient.get<CategoryApi[]>("/products/categories/");
  return response.data;
}

export async function getProducts(params: ProductQuery) {
  const response = await apiClient.get<PaginatedResponse<ProductApi>>("/products/", {
    params,
  });
  return response.data;
}

export async function getProduct(slug: string) {
  const response = await apiClient.get<PaginatedResponse<ProductApi>>("/products/", {
    params: { search: slug },
  });
  return response.data.results.find((product) => product.slug === slug) ?? null;
}
