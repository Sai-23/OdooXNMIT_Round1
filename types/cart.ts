export interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    title: string
    price: number
    imageUrl: string
    sellerId: string
    sellerName: string
  }
  quantity: number
  addedAt: Date
}

export interface Purchase {
  id: string
  buyerId: string
  items: CartItem[]
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  completedAt?: Date
}
