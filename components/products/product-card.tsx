"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Edit, Trash2 } from "lucide-react"
import type { Product } from "@/types/product"
import { useRouter } from "next/navigation"
import { useFavorites } from "@/contexts/favorites-context"
import { formatCurrencyCompact } from "@/lib/currency"

interface ProductCardProps {
  product: Product
  showActions?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
}

export function ProductCard({ product, showActions = false, onEdit, onDelete }: ProductCardProps) {
  const router = useRouter()
  const { favoriteIds, addToFavorites, removeFromFavorites, isInFavorites, loading } = useFavorites()

  const isFavorite = isInFavorites(product.id)

  const handleCardClick = () => {
    if (!showActions) {
      router.push(`/products/${product.id}`)
    }
  }

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    
    if (isFavorite) {
      await removeFromFavorites(product.id)
    } else {
      await addToFavorites(product.id)
    }
  }

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

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 ${!showActions ? "hover:shadow-lg cursor-pointer" : ""}`}
    >
      <div onClick={handleCardClick}>
        <div className="aspect-square relative overflow-hidden">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
          {!showActions && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 ${isFavorite ? 'bg-red-50 hover:bg-red-100' : 'bg-white/80 hover:bg-white'}`}
              onClick={handleFavoriteToggle}
              disabled={loading}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </Button>
          )}
          <Badge className={`absolute top-2 left-2 ${getConditionColor(product.condition)}`}>{product.condition}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
          <p className="text-2xl font-bold text-primary">{formatCurrencyCompact(product.price)}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{product.category}</span>
            {product.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{product.location}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">Listed by {product.sellerName}</div>

          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(product)} className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(product.id)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
