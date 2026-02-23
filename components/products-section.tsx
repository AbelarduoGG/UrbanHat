"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Eye, Search, ShoppingBag, X } from "lucide-react"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useProducts } from "@/lib/products-context"
import { ProductModal } from "@/components/product-modal"

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function ProductCardItem({
  product,
  canBuy,
  onOpen,
  onAdd,
}: {
  product: Product
  canBuy: boolean
  onOpen: () => void
  onAdd: () => void
}) {
  const images = product.images?.length ? product.images : [product.image]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const showNextImage = () => {
    if (images.length <= 1) return
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const showPrevImage = () => {
    if (images.length <= 1) return
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="group relative overflow-hidden border border-border bg-card transition-all hover:border-foreground/20">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevImage}
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
              aria-label={`Imagen anterior de ${product.name}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
              aria-label={`Siguiente imagen de ${product.name}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/70 px-2 py-1">
              {images.map((_, index) => (
                <button
                  key={`${product.id}-dot-${index}`}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentImageIndex === index ? "bg-accent" : "bg-muted-foreground/50"
                  }`}
                  aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={onOpen}
            className="flex h-12 w-12 items-center justify-center bg-foreground text-background transition-transform hover:scale-110"
            aria-label={`Ver detalles de ${product.name}`}
          >
            <Eye className="h-5 w-5" />
          </button>
          {canBuy && (
            <button
              type="button"
              onClick={onAdd}
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
        <p className="font-display text-xl font-bold text-foreground">${product.price} MXN</p>
      </div>
    </div>
  )
}

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">(
    "name-asc"
  )
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
    const term = normalizeText(search)
    const terms = term ? term.split(/\s+/).filter(Boolean) : []

    const base = products.filter((product) => {
      const categoryMatch =
        activeCategory === "Todas" || product.category === activeCategory

      const searchableText = normalizeText(
        [
          product.name,
          product.brand,
          product.description,
          product.category,
          product.sellerName,
          product.id,
        ].join(" ")
      )

      const searchMatch =
        terms.length === 0 || terms.every((part) => searchableText.includes(part))

      return categoryMatch && searchMatch
    })

    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.name.localeCompare(a.name, "es", { sensitivity: "base" })
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "name-asc":
        default:
          return a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      }
    })
  }, [products, activeCategory, search, sortBy])

  const resetFilters = () => {
    setSearch("")
    setActiveCategory("Todas")
    setSortBy("name-asc")
  }

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

        <div className="mb-6 grid gap-3 border border-border bg-card p-3 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Buscar por nombre, marca, descripción, categoría o vendedor"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ordenar
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name-asc" | "name-desc" | "price-asc" | "price-desc")
              }
              className="h-10 border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="price-asc">Precio menor a mayor</option>
              <option value="price-desc">Precio mayor a menor</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="h-10 border border-border px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Limpiar
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Mostrando {filtered.length} de {products.length} productos
        </p>

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
            <ProductCardItem
              key={product.id}
              product={product}
              canBuy={canBuy}
              onOpen={() => setSelectedProduct(product)}
              onAdd={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
            />
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
