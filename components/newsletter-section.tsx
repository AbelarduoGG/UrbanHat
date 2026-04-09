"use client"

import React from "react"

import { useState } from "react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setTimeout(() => {
      setSubscribed(true)
      setEmail("")
      setIsSubmitting(false)
      setTimeout(() => setSubscribed(false), 3000)
    }, 700)
  }

  return (
    <section className="border-y border-border bg-primary px-4 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-primary-foreground md:text-4xl">
          Unete al Movimiento
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
          Suscribete para recibir noticias de nuevos lanzamientos, ofertas
          exclusivas y contenido urbano directo a tu inbox.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="flex-1 border border-primary-foreground/20 bg-transparent px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-primary-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-accent px-8 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
          >
            {isSubmitting
              ? "Enviando..."
              : subscribed
                ? "Suscrito!"
                : "Suscribirse"}
          </button>
        </form>
      </div>
    </section>
  )
}
