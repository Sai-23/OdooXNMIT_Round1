"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, TrendingUp, Search } from "lucide-react"

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalListings: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalEarnings: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Mock stats for now - will be replaced with real data
  useEffect(() => {
    setStats({
      totalListings: 12,
      totalSales: 8,
      totalPurchases: 15,
      totalEarnings: 245.5,
    })
  }, [])

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {userProfile?.username || "User"}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your sustainable marketplace activity</p>
        </div>

        <DashboardStats stats={stats} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => router.push("/products/new")}>
                List New Item
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/products")}>
                <Search className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/profile")}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest marketplace interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Vintage Camera listed</span>
                  <span className="text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Book collection sold</span>
                  <span className="text-muted-foreground">1 day ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Bicycle purchased</span>
                  <span className="text-muted-foreground">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Impact Summary
              </CardTitle>
              <CardDescription>Your contribution to sustainability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Items given new life</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">CO2 saved (estimated)</span>
                  <span className="font-semibold">45 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Community rating</span>
                  <span className="font-semibold">4.8/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
