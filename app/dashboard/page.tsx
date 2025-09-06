"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, TrendingUp, Search } from "lucide-react"
import { getDashboardStats, getRecentActivity, getImpactSummary, formatTimeAgo, type DashboardStats as DashboardStatsType, type RecentActivity, type ImpactSummary } from "@/lib/dashboard"
import { formatCurrency } from "@/lib/currency"

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStatsType>({
    totalListings: 0,
    activeLisings: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalEarnings: 0,
    totalSpent: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [impactSummary, setImpactSummary] = useState<ImpactSummary>({
    itemsGivenNewLife: 0,
    co2Saved: 0,
    communityRating: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Load all dashboard data
        const [dashboardStats, activity, impact] = await Promise.all([
          getDashboardStats(user.uid),
          getRecentActivity(user.uid),
          getImpactSummary(user.uid)
        ])

        setStats(dashboardStats)
        setRecentActivity(activity)
        setImpactSummary(impact)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user, loading, router])

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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userProfile?.username || user?.email || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your sustainable marketplace activity
          </p>
        </div>

        <DashboardStats 
          stats={stats}
          isLoading={isLoading}
        />

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
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start listing or purchasing items to see activity here.</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{activity.title}</span>
                      <span className="text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Items given new life</span>
                    <span className="font-semibold">{impactSummary.itemsGivenNewLife}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CO₂ saved (estimated)</span>
                    <span className="font-semibold">{impactSummary.co2Saved.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Community rating</span>
                    <span className="font-semibold">{impactSummary.communityRating.toFixed(1)}/5</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
