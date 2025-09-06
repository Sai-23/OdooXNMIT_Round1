"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PRODUCT_CATEGORIES } from "@/types/product"
import { X, Filter } from "lucide-react"

interface ProductFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onClearFilters: () => void
}

export function ProductFilters({ selectedCategory, onCategoryChange, onClearFilters }: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory && selectedCategory !== "all" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {selectedCategory}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onCategoryChange("all")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>

      {selectedCategory && selectedCategory !== "all" && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
