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
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
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
