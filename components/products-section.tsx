"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag, Eye } from "lucide-react"
import { categories } from "@/lib/products"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/lib/products-context"
import { ProductModal } from "@/components/product-modal"

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const { products } = useProducts()

  const filtered =
    activeCategory === "Todas"
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <section id="productos" className="bg-background px-4 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Nuestra Coleccion
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Gorras Urbanas
          </h2>
        </div>

        {/* Category filters */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
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

        {/* Products grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden border border-border bg-card transition-all hover:border-foreground/20"
            >
              {/* Badges */}
              <div className="absolute left-3 top-3 z-10 flex gap-2">
                {product.isNew && (
                  <span className="bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                    Nuevo
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="flex h-12 w-12 items-center justify-center bg-foreground text-background transition-transform hover:scale-110"
                    aria-label={`Ver detalles de ${product.name}`}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
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
                </div>
              </div>

              {/* Out of stock overlay */}
              {product.stock === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70">
                  <span className="bg-destructive px-4 py-2 text-xs font-bold uppercase tracking-widest text-destructive-foreground">
                    Agotado
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category}
                  </p>
                  {product.stock > 0 && product.stock < 10 && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      Quedan {product.stock}
                    </p>
                  )}
                </div>
                <h3 className="mt-1 font-display text-lg font-bold uppercase text-foreground">
                  {product.name}
                </h3>
                <p className="mt-2 font-display text-xl font-bold text-foreground">
                  ${product.price} MXN
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  )
}
