"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Header() {
  const [cartCount] = useState(0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-background">
            <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
            <nav className="mt-8 flex flex-col gap-6">
              <Link href="#" className="font-display text-2xl font-semibold uppercase tracking-wider transition-colors hover:text-primary">
                Tienda
              </Link>
              <Link href="#" className="font-display text-2xl font-semibold uppercase tracking-wider transition-colors hover:text-primary">
                Colecciones
              </Link>
              <Link href="#" className="font-display text-2xl font-semibold uppercase tracking-wider transition-colors hover:text-primary">
                Nosotros
              </Link>
              <Link href="#" className="font-display text-2xl font-semibold uppercase tracking-wider transition-colors hover:text-primary">
                Contacto
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation - Left */}
        <nav className="hidden flex-1 items-center gap-8 md:flex">
          <Link href="#" className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary">
            Tienda
          </Link>
          <Link href="#" className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary">
            Colecciones
          </Link>
        </nav>

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo.jpeg"
            alt="Urban Hat"
            width={60}
            height={60}
            className="h-12 w-12 rounded-full md:h-14 md:w-14"
          />
        </Link>

        {/* Desktop Navigation - Right */}
        <nav className="hidden flex-1 items-center justify-end gap-8 md:flex">
          <Link href="#" className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary">
            Nosotros
          </Link>
          <Link href="#" className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative" aria-label="Carrito de compras">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
