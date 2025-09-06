"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUserPurchases } from "@/lib/cart"
import type { Purchase } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { Package, Calendar, DollarSign, ArrowRight } from "lucide-react"

export default function PurchasesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchasesLoading, setPurchasesLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return

      try {
        const userPurchases = await getUserPurchases(user.uid)
        setPurchases(userPurchases)
      } catch (error) {
        console.error("Error fetching purchases:", error)
        toast({
          title: "Error",
          description: "Failed to load purchase history. Please try again.",
          variant: "destructive",
        })
      } finally {
        setPurchasesLoading(false)
      }
    }

    if (user) {
      fetchPurchases()
    }
  }, [user, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || purchasesLoading) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Purchase History</h1>
          <p className="text-muted-foreground">View all your previous purchases and orders</p>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping for sustainable finds</p>
            <Button onClick={() => router.push("/products")}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{purchase.id.slice(-8).toUpperCase()}
                        <Badge className={getStatusColor(purchase.status)}>{purchase.status}</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />${purchase.totalAmount.toFixed(2)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchase.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/products/${item.productId}`)}
                        >
                          <img
                            src={item.product.imageUrl || "/placeholder.svg"}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-1"
                            onClick={() => router.push(`/products/${item.productId}`)}
                          >
                            {item.product.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">Sold by {item.product.sellerName}</p>
                          <p className="text-sm">
                            Quantity: {item.quantity} × ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
