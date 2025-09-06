"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { getUserProducts, deleteProduct } from "@/lib/products"
import type { Product } from "@/types/product"
import { useToast } from "@/hooks/use-toast"
import { Plus, Package } from "lucide-react"

export default function MyListingsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!userProfile) return

      try {
        const userProducts = await getUserProducts(userProfile.uid)
        setProducts(userProducts)
      } catch (error) {
        console.error("Error fetching user products:", error)
        toast({
          title: "Error",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setProductsLoading(false)
      }
    }

    if (userProfile) {
      fetchUserProducts()
    }
  }, [userProfile, toast])

  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    try {
      await deleteProduct(productId)
      setProducts(products.filter((p) => p.id !== productId))
      toast({
        title: "Product deleted",
        description: "Your listing has been successfully removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading || productsLoading) {
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Listings</h1>
            <p className="text-muted-foreground">Manage your product listings</p>
          </div>
          <Button onClick={() => router.push("/products/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">Start selling your sustainable finds to the community</p>
            <Button onClick={() => router.push("/products/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
