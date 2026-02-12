"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    quote: "La mejor calidad que he encontrado. Mis snapbacks favoritas son de Urban Hat.",
    author: "Carlos Ramirez",
    title: "Ciudad de Mexico",
    rating: 5,
  },
  {
    quote: "El estilo urbano que buscaba. Envio rapido y la atencion es increible.",
    author: "Maria Gonzalez",
    title: "Guadalajara",
    rating: 5,
  },
  {
    quote: "Ya compre tres cachuchas y todas son de excelente calidad. 100% recomendado.",
    author: "Diego Hernandez",
    title: "Monterrey",
    rating: 5,
  },
]

export function Testimonial() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Logo Display */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <Image
                src="/images/logo.jpeg"
                alt="Urban Hat"
                width={300}
                height={300}
                className="rounded-full"
              />
            </div>
          </div>

          {/* Testimonials */}
          <div className="text-center lg:text-left">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Lo Que Dicen
            </p>
            <h3 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              Nuestros Clientes
            </h3>
            
            <div className="mt-8">
              <div className="mb-4 flex justify-center gap-1 lg:justify-start">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              
              <blockquote className="text-xl leading-relaxed md:text-2xl">
                {`"${testimonials[current].quote}"`}
              </blockquote>
              
              <div className="mt-6">
                <p className="font-bold">{testimonials[current].author}</p>
                <p className="text-sm text-muted-foreground">{testimonials[current].title}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="bg-transparent"
                aria-label="Testimonio anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      index === current ? "bg-primary" : "bg-border"
                    }`}
                    aria-label={`Ir a testimonio ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="bg-transparent"
                aria-label="Siguiente testimonio"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
