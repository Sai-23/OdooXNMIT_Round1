"use client"

import { useEffect, useState, use } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProduct } from "@/lib/products"
import type { Product } from "@/types/product"
import { useToast } from "@/hooks/use-toast"
import { formatCurrencyCompact } from "@/lib/currency"
import { ArrowLeft, Heart, MessageCircle, MapPin, Calendar, ShoppingCart } from "lucide-react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading } = useAuth()
  const { addItem } = useCart()
  const { addToFavorites, removeFromFavorites, isInFavorites, loading: favoritesLoading } = useFavorites()
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToFavorites, setAddingToFavorites] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(resolvedParams.id)
        if (productData) {
          setProduct(productData)
        } else {
          toast({
            title: "Product not found",
            description: "The product you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          })
          router.push("/products")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        })
        router.push("/products")
      } finally {
        setProductLoading(false)
      }
    }

    if (resolvedParams.id) {
      fetchProduct()
    }
  }, [resolvedParams.id, router, toast])

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    try {
      await addItem(product)
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

    const handleContactSeller = () => {
    toast({
      title: "Contact seller",
      description: "This feature will be available soon. You can find seller contact information in their profile.",
    })
  }

  const handleFavoriteToggle = async () => {
    if (!product) return

    setAddingToFavorites(true)
    try {
      const isFavorite = isInFavorites(product.id)
      if (isFavorite) {
        await removeFromFavorites(product.id)
        toast({
          title: "Removed from favorites",
          description: "Product has been removed from your favorites.",
        })
      } else {
        await addToFavorites(product.id)
        toast({
          title: "Added to favorites",
          description: "Product has been added to your favorites.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToFavorites(false)
    }
  }

  if (loading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !product) return null

  const isOwnProduct = user && product && product.sellerId === user.uid

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg border">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-4 left-4 ${getConditionColor(product.condition)}`}>
                {product.condition}
              </Badge>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <p className="text-4xl font-bold text-primary mb-4">{formatCurrencyCompact(product.price)}</p>
              <Badge variant="outline" className="mb-4">
                {product.category}
              </Badge>
            </div>

            {/* Product Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Condition:</span>
                    <p className="text-muted-foreground capitalize">{product.condition}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-muted-foreground">{product.category}</p>
                  </div>
                  {product.location && (
                    <div className="col-span-2">
                      <span className="font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location:
                      </span>
                      <p className="text-muted-foreground">{product.location}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Listed:
                    </span>
                    <p className="text-muted-foreground">{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Seller Information</h3>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt={product.sellerName} />
                    <AvatarFallback>{product.sellerName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{product.sellerName}</p>
                    <p className="text-sm text-muted-foreground">Community member</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isOwnProduct ? (
                <>
                  <Button onClick={handleAddToCart} disabled={addingToCart} className="w-full" size="lg">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handleContactSeller}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Seller
                    </Button>
                    <Button variant="outline" onClick={handleFavoriteToggle} disabled={addingToFavorites}>
                      <Heart className={`h-4 w-4 mr-2 ${isInFavorites(product.id) ? 'text-red-500 fill-red-500' : ''}`} />
                      {addingToFavorites ? 'Updating...' : (isInFavorites(product.id) ? 'Remove from Favorites' : 'Add to Favorites')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => router.push(`/products/${product.id}/edit`)}>Edit Listing</Button>
                  <Button variant="outline" onClick={() => router.push("/my-listings")}>
                    View My Listings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
