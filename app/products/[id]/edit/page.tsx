"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { ProductForm } from "@/components/products/product-form"
import { getProduct } from "@/lib/products"
import type { Product } from "@/types/product"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(params.id)
        if (productData) {
          setProduct(productData)
        } else {
          router.push("/my-listings")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        router.push("/my-listings")
      } finally {
        setProductLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  if (loading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !product) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Product</h1>
          <p className="text-muted-foreground">Update your product listing information</p>
        </div>
        <ProductForm product={product} isEditing={true} />
      </div>
    </div>
  )
}
