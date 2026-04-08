"use client"

import React, { Suspense } from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      if (result.role === "seller" || result.role === "superadmin") {
        sessionStorage.setItem("urban-hat-admin", "true")
        router.push("/admin")
      } else {
        const nextPath = searchParams.get("next")
        router.push(nextPath || "/cuenta")
      }
    } else {
      setError(result.error || "Error al iniciar sesion")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen">

      <div className="absolute inset-0 -z-10 lg:hidden">
        <Image
          src="/street-mobile.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

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

          <h2 className="mt-6 text-center font-display text-4xl font-bold uppercase text-foreground">
            Bienvenido de vuelta
          </h2>

          <p className="mt-3 text-center text-muted-foreground">
            Inicia sesion para acceder a tu cuenta
          </p>
        </div>
      </div>

      {/* 🔥 RIGHT SIDE / FORM */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">

        <div className="w-full max-w-md rounded-lg bg-background/80 p-6 backdrop-blur-md">

          {/* MOBILE HEADER */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Image
              src="/logo.jpeg"
              alt="Urban Hat"
              width={80}
              height={80}
              className="rounded-full"
            />
            <h1 className="mt-4 font-display text-2xl font-bold uppercase text-foreground">
              Urban Hat
            </h1>
          </div>

          {/* DESKTOP HEADER */}
          <div className="hidden lg:block">
            <h1 className="font-display text-3xl font-bold uppercase text-foreground">
              Iniciar Sesion
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales
            </p>
          </div>

          {/* MOBILE TITLE */}
          <h1 className="text-center font-display text-2xl font-bold uppercase text-foreground lg:hidden">
            Iniciar Sesion
          </h1>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-5">

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-card px-4 py-3 text-sm text-foreground"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Contrasena
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3 pr-12 text-sm text-foreground"
                    placeholder="Tu contrasena"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-destructive/10 p-3">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-accent py-4 text-sm font-bold uppercase text-accent-foreground"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-8 text-center">
            <Link href="/registro" className="text-sm text-muted-foreground">
              Crear cuenta nueva →
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-muted-foreground">
              Volver a la tienda
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}

