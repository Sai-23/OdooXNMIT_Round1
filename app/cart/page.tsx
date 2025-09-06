"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { CartItemComponent } from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createPurchase } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"
import { ShoppingCart, CreditCard, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { user, loading } = useAuth()
  const { cartItems, cartTotal, cartCount, refreshCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return

    setCheckoutLoading(true)
    try {
      const purchaseId = await createPurchase(user.uid, cartItems)
      await refreshCart()

      toast({
        title: "Purchase successful!",
        description: "Your order has been placed successfully.",
      })

      router.push("/purchases")
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckoutLoading(false)
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? "s" : ""} in your cart` : "Your cart is empty"}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Discover sustainable finds from our community</p>
            <Button onClick={() => router.push("/products")}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>{cartCount} items in your cart</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="line-clamp-1">
                          {item.product.title} × {item.quantity}
                        </span>
                        <span>{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>

                  <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-full" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By proceeding, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
