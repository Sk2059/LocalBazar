export interface ProductFarmer {
  id: number;
  name: string;
  farmName: string;
  location: string;
  verified: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  categorySlug?: string;
  pricePerKg: number;
  bulkPrice: number;
  bulkMinimumQuantity: number;
  unit: string;
  stock: number;
  rating: number;
  reviewCount: number;
  farmer: ProductFarmer;
  image: string;
  farmingMethod: "Organic" | "Natural" | "Conventional";
  isSeasonal: boolean;
  isFeatured: boolean;
}

/**
 * A product only qualifies for bulk pricing when the farmer actually set a
 * discounted bulk price. The `bulk_price` column defaults to 0 on the server,
 * so products created without bulk pricing must always fall back to the
 * regular price everywhere they are priced.
 */
export function hasBulkDiscount(product: Product): boolean {
  return product.bulkPrice > 0 && product.bulkPrice < product.pricePerKg;
}

export function getProductUnitPrice(product: Product, quantity = 1) {
  return hasBulkDiscount(product) &&
    quantity >= product.bulkMinimumQuantity
    ? product.bulkPrice
    : product.pricePerKg;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    slug: "fresh-tomatoes",
    category: "Vegetables",
    pricePerKg: 95,
    bulkPrice: 85,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 42,
    rating: 4.9,
    reviewCount: 28,
    farmer: {
      id: 1,
      name: "Ramesh Kumar",
      farmName: "Hari Organic Farm",
      location: "Biratnagar, Morang",
      verified: true,
    },
    image: "/images/products/tomatoes.jpeg",
    farmingMethod: "Organic",
    isSeasonal: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Fresh Cauliflower",
    slug: "fresh-cauliflower",
    category: "Vegetables",
    pricePerKg: 80,
    bulkPrice: 72,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 28,
    rating: 4.8,
    reviewCount: 21,
    farmer: {
      id: 2,
      name: "Mina Rai",
      farmName: "Koshi Green Farm",
      location: "Itahari, Sunsari",
      verified: true,
    },
    image: "/images/products/cauliflower.png",
    farmingMethod: "Natural",
    isSeasonal: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Local Mangoes",
    slug: "local-mangoes",
    category: "Fruits",
    pricePerKg: 180,
    bulkPrice: 162,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 35,
    rating: 4.9,
    reviewCount: 35,
    farmer: {
      id: 3,
      name: "Dilip Chaudhary",
      farmName: "Green Valley Farm",
      location: "Birat Chowk, Morang",
      verified: true,
    },
    image: "/images/products/mangoes.png",
    farmingMethod: "Natural",
    isSeasonal: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Fresh Potatoes",
    slug: "fresh-potatoes",
    category: "Vegetables",
    pricePerKg: 70,
    bulkPrice: 63,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 65,
    rating: 4.7,
    reviewCount: 19,
    farmer: {
      id: 1,
      name: "Ramesh Kumar",
      farmName: "Hari Organic Farm",
      location: "Biratnagar, Morang",
      verified: true,
    },
    image: "/images/products/potatoes.png",
    farmingMethod: "Organic",
    isSeasonal: false,
    isFeatured: false,
  },
  {
    id: 5,
    name: "Fresh Spinach",
    slug: "fresh-spinach",
    category: "Leafy Greens",
    pricePerKg: 60,
    bulkPrice: 54,
    bulkMinimumQuantity: 10,
    unit: "bundle",
    stock: 31,
    rating: 4.8,
    reviewCount: 16,
    farmer: {
      id: 2,
      name: "Mina Rai",
      farmName: "Koshi Green Farm",
      location: "Itahari, Sunsari",
      verified: true,
    },
    image: "/images/products/leafy.png",
    farmingMethod: "Natural",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 6,
    name: "Sweet Corn",
    slug: "sweet-corn",
    category: "Seasonal",
    pricePerKg: 120,
    bulkPrice: 108,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 24,
    rating: 4.9,
    reviewCount: 23,
    farmer: {
      id: 3,
      name: "Dilip Chaudhary",
      farmName: "Green Valley Farm",
      location: "Birat Chowk, Morang",
      verified: true,
    },
    image: "/images/products/corn.jpg",
    farmingMethod: "Natural",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 7,
    name: "Fresh Cucumbers",
    slug: "fresh-cucumbers",
    category: "Vegetables",
    pricePerKg: 75,
    bulkPrice: 68,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 38,
    rating: 4.7,
    reviewCount: 14,
    farmer: {
      id: 1,
      name: "Ramesh Kumar",
      farmName: "Hari Organic Farm",
      location: "Biratnagar, Morang",
      verified: true,
    },
    image: "/images/products/cucumbers.jpg",
    farmingMethod: "Organic",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 8,
    name: "Local Green Beans",
    slug: "local-green-beans",
    category: "Vegetables",
    pricePerKg: 110,
    bulkPrice: 99,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 19,
    rating: 4.8,
    reviewCount: 18,
    farmer: {
      id: 2,
      name: "Mina Rai",
      farmName: "Koshi Green Farm",
      location: "Itahari, Sunsari",
      verified: true,
    },
    image: "/images/products/beans.jpg",
    farmingMethod: "Natural",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 9,
    name: "Fresh Green Peas",
    slug: "fresh-green-peas",
    category: "Vegetables",
    pricePerKg: 140,
    bulkPrice: 126,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 17,
    rating: 4.8,
    reviewCount: 12,
    farmer: {
      id: 3,
      name: "Dilip Chaudhary",
      farmName: "Green Valley Farm",
      location: "Birat Chowk, Morang",
      verified: true,
    },
    image: "/images/products/peas.jpg",
    farmingMethod: "Organic",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 10,
    name: "Local Papaya",
    slug: "local-papaya",
    category: "Fruits",
    pricePerKg: 100,
    bulkPrice: 90,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 26,
    rating: 4.6,
    reviewCount: 11,
    farmer: {
      id: 1,
      name: "Ramesh Kumar",
      farmName: "Hari Organic Farm",
      location: "Biratnagar, Morang",
      verified: true,
    },
    image: "/images/products/papaya.jpg",
    farmingMethod: "Natural",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 11,
    name: "Fresh Coriander",
    slug: "fresh-coriander",
    category: "Leafy Greens",
    pricePerKg: 40,
    bulkPrice: 36,
    bulkMinimumQuantity: 10,
    unit: "bundle",
    stock: 44,
    rating: 4.9,
    reviewCount: 25,
    farmer: {
      id: 2,
      name: "Mina Rai",
      farmName: "Koshi Green Farm",
      location: "Itahari, Sunsari",
      verified: true,
    },
    image: "/images/products/coriander.jpg",
    farmingMethod: "Organic",
    isSeasonal: true,
    isFeatured: false,
  },
  {
    id: 12,
    name: "Local Red Lentils",
    slug: "local-red-lentils",
    category: "Grains & Pulses",
    pricePerKg: 190,
    bulkPrice: 171,
    bulkMinimumQuantity: 10,
    unit: "kg",
    stock: 52,
    rating: 4.8,
    reviewCount: 20,
    farmer: {
      id: 3,
      name: "Dilip Chaudhary",
      farmName: "Green Valley Farm",
      location: "Birat Chowk, Morang",
      verified: true,
    },
    image: "/images/products/lentils.jpg",
    farmingMethod: "Conventional",
    isSeasonal: false,
    isFeatured: false,
  },
];