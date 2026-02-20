"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { defaultProducts, type Product } from "./products"

interface ProductsContextType {
  products: Product[]
  isLoading: boolean
  refreshProducts: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProducts = async () => {
    try {
      const response = await fetch("/api/v1/products")
      const payload = await response.json()

      if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
        setProducts([])
        return
      }

      const mapped: Product[] = payload.data.map((item: Record<string, unknown>) => ({
        id: String(item.id ?? ""),
        sellerId: String(item.sellerId ?? ""),
        sellerName: String(item.sellerName ?? "Vendedor"),
        name: String(item.name ?? ""),
        brand: String(item.brand ?? "Sin marca"),
        price: Number(item.price ?? 0),
        image: String(item.imageUrl ?? "/placeholder.svg"),
        images: Array.isArray(item.imageUrls)
          ? item.imageUrls.map((url) => String(url))
          : [String(item.imageUrl ?? "/placeholder.svg")],
        category: String(item.category ?? "General"),
        description: String(item.description ?? ""),
        stock: Number(item.stock ?? 0),
      }))

      setProducts(mapped)
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshProducts()
  }, [])

  return (
    <ProductsContext.Provider
      value={{ products, isLoading, refreshProducts }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
