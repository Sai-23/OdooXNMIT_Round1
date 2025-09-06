"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import type { CartItem } from "@/types/cart"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItemProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const router = useRouter()

  const handleQuantityChange = async (newQuantity: number) => {
    await updateQuantity(item.productId, newQuantity)
  }

  const handleRemove = async () => {
    await removeItem(item.productId)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div
            className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => router.push(`/products/${item.productId}`)}
          >
            <img
              src={item.product.imageUrl || "/placeholder.svg"}
              alt={item.product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-1"
              onClick={() => router.push(`/products/${item.productId}`)}
            >
              {item.product.title}
            </h3>
            <p className="text-sm text-muted-foreground">Sold by {item.product.sellerName}</p>
            <p className="text-lg font-semibold text-primary">${item.product.price.toFixed(2)}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
