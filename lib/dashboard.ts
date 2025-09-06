import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"
import { getUserProducts } from "./products"
import { getUserPurchases } from "./cart"
import type { Product } from "@/types/product"
import type { Purchase } from "@/types/cart"

export interface DashboardStats {
  totalListings: number
  activeLisings: number
  totalSales: number
  totalPurchases: number
  totalEarnings: number
  totalSpent: number
}

export interface RecentActivity {
  id: string
  type: 'listing' | 'sale' | 'purchase'
  title: string
  amount?: number
  timestamp: Date
}

export interface ImpactSummary {
  itemsGivenNewLife: number
  co2Saved: number
  communityRating: number
}

/**
 * Get comprehensive dashboard statistics for a user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Get user's products (listings)
    const userProducts = await getUserProducts(userId)
    const activeListings = userProducts.filter(product => product.status === 'active')
    const soldProducts = userProducts.filter(product => product.status === 'sold')

    // Get user's purchases
    const userPurchases = await getUserPurchases(userId)

    // Calculate total earnings from sales
    const totalEarnings = soldProducts.reduce((sum, product) => sum + product.price, 0)

    // Calculate total spent on purchases
    const totalSpent = userPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)

    return {
      totalListings: userProducts.length,
      activeLisings: activeListings.length,
      totalSales: soldProducts.length,
      totalPurchases: userPurchases.length,
      totalEarnings,
      totalSpent
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default stats on error
    return {
      totalListings: 0,
      activeLisings: 0,
      totalSales: 0,
      totalPurchases: 0,
      totalEarnings: 0,
      totalSpent: 0
    }
  }
}

/**
 * Get recent activity for a user (listings, sales, purchases)
 */
export async function getRecentActivity(userId: string, limitCount: number = 5): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = []

    // Get recent listings
    const userProducts = await getUserProducts(userId)
    const recentListings = userProducts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(product => ({
        id: `listing-${product.id}`,
        type: 'listing' as const,
        title: `${product.title} ${product.status === 'sold' ? 'sold' : 'listed'}`,
        amount: product.status === 'sold' ? product.price : undefined,
        timestamp: new Date(product.createdAt)
      }))

    activities.push(...recentListings)

    // Get recent purchases
    const userPurchases = await getUserPurchases(userId)
    const recentPurchases = userPurchases
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(purchase => ({
        id: `purchase-${purchase.id}`,
        type: 'purchase' as const,
        title: `${purchase.items.length} item${purchase.items.length > 1 ? 's' : ''} purchased`,
        amount: purchase.totalAmount,
        timestamp: new Date(purchase.createdAt)
      }))

    activities.push(...recentPurchases)

    // Sort all activities by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limitCount)

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

/**
 * Calculate impact summary based on user's marketplace activity
 */
export async function getImpactSummary(userId: string): Promise<ImpactSummary> {
  try {
    const userProducts = await getUserProducts(userId)
    const userPurchases = await getUserPurchases(userId)

    // Calculate items given new life (sold items + purchased items)
    const soldItems = userProducts.filter(product => product.status === 'sold').length
    const purchasedItems = userPurchases.reduce((sum, purchase) => sum + purchase.items.length, 0)
    const itemsGivenNewLife = soldItems + purchasedItems

    // Estimate CO2 saved (rough calculation: 2kg CO2 per item reused)
    const co2Saved = itemsGivenNewLife * 2

    // Mock community rating for now (can be enhanced with actual reviews)
    const communityRating = 4.8

    return {
      itemsGivenNewLife,
      co2Saved,
      communityRating
    }
  } catch (error) {
    console.error('Error calculating impact summary:', error)
    return {
      itemsGivenNewLife: 0,
      co2Saved: 0,
      communityRating: 0
    }
  }
}

/**
 * Format time ago string for recent activity
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  return date.toLocaleDateString()
}
