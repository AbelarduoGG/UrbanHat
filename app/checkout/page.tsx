"use client"

import React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Lock,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

type Step = "cart" | "shipping" | "payment" | "confirmation"

interface ShippingData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  calle: string
  numero: string
  colonia: string
  ciudad: string
  estado: string
  codigoPostal: string
}

interface PaymentData {
  titular: string
  numero: string
  expiracion: string
  cvv: string
}

const SHIPPING_COST = 99
const FREE_SHIPPING_MIN = 999

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart()

  const [currentStep, setCurrentStep] = useState<Step>("cart")
  const [orderNumber, setOrderNumber] = useState("")

  const [shipping, setShipping] = useState<ShippingData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    calle: "",
    numero: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
  })

  const [payment, setPayment] = useState<PaymentData>({
    titular: "",
    numero: "",
    expiracion: "",
    cvv: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/login?next=/checkout")
      return
    }

    if (user.role !== "buyer") {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user || user.role !== "buyer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  const shippingCost = totalPrice >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST
  const grandTotal = totalPrice + shippingCost

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "cart", label: "Carrito", icon: <ShoppingBag className="h-4 w-4" /> },
    { key: "shipping", label: "Envio", icon: <Truck className="h-4 w-4" /> },
    { key: "payment", label: "Pago", icon: <CreditCard className="h-4 w-4" /> },
    {
      key: "confirmation",
      label: "Confirmacion",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ]

  const stepIndex = steps.findIndex((s) => s.key === currentStep)

  const validateShipping = () => {
    const newErrors: Record<string, string> = {}
    if (!shipping.nombre.trim()) newErrors.nombre = "Requerido"
    if (!shipping.apellido.trim()) newErrors.apellido = "Requerido"
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email))
      newErrors.email = "Email invalido"
    if (!shipping.telefono.trim() || shipping.telefono.length < 10)
      newErrors.telefono = "Telefono invalido"
    if (!shipping.calle.trim()) newErrors.calle = "Requerido"
    if (!shipping.numero.trim()) newErrors.numero = "Requerido"
    if (!shipping.colonia.trim()) newErrors.colonia = "Requerido"
    if (!shipping.ciudad.trim()) newErrors.ciudad = "Requerido"
    if (!shipping.estado.trim()) newErrors.estado = "Requerido"
    if (!shipping.codigoPostal.trim() || shipping.codigoPostal.length < 5)
      newErrors.codigoPostal = "Codigo postal invalido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePayment = () => {
    const newErrors: Record<string, string> = {}
    if (!payment.titular.trim()) newErrors.titular = "Requerido"
    if (!payment.numero.trim() || payment.numero.replace(/\s/g, "").length < 16)
      newErrors.numero = "Numero invalido"
    if (!payment.expiracion.trim() || !/^\d{2}\/\d{2}$/.test(payment.expiracion))
      newErrors.expiracion = "Formato MM/AA"
    if (!payment.cvv.trim() || payment.cvv.length < 3)
      newErrors.cvv = "CVV invalido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (currentStep === "cart" && items.length > 0) {
      setCurrentStep("shipping")
    } else if (currentStep === "shipping" && validateShipping()) {
      setCurrentStep("payment")
    } else if (currentStep === "payment" && validatePayment()) {
      const num = `UH-${Date.now().toString(36).toUpperCase()}`
      setOrderNumber(num)
      clearCart()
      setCurrentStep("confirmation")
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 16)
    return v.replace(/(.{4})/g, "$1 ").trim()
  }

  const formatExpiration = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4)
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`
    return v
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Urban Hat"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
              Urban Hat
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </header>

      {/* Step indicator */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center border transition-colors ${
                      i <= stepIndex
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`hidden text-[10px] font-bold uppercase tracking-wider sm:block ${
                      i <= stepIndex
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 transition-colors ${
                      i < stepIndex ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Cart Step */}
        {currentStep === "cart" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                Tu Carrito
              </h1>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-border bg-card py-16 text-center">
                  <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
                  <p className="font-display text-lg font-bold uppercase text-muted-foreground">
                    Tu carrito esta vacio
                  </p>
                  <Link
                    href="/#productos"
                    className="mt-4 text-sm font-medium uppercase tracking-wider text-accent underline underline-offset-4"
                  >
                    Ver productos
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border border-border bg-card p-4"
                    >
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-sm font-bold uppercase text-foreground">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm font-bold text-foreground">
                              ${item.price} MXN
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            aria-label={`Eliminar ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
                              aria-label="Menos"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-8 w-10 items-center justify-center border-x border-border text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
                              aria-label="Mas"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            ${item.price * item.quantity} MXN
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order summary */}
            {items.length > 0 && (
              <div className="lg:col-span-1">
                <div className="border border-border bg-card p-6">
                  <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                    Resumen
                  </h2>
                  <div className="flex flex-col gap-3 border-b border-border pb-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Subtotal ({totalItems}{" "}
                        {totalItems === 1 ? "articulo" : "articulos"})
                      </span>
                      <span className="text-foreground">${totalPrice} MXN</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Envio</span>
                      <span className="text-foreground">
                        {shippingCost === 0 ? "GRATIS" : `$${shippingCost} MXN`}
                      </span>
                    </div>
                    {totalPrice < FREE_SHIPPING_MIN && (
                      <p className="text-xs text-muted-foreground">
                        Agrega ${FREE_SHIPPING_MIN - totalPrice} MXN mas para
                        envio gratis
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-lg font-bold uppercase text-foreground">
                      Total
                    </span>
                    <span className="font-display text-2xl font-bold text-foreground">
                      ${grandTotal} MXN
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-6 w-full bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    Continuar al Envio
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipping Step */}
        {currentStep === "shipping" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                Datos de Envio
              </h1>
              <div className="border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Direccion de entrega
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "nombre",
                      label: "Nombre",
                      placeholder: "Tu nombre",
                    },
                    {
                      key: "apellido",
                      label: "Apellido",
                      placeholder: "Tu apellido",
                    },
                    {
                      key: "email",
                      label: "Email",
                      placeholder: "correo@ejemplo.com",
                      type: "email",
                      full: true,
                    },
                    {
                      key: "telefono",
                      label: "Telefono",
                      placeholder: "55 1234 5678",
                      type: "tel",
                    },
                    {
                      key: "calle",
                      label: "Calle",
                      placeholder: "Nombre de la calle",
                    },
                    {
                      key: "numero",
                      label: "Numero",
                      placeholder: "Ext / Int",
                    },
                    {
                      key: "colonia",
                      label: "Colonia",
                      placeholder: "Tu colonia",
                    },
                    {
                      key: "ciudad",
                      label: "Ciudad",
                      placeholder: "Tu ciudad",
                    },
                    {
                      key: "estado",
                      label: "Estado",
                      placeholder: "Tu estado",
                    },
                    {
                      key: "codigoPostal",
                      label: "Codigo Postal",
                      placeholder: "00000",
                    },
                  ].map((field) => (
                    <div
                      key={field.key}
                      className={field.full ? "sm:col-span-2" : ""}
                    >
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {field.label}
                      </label>
                      <input
                        type={field.type || "text"}
                        value={shipping[field.key as keyof ShippingData]}
                        onChange={(e) =>
                          setShipping({
                            ...shipping,
                            [field.key]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        className={`w-full border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                          errors[field.key]
                            ? "border-destructive"
                            : "border-border"
                        }`}
                      />
                      {errors[field.key] && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Resumen
                </h2>
                <div className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-foreground">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                  <span>Envio</span>
                  <span className="text-foreground">
                    {shippingCost === 0 ? "GRATIS" : `$${shippingCost}`}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display font-bold uppercase text-foreground">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-foreground">
                    ${grandTotal} MXN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="mt-6 w-full bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Continuar al Pago
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("cart")}
                  className="mt-2 w-full py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Volver al Carrito
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === "payment" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                Metodo de Pago
              </h1>
              <div className="border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Pago seguro
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Titular de la tarjeta
                    </label>
                    <input
                      type="text"
                      value={payment.titular}
                      onChange={(e) =>
                        setPayment({ ...payment, titular: e.target.value })
                      }
                      placeholder="Nombre completo"
                      className={`w-full border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.titular ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.titular && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.titular}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Numero de tarjeta
                    </label>
                    <input
                      type="text"
                      value={payment.numero}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          numero: formatCardNumber(e.target.value),
                        })
                      }
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className={`w-full border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.numero ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.numero && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.numero}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Expiracion
                      </label>
                      <input
                        type="text"
                        value={payment.expiracion}
                        onChange={(e) =>
                          setPayment({
                            ...payment,
                            expiracion: formatExpiration(e.target.value),
                          })
                        }
                        placeholder="MM/AA"
                        maxLength={5}
                        className={`w-full border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                          errors.expiracion
                            ? "border-destructive"
                            : "border-border"
                        }`}
                      />
                      {errors.expiracion && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.expiracion}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={payment.cvv}
                        onChange={(e) =>
                          setPayment({
                            ...payment,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        placeholder="000"
                        maxLength={4}
                        className={`w-full border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                          errors.cvv ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping summary */}
                <div className="mt-6 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Enviar a:
                  </p>
                  <p className="text-sm text-foreground">
                    {shipping.nombre} {shipping.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipping.calle} {shipping.numero}, {shipping.colonia}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipping.ciudad}, {shipping.estado} C.P.{" "}
                    {shipping.codigoPostal}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Resumen
                </h2>
                <div className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-foreground">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                  <span>Envio</span>
                  <span className="text-foreground">
                    {shippingCost === 0 ? "GRATIS" : `$${shippingCost}`}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display font-bold uppercase text-foreground">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-foreground">
                    ${grandTotal} MXN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="mt-6 flex w-full items-center justify-center gap-2 bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Lock className="h-4 w-4" />
                  Pagar ${grandTotal} MXN
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("shipping")}
                  className="mt-2 w-full py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Volver al Envio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {currentStep === "confirmation" && (
          <div className="mx-auto max-w-lg text-center">
            <div className="border border-border bg-card p-8 lg:p-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-accent">
                <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                Pedido Confirmado
              </h1>
              <p className="mt-4 text-muted-foreground">
                Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
              </p>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Numero de pedido
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {orderNumber}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-6 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Enviar a
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {shipping.nombre} {shipping.apellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  {shipping.calle} {shipping.numero}, {shipping.colonia}
                </p>
                <p className="text-sm text-muted-foreground">
                  {shipping.ciudad}, {shipping.estado} C.P.{" "}
                  {shipping.codigoPostal}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-6 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contacto
                </p>
                <p className="mt-1 text-sm text-foreground">{shipping.email}</p>
                <p className="text-sm text-muted-foreground">
                  {shipping.telefono}
                </p>
              </div>

              <p className="mt-8 text-sm text-muted-foreground">
                Recibiras un email de confirmacion con los detalles de tu pedido
                y la informacion de rastreo.
              </p>

              <Link
                href="/"
                className="mt-6 inline-block bg-accent px-8 py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
