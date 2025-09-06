import { collection, addDoc, deleteDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
import { getProduct } from "./products"
import type { Product } from "@/types/product"

const FAVORITES_COLLECTION = "favorites"

export async function addToFavorites(userId: string, productId: string): Promise<void> {
  // Check if item already exists in favorites
  const q = query(
    collection(db, FAVORITES_COLLECTION), 
    where("userId", "==", userId), 
    where("productId", "==", productId)
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    // Add new item to favorites
    const favoriteItem = {
      userId,
      productId,
      addedAt: new Date(),
    }

    await addDoc(collection(db, FAVORITES_COLLECTION), favoriteItem)
  }
}

export async function removeFromFavorites(userId: string, productId: string): Promise<void> {
  const q = query(
    collection(db, FAVORITES_COLLECTION), 
    where("userId", "==", userId), 
    where("productId", "==", productId)
  )

  const querySnapshot = await getDocs(q)
  
  // Remove all matching documents (should be just one, but just in case)
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}

export async function getFavoriteProducts(userId: string): Promise<Product[]> {
  const q = query(
    collection(db, FAVORITES_COLLECTION), 
    where("userId", "==", userId)
  )

  const querySnapshot = await getDocs(q)
  
  // Get all product IDs from favorites
  const productIds = querySnapshot.docs.map(doc => doc.data().productId)
  
  // Fetch product details for each favorite
  const productPromises = productIds.map(async (productId) => {
    try {
      const product = await getProduct(productId)
      return product
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error)
      return null
    }
  })

  const products = await Promise.all(productPromises)
  
  // Filter out null products (products that couldn't be fetched or don't exist)
  return products.filter((product): product is Product => product !== null)
}

export async function isProductInFavorites(userId: string, productId: string): Promise<boolean> {
  const q = query(
    collection(db, FAVORITES_COLLECTION), 
    where("userId", "==", userId), 
    where("productId", "==", productId)
  )

  const querySnapshot = await getDocs(q)
  return !querySnapshot.empty
}
