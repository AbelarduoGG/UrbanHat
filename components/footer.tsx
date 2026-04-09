"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react"
import { PRODUCT_CATEGORIES } from "@/lib/constants/product-categories"

const quickLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
  { label: "Iniciar sesion", href: "/login" },
  { label: "Crear cuenta", href: "/registro" },
]

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "WhatsApp", href: "https://wa.me/525512345678", icon: MessageCircle },
]

export function Footer() {
  const featuredCategories = PRODUCT_CATEGORIES.slice(0, 6)

  return (
    <footer className="border-t border-border bg-background px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="text-center sm:text-left lg:col-span-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start">
              <Image src="/logo.jpeg" alt="Urban Hat" width={40} height={40} className="rounded-full" />
              <span className="font-display text-lg font-bold uppercase text-foreground">
                Urban Hat
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:max-w-none">
              Disenamos gorras con identidad urbana para quienes quieren destacar sin decir una sola palabra.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <a
                href="#productos"
                className="inline-flex items-center gap-2 border border-border bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground transition-opacity hover:opacity-90"
              >
                Ver catalogo
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/registro"
                className="inline-flex items-center border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="grid gap-8 text-center sm:grid-cols-2 sm:text-left lg:col-span-7 lg:grid-cols-3">
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Enlaces
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {quickLinks.map((item) => (
                  <li key={item.href + item.label}>
                    {item.href.startsWith("#") ? (
                      <a href={item.href} className="transition-colors hover:text-foreground">
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className="transition-colors hover:text-foreground">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Categorias
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {featuredCategories.map((category) => (
                  <li key={category}>
                    <a href="#productos" className="transition-colors hover:text-foreground">
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Contacto y redes
              </h4>

              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:hola@urbanhat.mx" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                    <Mail className="h-4 w-4" />
                    hola@urbanhat.mx
                  </a>
                </li>
                <li>
                  <a href="tel:+525512345678" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                    <Phone className="h-4 w-4" />
                    +52 55 1234 5678
                  </a>
                </li>
                <li className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Guadalajara, México
                </li>
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Urban Hat. Todos los derechos reservados.
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Hecho en Mexico para la cultura urbana.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}