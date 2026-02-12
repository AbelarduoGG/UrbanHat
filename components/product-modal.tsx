"use client"

import Image from "next/image"
import { X, ShoppingBag, Minus, Plus } from "lucide-react"
import { useState } from "react"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

interface ProductModalProps {
  product: Product
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
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
        <div className="relative aspect-square">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
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

          {/* Quantity selector */}
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
        </div>
      </div>
    </div>
  )
}
