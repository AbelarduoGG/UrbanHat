"use client"

import Image from "next/image"
import { X, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

interface ProductModalProps {
  product: Product
  onClose: () => void
  canBuy: boolean
}

export function ProductModal({ product, onClose, canBuy }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const images = product.images?.length ? product.images : [product.image]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart } = useCart()

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative z-10 grid w-full max-w-3xl overflow-hidden border border-border bg-card md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:text-muted-foreground"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="relative flex aspect-square flex-col gap-3 p-3">
          <div className="relative flex-1 overflow-hidden border border-border">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={`${product.id}-thumb-${index}`}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square overflow-hidden border ${
                    currentImageIndex === index ? "border-accent" : "border-border"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center p-6 lg:p-8">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold uppercase text-foreground">
            {product.name}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Marca: {product.brand}</p>
          <p className="text-xs text-muted-foreground">Vendedor: {product.sellerName}</p>
          <p className="mt-6 font-display text-3xl font-bold text-foreground">
            ${product.price} MXN
          </p>

          {/* Stock indicator */}
          <div className="mt-3">
            {product.stock === 0 ? (
              <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                Agotado
              </span>
            ) : product.stock < 10 ? (
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                Solo quedan {product.stock} unidades
              </span>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                En stock
              </span>
            )}
          </div>

         {canBuy && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cantidad
            </span>
            <div className="flex items-center border border-border">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-bold text-foreground">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {canBuy && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`mt-6 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-opacity ${
              product.stock === 0
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-accent text-accent-foreground hover:opacity-90"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
          </button>
        )}
        </div>
      </div>
    </div>
  )
}
