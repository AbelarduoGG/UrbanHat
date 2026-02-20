/**
 * Tipos compartidos entre frontend y backend.
 * Estas interfaces NO dependen de Mongoose — son para uso en API y componentes.
 */

// --- Usuarios ---
export interface UserPublic {
  id: string
  name: string
  email: string
  role: "superadmin" | "seller" | "buyer"
  shopName?: string
  isActive: boolean
  createdAt: string
}

// --- Productos ---
export interface ProductPublic {
  id: string
  sellerId: string
  sellerName: string
  name: string
  brand: string
  description: string
  price: number
  stock: number
  imageUrl: string
  imageUrls: string[]
  category: string
  isActive: boolean
}

// --- Órdenes ---
export interface OrderItemPublic {
  productId: string
  sellerId: string
  name: string
  quantity: number
  priceAtPurchase: number
}

export interface OrderPublic {
  id: string
  buyerId: string
  items: OrderItemPublic[]
  totalAmount: number
  status: "pending" | "paid" | "shipped" | "cancelled"
  createdAt: string
}

// --- Respuestas API ---
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
