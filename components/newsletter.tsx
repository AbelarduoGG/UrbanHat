"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Instagram } from "lucide-react"
import Link from "next/link"

export function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <section className="bg-primary py-16 text-primary-foreground md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] opacity-80">
            Unete al Crew
          </p>
          <h3 className="font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">
            15% OFF en tu primera compra
          </h3>
          <p className="mx-auto mt-4 max-w-md opacity-80">
            Suscribete y recibe ofertas exclusivas, lanzamientos y mas. Solo para el squad.
          </p>
          
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="Tu correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button type="submit" variant="secondary" className="gap-2 font-bold uppercase tracking-wider">
              Suscribirse
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="text-sm font-bold uppercase tracking-wider opacity-80">Siguenos</span>
            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
