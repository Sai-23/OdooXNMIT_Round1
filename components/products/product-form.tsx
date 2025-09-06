"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createProduct, updateProduct } from "@/lib/products"
import { PRODUCT_CATEGORIES, type CreateProductData, type Product } from "@/types/product"
import { useToast } from "@/hooks/use-toast"
import { Upload, Save, X } from "lucide-react"

interface ProductFormProps {
  product?: Product
  isEditing?: boolean
}

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<CreateProductData>({
    title: product?.title || "",
    description: product?.description || "",
    category: product?.category || "",
    price: product?.price || 0,
    imageUrl: product?.imageUrl || "",
    condition: product?.condition || "good",
    location: product?.location || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile) return

    // Validate that an image is uploaded
    if (!formData.imageUrl) {
      toast({
        title: "Image required",
        description: "Please upload an image for your product.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (isEditing && product) {
        await updateProduct(product.id, formData)
        toast({
          title: "Product updated",
          description: "Your product listing has been successfully updated.",
        })
      } else {
        await createProduct(formData, userProfile.uid, userProfile.username)
        toast({
          title: "Product listed",
          description: "Your product has been successfully listed for sale.",
        })
      }
      router.push("/my-listings")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (2MB limit for base64 to avoid Firestore limits)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        })
        return
      }

      setImageUploading(true)
      try {
        const base64String = await convertToBase64(file)
        setSelectedImage(file)
        setImagePreview(base64String)
        setFormData(prev => ({ ...prev, imageUrl: base64String }))
      } catch (error) {
        toast({
          title: "Error processing image",
          description: "Failed to process the selected image.",
          variant: "destructive",
        })
      } finally {
        setImageUploading(false)
      }
    }
  }

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    setFormData(prev => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleInputChange = (field: keyof CreateProductData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Product" : "List New Product"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update your product information" : "Create a new listing for your sustainable find"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div className="space-y-2">
            <Label>Product Image *</Label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted relative">
                {imagePreview || formData.imageUrl ? (
                  <>
                    <img
                      src={imagePreview || formData.imageUrl || "/placeholder.svg"}
                      alt="Product preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">No image</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleImageUploadClick}
                  disabled={imageUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imageUploading ? "Uploading..." : "Upload Image"}
                </Button>
                {selectedImage && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedImage.name}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a clear photo of your item. Required field. Max size: 2MB.
            </p>
          </div>

          {/* Product Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter a descriptive title for your item"
              required
            />
          </div>

          {/* Category and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange("condition", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your item's condition, features, and why it's special..."
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || imageUploading || !formData.imageUrl} 
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : imageUploading ? "Processing Image..." : isEditing ? "Update Product" : "List Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
