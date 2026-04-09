"use client"

import React from "react"

import { useState } from "react"
import { Send, MapPin, Phone, Mail } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setTimeout(() => {
      setSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      setIsSubmitting(false)
      setTimeout(() => setSubmitted(false), 3000)
    }, 900)
  }

  const handleFieldChange = (
    field: "name" | "email" | "subject" | "message",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section id="contacto" className="bg-card px-4 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Contacto
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Hablemos
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact info */}
          <div>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Tienes alguna pregunta, quieres hacer un pedido especial o simplemente
              quieres saludar? Estamos aqui para ti.
            </p>
            <ul className="flex flex-col gap-6">
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border">
                  <MapPin className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Ubicacion
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ciudad de Mexico, Mexico
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border">
                  <Phone className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Telefono
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    +52 55 1234 5678
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border">
                  <Mail className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    hola@urbanhat.mx
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            suppressHydrationWarning
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  required
                  placeholder="Tu nombre"
                  suppressHydrationWarning
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  required
                  placeholder="tu@email.com"
                  suppressHydrationWarning
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Asunto
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleFieldChange("subject", e.target.value)}
                required
                placeholder="De que quieres hablar?"
                suppressHydrationWarning
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleFieldChange("message", e.target.value)}
                required
                rows={5}
                placeholder="Escribe tu mensaje..."
                suppressHydrationWarning
                className="w-full resize-none border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-accent px-8 py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" />
              {isSubmitting
                ? "Enviando..."
                : submitted
                  ? "Mensaje Enviado!"
                  : "Enviar Mensaje"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
