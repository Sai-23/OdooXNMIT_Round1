"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { SearchBar } from "@/components/products/search-bar"
import { Button } from "@/components/ui/button"
import { getAllProducts, getProductsByCategory, searchProducts, createTestProducts } from "@/lib/products"
import { testFirebaseConnection, testCreateProduct } from "@/lib/firebase-test"
import type { Product } from "@/types/product"
import { useToast } from "@/hooks/use-toast"
import { Package } from "lucide-react"

export default function ProductsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Get initial search query from URL params
  useEffect(() => {
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    if (search) {
      setSearchQuery(search)
    }
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true)
      try {
        let fetchedProducts: Product[] = []

        console.log("Fetching products with:", { searchQuery, selectedCategory })

        if (searchQuery.trim()) {
          console.log("Searching products...")
          fetchedProducts = await searchProducts(searchQuery)
        } else if (selectedCategory && selectedCategory !== "all") {
          console.log("Fetching by category:", selectedCategory)
          fetchedProducts = await getProductsByCategory(selectedCategory)
        } else {
          console.log("Fetching all products...")
          fetchedProducts = await getAllProducts()
        }

        console.log("Fetched products:", fetchedProducts)
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setProductsLoading(false)
      }
    }

    if (user) {
      fetchProducts()
    }
  }, [selectedCategory, searchQuery, toast, user])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSearchQuery("") // Clear search when changing category
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedCategory("all") // Clear category when searching
  }

  const handleClearFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
  }

  const handleCreateTestProducts = async () => {
    try {
      if (!userProfile) {
        toast({
          title: "Error",
          description: "User profile not found",
          variant: "destructive",
        })
        return
      }
      
      // First test the connection
      const connectionTest = await testFirebaseConnection()
      console.log("Connection test result:", connectionTest)
      
      if (!connectionTest.success) {
        toast({
          title: "Firebase Connection Error",
          description: connectionTest.message,
          variant: "destructive",
        })
        return
      }
      
      // If connection is good but no products, create test products
      if (connectionTest.documentsFound === 0) {
        await createTestProducts()
        toast({
          title: "Test products created",
          description: "Sample products have been added to the database.",
        })
      } else {
        toast({
          title: "Database Status",
          description: `Found ${connectionTest.documentsFound} existing products in database. Refreshing view...`,
        })
      }
      
      // Refresh products
      const products = await getAllProducts()
      setProducts(products)
      
    } catch (error) {
      console.error("Error creating test products:", error)
      toast({
        title: "Error",
        description: "Failed to create test products.",
        variant: "destructive",
      })
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Sustainable Finds</h1>
          <p className="text-muted-foreground">Browse unique second-hand items from our eco-conscious community</p>
        </div>

        {/* Mobile Search Bar */}
        <div className="mb-6 md:hidden">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {productsLoading ? (
                "Loading products..."
              ) : (
                <>
                  Showing {products.length} product{products.length !== 1 ? "s" : ""}
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory && selectedCategory !== "all" && ` in ${selectedCategory}`}
                </>
              )}
            </p>
            <div className="flex gap-2">
              {!productsLoading && products.length === 0 && (
                <Button variant="secondary" size="sm" onClick={handleCreateTestProducts}>
                  Debug Database
                </Button>
              )}
              {!productsLoading && products.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => router.push("/products/new")}>
                  List Your Item
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || selectedCategory !== "all" ? "No products found" : "No products available"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters to find what you're looking for"
                : "Be the first to list a sustainable find for the community"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(searchQuery || selectedCategory !== "all") && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => router.push("/products/new")}>List Your First Item</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
