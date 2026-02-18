"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!email.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios")
      setIsSubmitting(false)
      return
    }

    const result = await login(email, password)
    if (result.success) {
      router.push("/cuenta")
    } else {
      setError(result.error || "Error al iniciar sesion")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - decorative */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/street.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12">
          <Image
            src="/logo.jpeg"
            alt="Urban Hat"
            width={120}
            height={120}
            className="rounded-full"
          />
          <h2 className="mt-6 text-center font-display text-4xl font-bold uppercase tracking-wider text-foreground">
            Bienvenido de vuelta
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Inicia sesion para acceder a tu cuenta, ver tu historial de pedidos
            y gestionar tu perfil.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Image
              src="/logo.jpeg"
              alt="Urban Hat"
              width={80}
              height={80}
              className="rounded-full"
            />
            <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-widest text-foreground">
              Urban Hat
            </h1>
          </div>

          <div className="hidden lg:block">
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
              Iniciar Sesion
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          <h1 className="text-center font-display text-2xl font-bold uppercase tracking-tight text-foreground lg:hidden">
            Iniciar Sesion
          </h1>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contrasena
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Tu contrasena"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 border border-destructive/30 bg-destructive/10 px-4 py-3">
                <p className="text-xs font-medium text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                o
              </span>
              <div className="h-px w-12 bg-border" />
            </div>

            <Link
              href="/registro"
              className="group flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Crear cuenta nueva
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
