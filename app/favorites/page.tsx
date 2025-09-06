"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { getFavoriteProducts, removeFromFavorites } from "@/lib/favorites"
import type { Product } from "@/types/product"
import { useToast } from "@/hooks/use-toast"
import { Heart, Package } from "lucide-react"

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      try {
        const favoriteProducts = await getFavoriteProducts(user.uid)
        setFavorites(favoriteProducts)
      } catch (error) {
        console.error("Error fetching favorites:", error)
        toast({
          title: "Error",
          description: "Failed to load your favorites. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFavoritesLoading(false)
      }
    }

    if (user) {
      fetchFavorites()
    }
  }, [user, toast])

  const handleRemoveFromFavorites = async (productId: string) => {
    if (!user) return

    try {
      await removeFromFavorites(user.uid, productId)
      setFavorites(prev => prev.filter(product => product.id !== productId))
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites.",
      })
    } catch (error) {
      console.error("Error removing from favorites:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from favorites.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Heart className="h-8 w-8 mr-3 text-primary" />
            My Favorites
          </h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        {favoritesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring products and save the ones you like!
            </p>
            <Button onClick={() => router.push("/products")}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                  onClick={() => handleRemoveFromFavorites(product.id)}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
