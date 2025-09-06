"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Heart, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface DashboardStatsProps {
  stats: {
    totalListings: number
    activeLisings?: number
    totalSales: number
    totalPurchases: number
    totalEarnings: number
    totalSpent?: number
  }
  isLoading?: boolean
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="animate-pulse h-4 bg-muted rounded w-20" />
              <div className="animate-pulse h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-muted rounded w-16 mb-1" />
              <div className="animate-pulse h-3 bg-muted rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeLisings ?? stats.totalListings}</div>
          <p className="text-xs text-muted-foreground">Items currently listed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSales}</div>
          <p className="text-xs text-muted-foreground">Successfully sold items</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Purchases</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          <p className="text-xs text-muted-foreground">Items you've bought</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
          <p className="text-xs text-muted-foreground">From your sales</p>
        </CardContent>
      </Card>
    </div>
  )
}
