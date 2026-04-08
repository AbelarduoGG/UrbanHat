"use client"



import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4 sm:text-left">
          <div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <Image src="/logo.jpeg" alt="Urban Hat" width={40} height={40} className="rounded-full" />
              <span className="font-display text-lg font-bold uppercase text-foreground">
                Urban Hat
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Gorras urbanas de alta calidad.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase text-foreground">
              Navegacion
            </h4>
            <ul className="flex flex-col gap-2 items-center sm:items-start">
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/registro">Registro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase text-foreground">
              Categorias
            </h4>
            <ul className="flex flex-col gap-2">
              <li>Snapback</li>
              <li>Fitted</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase text-foreground">
              Redes
            </h4>
            <ul className="flex flex-col gap-2">
              <li>Instagram</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}