"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, UserPlus, ArrowRight, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
  })
  const [isSeller, setIsSeller] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordRequirements = [
    { label: "Minimo 8 caracteres", met: formData.password.length >= 8 },
    { label: "Al menos una mayuscula", met: /[A-Z]/.test(formData.password) },
    { label: "Al menos un numero", met: /\d/.test(formData.password) },
  ]

  const allMet = passwordRequirements.every((r) => r.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Todos los campos son obligatorios")
      setIsSubmitting(false)
      return
    }

    if (!allMet) {
      setError("La contrasena no cumple con los requisitos")
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contrasenas no coinciden")
      setIsSubmitting(false)
      return
    }

    if (
      isSeller &&
      (!formData.shopName.trim() ||
        !formData.telefono.trim() ||
        !formData.direccion.trim() ||
        !formData.ciudad.trim() ||
        !formData.estado.trim() ||
        !formData.codigoPostal.trim())
    ) {
      setError("Para vendedor, completa todos los datos obligatorios")
      setIsSubmitting(false)
      return
    }

    const result = await register({
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      password: formData.password,
      wantSeller: isSeller,
      shopName: formData.shopName,
      telefono: formData.telefono,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      estado: formData.estado,
      codigoPostal: formData.codigoPostal,
    })

    if (result.success) {
      if (isSeller) {
        setSuccessMessage("Registro enviado. Un administrador debe activar tu cuenta de vendedor.")
        setIsSubmitting(false)
        return
      }

      router.push("/cuenta")
    } else {
      setError(result.error || "Error al crear la cuenta")
      setIsSubmitting(false)
    }
  }

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

 return (
    <div className="relative flex min-h-screen">

      <div className="absolute inset-0 -z-10 lg:hidden">
        <Image
          src="/register-mobile.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/registro.jpg"
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
            Unete a la cultura
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Crea tu cuenta para disfrutar de ofertas exclusivas, seguimiento de
            pedidos y acceso anticipado a nuevas colecciones.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {[
              "Ofertas exclusivas para miembros",
              "Seguimiento de tus pedidos",
              "Lista de favoritos personalizada",
              "Acceso anticipado a lanzamientos",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center bg-accent">
                  <Check className="h-3 w-3 text-accent-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">

        <div className="w-full max-w-md rounded-lg bg-background/80 p-6 backdrop-blur-md">

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
              Crear Cuenta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Registrate para acceder a beneficios exclusivos
            </p>
          </div>

          <h1 className="text-center font-display text-2xl font-bold uppercase tracking-tight text-foreground lg:hidden">
            Crear Cuenta
          </h1>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Tu nombre"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => updateField("apellido", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Tu apellido"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
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
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Crea una contrasena"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password requirements */}
                {formData.password.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center transition-colors ${
                            req.met
                              ? "bg-green-500"
                              : "border border-border"
                          }`}
                        >
                          {req.met && (
                            <Check className="h-2.5 w-2.5 text-background" />
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            req.met
                              ? "text-green-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirmar Contrasena
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    className={`w-full border bg-card px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                      formData.confirmPassword.length > 0 &&
                      formData.confirmPassword !== formData.password
                        ? "border-destructive"
                        : "border-border"
                    }`}
                    placeholder="Repite tu contrasena"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword.length > 0 &&
                  formData.confirmPassword !== formData.password && (
                    <p className="mt-1.5 text-xs text-destructive">
                      Las contrasenas no coinciden
                    </p>
                  )}
              </div>

              <div className="border border-border bg-card p-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isSeller}
                    onChange={(e) => setIsSeller(e.target.checked)}
                  />
                  Quiero registrarme como vendedor
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Si marcas esta opción, tu cuenta queda pendiente de aprobación por un administrador.
                </p>
              </div>

              {isSeller && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => updateField("shopName", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground"
                    placeholder="Nombre de tienda"
                  />
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => updateField("telefono", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground"
                    placeholder="Teléfono"
                  />
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => updateField("direccion", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground sm:col-span-2"
                    placeholder="Dirección"
                  />
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => updateField("ciudad", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground"
                    placeholder="Ciudad"
                  />
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => updateField("estado", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground"
                    placeholder="Estado"
                  />
                  <input
                    type="text"
                    value={formData.codigoPostal}
                    onChange={(e) => updateField("codigoPostal", e.target.value)}
                    className="w-full border border-border bg-card px-4 py-3.5 text-sm text-foreground"
                    placeholder="Código postal"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 border border-destructive/30 bg-destructive/10 px-4 py-3">
                <p className="text-xs font-medium text-destructive">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 border border-green-500/30 bg-green-500/10 px-4 py-3">
                <p className="text-xs font-medium text-green-500">{successMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Creando cuenta..." : isSeller ? "Enviar solicitud" : "Crear Cuenta"}
            </button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Al registrarte, aceptas nuestros{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">
                Terminos y Condiciones
              </a>{" "}
              y{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">
                Politica de Privacidad
              </a>
            </p>
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
              href="/login"
              className="group flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Ya tengo cuenta
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
