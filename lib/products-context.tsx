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
  updateProduct: (id: number, updates: Partial<Product>) => void
  addProduct: (product: Product) => void
  deleteProduct: (id: number) => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("urban-hat-products")
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(defaultProducts)
      }
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("urban-hat-products", JSON.stringify(products))
    }
  }, [products, loaded])

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ProductsContext.Provider
      value={{ products, updateProduct, addProduct, deleteProduct }}
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
