export interface Product {
  id: string
  title: string
  description: string
  category: string
  price: number
  imageUrl: string
  sellerId: string
  sellerName: string
  createdAt: Date
  updatedAt: Date
  status: "active" | "sold" | "inactive"
  condition: "excellent" | "good" | "fair" | "poor"
  location?: string
  // Fields added when product is sold
  soldAt?: Date
  buyerId?: string
}

export interface CreateProductData {
  title: string
  description: string
  category: string
  price: number
  imageUrl: string
  condition: "excellent" | "good" | "fair" | "poor"
  location?: string
}

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing & Fashion",
  "Home & Garden",
  "Books & Media",
  "Sports & Outdoors",
  "Toys & Games",
  "Furniture",
  "Art & Collectibles",
  "Automotive",
  "Other",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
