"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Menu, X, User, LogIn } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
]

export function Navbar() {
  const { totalItems, setIsCartOpen } = useCart()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const profileHref =
    user?.role === "superadmin" || user?.role === "seller" ? "/admin" : "/cuenta"
  const canBuy = !user || user.role === "buyer"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="Urban Hat logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <span className="font-display text-xl font-bold uppercase tracking-widest text-foreground">
            Urban Hat
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Auth link */}
          {user ? (
            <Link
              href={profileHref}
              className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Mi cuenta"
            >
              <div className="flex h-8 w-8 items-center justify-center border border-border bg-primary text-primary-foreground transition-colors group-hover:border-accent">
                <span className="text-xs font-bold uppercase">
                  {user.nombre[0]}
                  {user.apellido[0]}
                </span>
              </div>
              <span className="hidden text-xs font-medium uppercase tracking-wider lg:inline">
                {user.nombre}
              </span>
            </Link>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Iniciar sesión"
              >
                <LogIn className="h-5 w-5" />
                <span>Ingresar</span>
              </Link>
              <Link
                href="/registro"
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Crear cuenta
              </Link>
            </div>
          )}

          {canBuy && (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative text-foreground transition-colors hover:text-accent"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <ul className="flex flex-col px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="border-t border-border pt-3">
              {user ? (
                <Link
                  href={profileHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-3 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  {user.role === "superadmin" || user.role === "seller"
                    ? "Panel"
                    : "Mi cuenta"}
                </Link>
              ) : (
                <div className="flex flex-col">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-3 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-3 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    Crear cuenta
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
