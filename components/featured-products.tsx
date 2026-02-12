"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Snapback Classic Negro",
    price: 450,
    image: "/images/snapback-black.jpg",
    href: "#",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Snapback Navy",
    price: 450,
    image: "/images/snapback-navy.jpg",
    href: "#",
    tag: null,
  },
  {
    id: 3,
    name: "Dad Hat Gris",
    price: 380,
    image: "/images/dad-hat-gray.jpg",
    href: "#",
    tag: "Nuevo",
  },
  {
    id: 4,
    name: "Trucker Black & White",
    price: 420,
    image: "/images/trucker-cap.jpg",
    href: "#",
    tag: null,
  },
  {
    id: 5,
    name: "Fitted Cap Negro",
    price: 520,
    image: "/images/fitted-cap.jpg",
    href: "#",
    tag: "Premium",
  },
  {
    id: 6,
    name: "Snapback Blanco",
    price: 450,
    image: "/images/snapback-white.jpg",
    href: "#",
    tag: null,
  },
]

export function FeaturedProducts() {
  return (
    <section className="bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Lo Mas Buscado
            </p>
            <h3 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              Productos Destacados
            </h3>
          </div>
          <Button variant="outline" className="bg-transparent font-bold uppercase tracking-wider" asChild>
            <Link href="#">Ver Todo</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link href={product.href} className="block">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/10" />
                  {product.tag && (
                    <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      {product.tag}
                    </span>
                  )}
                </div>
              </Link>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold transition-colors group-hover:text-primary">
                    {product.name}
                  </h4>
                  <p className="mt-1 font-display text-lg font-semibold">${product.price} MXN</p>
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  aria-label={`Agregar ${product.name} al carrito`}
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
