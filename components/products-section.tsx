"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Eye, Search, ShoppingBag } from "lucide-react"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useProducts } from "@/lib/products-context"
import { ProductModal } from "@/components/product-modal"

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { products, isLoading } = useProducts()
  const canBuy = !user || user.role === "buyer"

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return ["Todas", ...unique]
  }, [products])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "Todas" || product.category === activeCategory

      const searchMatch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)

      return categoryMatch && searchMatch
    })
  }, [products, activeCategory, search])

  return (
    <section id="productos" className="bg-background px-4 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Nuestra colección
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Tienda de gorras
          </h2>
        </div>

        <div className="mb-6 flex items-center gap-2 border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Buscar por nombre, marca o descripción"
          />
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">Cargando productos...</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay productos para esta búsqueda. Intenta con otro término o categoría.
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden border border-border bg-card transition-all hover:border-foreground/20"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="flex h-12 w-12 items-center justify-center bg-foreground text-background transition-transform hover:scale-110"
                    aria-label={`Ver detalles de ${product.name}`}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {canBuy && (
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                      className="flex h-12 w-12 items-center justify-center bg-accent text-accent-foreground transition-transform hover:scale-110"
                      aria-label={`Agregar ${product.name} al carrito`}
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70">
                  <span className="bg-destructive px-4 py-2 text-xs font-bold uppercase tracking-widest text-destructive-foreground">
                    Agotado
                  </span>
                </div>
              )}

              <div className="space-y-2 p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {product.category}
                </p>
                <h3 className="font-display text-lg font-bold uppercase text-foreground">
                  {product.name}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                <p className="text-xs text-muted-foreground">Marca: {product.brand}</p>
                <p className="text-xs text-muted-foreground">Vendedor: {product.sellerName}</p>
                <p className="font-display text-xl font-bold text-foreground">
                  ${product.price} MXN
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && canBuy && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  )
}
