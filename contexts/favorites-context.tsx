"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { addToFavorites, removeFromFavorites, getFavoriteProducts, isProductInFavorites } from "@/lib/favorites"
import type { Product } from "@/types/product"

interface FavoritesContextType {
  favorites: Product[]
  favoriteIds: Set<string>
  loading: boolean
  addToFavorites: (productId: string) => Promise<void>
  removeFromFavorites: (productId: string) => Promise<void>
  isInFavorites: (productId: string) => boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([])
      setFavoriteIds(new Set())
      return
    }

    setLoading(true)
    try {
      const favoriteProducts = await getFavoriteProducts(user.uid)
      setFavorites(favoriteProducts)
      setFavoriteIds(new Set(favoriteProducts.map(p => p.id)))
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToFavoritesHandler = async (productId: string) => {
    if (!user) return

    try {
      await addToFavorites(user.uid, productId)
      await refreshFavorites()
    } catch (error) {
      console.error("Error adding to favorites:", error)
      throw error
    }
  }

  const removeFromFavoritesHandler = async (productId: string) => {
    if (!user) return

    try {
      await removeFromFavorites(user.uid, productId)
      await refreshFavorites()
    } catch (error) {
      console.error("Error removing from favorites:", error)
      throw error
    }
  }

  const isInFavorites = (productId: string) => {
    return favoriteIds.has(productId)
  }

  // Load favorites when user changes
  useEffect(() => {
    if (user) {
      refreshFavorites()
    } else {
      setFavorites([])
      setFavoriteIds(new Set())
    }
  }, [user])

  const value: FavoritesContextType = {
    favorites,
    favoriteIds,
    loading,
    addToFavorites: addToFavoritesHandler,
    removeFromFavorites: removeFromFavoritesHandler,
    isInFavorites,
    refreshFavorites,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
