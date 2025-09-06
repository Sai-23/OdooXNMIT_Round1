import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Product, CreateProductData } from "@/types/product"

const PRODUCTS_COLLECTION = "products"

export async function createProduct(
  productData: CreateProductData,
  sellerId: string,
  sellerName: string,
): Promise<string> {
  const product = {
    ...productData,
    sellerId,
    sellerName,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active" as const,
  }

  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product)
  console.log("Product created successfully:", docRef.id)
  return docRef.id
}

export async function updateProduct(productId: string, updates: Partial<CreateProductData>): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId)
  await updateDoc(productRef, {
    ...updates,
    updatedAt: new Date(),
  })
}

export async function deleteProduct(productId: string): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId)
  await deleteDoc(productRef)
}

export async function getProduct(productId: string): Promise<Product | null> {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId)
  const productSnap = await getDoc(productRef)

  if (productSnap.exists()) {
    return {
      id: productSnap.id,
      ...productSnap.data(),
    } as Product
  }

  return null
}

export async function getUserProducts(userId: string): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS_COLLECTION), where("sellerId", "==", userId), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function getAllProducts(limitCount = 20): Promise<Product[]> {
  try {
    // First try without status filter to see if products exist
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    const querySnapshot = await getDocs(q)
    const allProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]

    // Filter for active products in memory instead of Firestore query
    // This avoids potential indexing issues
    return allProducts.filter(product => !product.status || product.status === "active")

  } catch (error) {
    console.error("Error in getAllProducts:", error)
    
    // Fallback: try without any filters
    try {
      const simpleQuery = query(collection(db, PRODUCTS_COLLECTION), limit(limitCount))
      const fallbackSnapshot = await getDocs(simpleQuery)
      return fallbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError)
      return []
    }
  }
}

export async function getProductsByCategory(category: string, limitCount = 20): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("category", "==", category),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}

export async function searchProducts(searchTerm: string, limitCount = 20): Promise<Product[]> {
  // Note: This is a basic search. For production, consider using Algolia or similar
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  const querySnapshot = await getDocs(q)
  const allProducts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]

  // Filter by search term in title or description
  return allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )
}

// Debug function to create test products
export async function createTestProducts(): Promise<void> {
  const testProducts = [
    {
      title: "Vintage Leather Jacket",
      description: "A beautiful vintage leather jacket in great condition. Perfect for sustainable fashion lovers.",
      category: "Clothing",
      price: 85,
      imageUrl: "/placeholder.jpg",
      condition: "good" as const,
      location: "New York, NY",
    },
    {
      title: "Wooden Coffee Table",
      description: "Handcrafted wooden coffee table. Solid wood construction with minor wear from use.",
      category: "Furniture",
      price: 120,
      imageUrl: "/placeholder.jpg",
      condition: "fair" as const,
      location: "Los Angeles, CA",
    },
    {
      title: "Vintage Books Collection",
      description: "Collection of classic literature books from the 1970s. Great for book lovers!",
      category: "Books & Media",
      price: 45,
      imageUrl: "/placeholder.jpg",
      condition: "good" as const,
      location: "Chicago, IL",
    },
  ]

  for (const product of testProducts) {
    await createProduct(product, "test-user", "Test User")
  }

  console.log("Test products created!")
}
