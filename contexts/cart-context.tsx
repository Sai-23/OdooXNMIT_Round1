"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { addToCart, removeFromCart, updateCartItemQuantity, getCartItems } from "@/lib/cart"
import type { CartItem } from "@/types/cart"
import type { Product } from "@/types/product"

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  loading: boolean
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const refreshCart = async () => {
    if (!user) {
      setCartItems([])
      return
    }

    setLoading(true)
    try {
      const items = await getCartItems(user.uid)
      setCartItems(items)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (product: Product) => {
    if (!user) return

    try {
      await addToCart(user.uid, product)
      await refreshCart()
    } catch (error) {
      console.error("Error adding item to cart:", error)
      throw error
    }
  }

  const removeItem = async (productId: string) => {
    if (!user) return

    try {
      await removeFromCart(user.uid, productId)
      await refreshCart()
    } catch (error) {
      console.error("Error removing item from cart:", error)
      throw error
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return

    try {
      await updateCartItemQuantity(user.uid, productId, quantity)
      await refreshCart()
    } catch (error) {
      console.error("Error updating cart item quantity:", error)
      throw error
    }
  }

  useEffect(() => {
    refreshCart()
  }, [user])

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
