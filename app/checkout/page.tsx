"use client"

import { useEffect, useRef, useState } from "react"
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

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

interface CreateOrderData {
  orderId: string
  shippingStatus?: string
  shippingMessage?: string
}

function splitComposedAddress(direccion?: string) {
  const raw = (direccion || "").trim()
  if (!raw) {
    return { calle: "", numero: "", colonia: "" }
  }

  const [streetAndNumberPart, coloniaPart = ""] = raw.split(",").map((part) => part.trim())

  if (!streetAndNumberPart) {
    return { calle: "", numero: "", colonia: coloniaPart }
  }

  const match = streetAndNumberPart.match(/^(.*\S)\s+([^\s]+)$/)

  if (!match) {
    return {
      calle: streetAndNumberPart,
      numero: "",
      colonia: coloniaPart,
    }
  }

  return {
    calle: match[1] || "",
    numero: match[2] || "",
    colonia: coloniaPart,
  }
}

const SHIPPING_COST = 99
const FREE_SHIPPING_MIN = 999

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading, updateProfile } = useAuth()
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart()

  const [currentStep, setCurrentStep] = useState<Step>("cart")
  const [orderNumber, setOrderNumber] = useState("")
  const [shippingStatusMessage, setShippingStatusMessage] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [shippingSaveError, setShippingSaveError] = useState("")
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const hasProcessedStripeReturn = useRef(false)
  const hasPrefilledShipping = useRef(false)

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

  useEffect(() => {
    sessionStorage.setItem("urbanhat_checkout_shipping", JSON.stringify(shipping))
  }, [shipping])

  useEffect(() => {
    if (isLoading || !user || hasPrefilledShipping.current) return

    let savedShipping: Partial<ShippingData> = {}
    const savedRaw = sessionStorage.getItem("urbanhat_checkout_shipping")

    if (savedRaw) {
      try {
        savedShipping = JSON.parse(savedRaw) as Partial<ShippingData>
      } catch {
        savedShipping = {}
      }
    }

    const parsedAddress = splitComposedAddress(user.direccion)

    setShipping({
      nombre: savedShipping.nombre || user.nombre || "",
      apellido: savedShipping.apellido || user.apellido || "",
      email: savedShipping.email || user.email || "",
      telefono: user.telefono || savedShipping.telefono || "",
      calle: parsedAddress.calle,
      numero: parsedAddress.numero,
      colonia: parsedAddress.colonia,
      ciudad: user.ciudad || "",
      estado: user.estado || "",
      codigoPostal: user.codigoPostal || "",
    })

    hasPrefilledShipping.current = true
  }, [isLoading, user])

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
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) {
      newErrors.email = "Email invalido"
    }
    if (!shipping.telefono.trim() || shipping.telefono.length < 10) {
      newErrors.telefono = "Telefono invalido"
    }
    if (!shipping.calle.trim()) newErrors.calle = "Requerido"
    if (!shipping.numero.trim()) newErrors.numero = "Requerido"
    if (!shipping.colonia.trim()) newErrors.colonia = "Requerido"
    if (!shipping.ciudad.trim()) newErrors.ciudad = "Requerido"
    if (!shipping.estado.trim()) newErrors.estado = "Requerido"
    if (!shipping.codigoPostal.trim() || shipping.codigoPostal.length < 5) {
      newErrors.codigoPostal = "Codigo postal invalido"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const processStripeCheckout = async () => {
    setPaymentError("")
    setIsProcessingPayment(true)

    try {
      const checkoutItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      const response = await fetch("/api/v1/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          origin: window.location.origin,
        }),
      })

      const payload = (await response.json()) as ApiResponse<{ url?: string }>

      if (!response.ok || !payload.success || !payload.data?.url) {
        setPaymentError(payload.error || "No se pudo iniciar el pago con Stripe")
        return
      }

      sessionStorage.setItem(
        "urbanhat_checkout_pending",
        JSON.stringify({
          items: checkoutItems,
          shipping,
        })
      )

      window.location.href = payload.data.url
    } catch {
      setPaymentError("No se pudo iniciar el pago con Stripe")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const persistShippingInAccount = async () => {
    setShippingSaveError("")
    setIsSavingAddress(true)

    try {
      const direccionCompuesta = `${shipping.calle} ${shipping.numero}, ${shipping.colonia}`
        .replace(/\s+/g, " ")
        .trim()

      const profileChanged =
        (user?.nombre || "") !== shipping.nombre ||
        (user?.apellido || "") !== shipping.apellido ||
        (user?.telefono || "") !== shipping.telefono

      const addressChanged =
        (user?.direccion || "") !== direccionCompuesta ||
        (user?.ciudad || "") !== shipping.ciudad ||
        (user?.estado || "") !== shipping.estado ||
        (user?.codigoPostal || "") !== shipping.codigoPostal ||
        (user?.telefono || "") !== shipping.telefono

      if (profileChanged) {
        const profileResponse = await fetch("/api/v1/account/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: shipping.nombre,
            apellido: shipping.apellido,
            telefono: shipping.telefono,
          }),
        })

        const profilePayload = (await profileResponse.json()) as ApiResponse
        if (!profileResponse.ok || !profilePayload.success) {
          setShippingSaveError(
            profilePayload.error ||
              "No se pudo actualizar tu perfil. Puedes continuar con tu compra."
          )
        }
      }

      if (addressChanged) {
        const addressResponse = await fetch("/api/v1/account/address", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direccion: direccionCompuesta,
            ciudad: shipping.ciudad,
            estado: shipping.estado,
            codigoPostal: shipping.codigoPostal,
            telefono: shipping.telefono,
          }),
        })

        const addressPayload = (await addressResponse.json()) as ApiResponse
        if (!addressResponse.ok || !addressPayload.success) {
          setShippingSaveError(
            addressPayload.error ||
              "No se pudo actualizar tu dirección. Puedes continuar con tu compra."
          )
        }
      }

      updateProfile({
        nombre: shipping.nombre,
        apellido: shipping.apellido,
        telefono: shipping.telefono,
        direccion: direccionCompuesta,
        ciudad: shipping.ciudad,
        estado: shipping.estado,
        codigoPostal: shipping.codigoPostal,
      })

      return true
    } catch {
      setShippingSaveError("No se pudo actualizar tu dirección. Puedes continuar con tu compra.")
      return true
    } finally {
      setIsSavingAddress(false)
    }
  }

  useEffect(() => {
    if (isLoading || !user || user.role !== "buyer") return
    if (hasProcessedStripeReturn.current) return

    const params = new URLSearchParams(window.location.search)
    const status = params.get("status")
    const sessionId = params.get("session_id")

    if (!status) return

    if (status === "cancel") {
      hasProcessedStripeReturn.current = true
      setCurrentStep("payment")
      setPaymentError("Pago cancelado. Puedes intentar nuevamente.")
      window.history.replaceState({}, "", "/checkout")
      return
    }

    if (status !== "success" || !sessionId) return

    const pendingRaw = sessionStorage.getItem("urbanhat_checkout_pending")
    if (!pendingRaw) {
      hasProcessedStripeReturn.current = true
      setCurrentStep("payment")
      setPaymentError("No se encontraron datos de checkout para confirmar el pago.")
      window.history.replaceState({}, "", "/checkout")
      return
    }

    let pending: { items: Array<{ productId: string; quantity: number }>; shipping: ShippingData }

    try {
      pending = JSON.parse(pendingRaw) as {
        items: Array<{ productId: string; quantity: number }>
        shipping: ShippingData
      }
    } catch {
      hasProcessedStripeReturn.current = true
      setCurrentStep("payment")
      setPaymentError("No se pudieron leer los datos de checkout.")
      window.history.replaceState({}, "", "/checkout")
      return
    }

    hasProcessedStripeReturn.current = true
    setIsProcessingPayment(true)
    setPaymentError("")

    void (async () => {
      try {
        const response = await fetch("/api/v1/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            items: pending.items,
            shipping: pending.shipping,
          }),
        })

        const payload = (await response.json()) as ApiResponse<CreateOrderData>

        if (!response.ok || !payload.success || !payload.data?.orderId) {
          setCurrentStep("payment")
          setPaymentError(payload.error || "No se pudo confirmar el pago")
          return
        }

        setOrderNumber(payload.data.orderId)
        setShippingStatusMessage(
          payload.data.shippingMessage ||
            "El vendedor recibió tu pedido y lo está preparando para envío."
        )
        clearCart()
        sessionStorage.removeItem("urbanhat_checkout_pending")
        sessionStorage.removeItem("urbanhat_checkout_shipping")
        setCurrentStep("confirmation")
      } catch {
        setCurrentStep("payment")
        setPaymentError("No se pudo confirmar el pago")
      } finally {
        setIsProcessingPayment(false)
        window.history.replaceState({}, "", "/checkout")
      }
    })()
  }, [clearCart, isLoading, user])

  const handleNextStep = async () => {
    if (currentStep === "cart" && items.length > 0) {
      setCurrentStep("shipping")
    } else if (currentStep === "shipping" && validateShipping()) {
      await persistShippingInAccount()
      setCurrentStep("payment")
    } else if (currentStep === "payment") {
      await processStripeCheckout()
    }
  }

  if (isLoading || !user || user.role !== "buyer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="Urban Hat" width={40} height={40} className="rounded-full" />
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
                      i <= stepIndex ? "text-foreground" : "text-muted-foreground"
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
                    <div key={item.id} className="flex gap-4 border border-border bg-card p-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-sm font-bold uppercase text-foreground">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm font-bold text-foreground">${item.price} MXN</p>
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
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary"
                              aria-label="Mas"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-foreground">${item.price * item.quantity} MXN</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="lg:col-span-1">
                <div className="border border-border bg-card p-6">
                  <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">Resumen</h2>
                  <div className="flex flex-col gap-3 border-b border-border pb-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Subtotal ({totalItems} {totalItems === 1 ? "articulo" : "articulos"})
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
                        Agrega ${FREE_SHIPPING_MIN - totalPrice} MXN mas para envio gratis
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-lg font-bold uppercase text-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-foreground">${grandTotal} MXN</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleNextStep()}
                    className="mt-6 w-full bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    Continuar al Envio
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === "shipping" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">Datos de Envio</h1>
              <div className="border border-border bg-card p-6">
                <div className="mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Direccion de entrega</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: "nombre", label: "Nombre", placeholder: "Tu nombre" },
                    { key: "apellido", label: "Apellido", placeholder: "Tu apellido" },
                    { key: "email", label: "Email", placeholder: "correo@ejemplo.com", type: "email", full: true },
                    { key: "telefono", label: "Telefono", placeholder: "55 1234 5678", type: "tel" },
                    { key: "calle", label: "Calle", placeholder: "Nombre de la calle" },
                    { key: "numero", label: "Numero", placeholder: "Ext / Int" },
                    { key: "colonia", label: "Colonia", placeholder: "Tu colonia" },
                    { key: "ciudad", label: "Ciudad", placeholder: "Tu ciudad" },
                    { key: "estado", label: "Estado", placeholder: "Tu estado" },
                    { key: "codigoPostal", label: "Codigo Postal", placeholder: "00000" },
                  ].map((field) => (
                    <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{field.label}</label>
                      <input
                        type={field.type || "text"}
                        value={shipping[field.key as keyof ShippingData]}
                        onChange={(e) => {
                          setShippingSaveError("")
                          setShipping({ ...shipping, [field.key]: e.target.value })
                        }}
                        placeholder={field.placeholder}
                        className={`w-full border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent ${
                          errors[field.key] ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors[field.key] && <p className="mt-1 text-xs text-destructive">{errors[field.key]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">Resumen</h2>
                <div className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-foreground">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                  <span>Envio</span>
                  <span className="text-foreground">{shippingCost === 0 ? "GRATIS" : `$${shippingCost}`}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display font-bold uppercase text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-foreground">${grandTotal} MXN</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleNextStep()}
                  disabled={isSavingAddress}
                  className="mt-6 w-full bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingAddress ? "Guardando dirección..." : "Continuar al Pago"}
                </button>
                {shippingSaveError && (
                  <p className="mt-2 text-xs text-destructive">{shippingSaveError}</p>
                )}
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

        {currentStep === "payment" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">Metodo de Pago</h1>
              <div className="border border-border bg-card p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pago seguro con Stripe (Sandbox)</span>
                </div>

                <div className="rounded border border-border bg-background p-4">
                  <p className="text-sm text-foreground">Serás redirigido a Stripe Checkout para completar el pago de forma segura.</p>
                  <p className="mt-3 text-xs text-muted-foreground">Al volver, confirmaremos el pago y registraremos tu pedido automáticamente.</p>
                </div>

                {paymentError && <p className="mt-4 text-sm text-destructive">{paymentError}</p>}

                <div className="mt-6 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Enviar a:</p>
                  <p className="text-sm text-foreground">
                    {shipping.nombre} {shipping.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipping.calle} {shipping.numero}, {shipping.colonia}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipping.ciudad}, {shipping.estado} C.P. {shipping.codigoPostal}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-border bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-foreground">Resumen</h2>
                <div className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-foreground">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                  <span>Envio</span>
                  <span className="text-foreground">{shippingCost === 0 ? "GRATIS" : `$${shippingCost}`}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display font-bold uppercase text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-foreground">${grandTotal} MXN</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleNextStep()}
                  disabled={isProcessingPayment}
                  className="mt-6 flex w-full items-center justify-center gap-2 bg-accent py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {isProcessingPayment ? "Conectando con Stripe..." : `Abrir Stripe y pagar $${grandTotal} MXN`}
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

        {currentStep === "confirmation" && (
          <div className="mx-auto max-w-lg text-center">
            <div className="border border-border bg-card p-8 lg:p-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-accent">
                <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">Pedido Confirmado</h1>
              <p className="mt-4 text-muted-foreground">Gracias por tu compra. Tu pago fue confirmado correctamente.</p>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Numero de pedido</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{orderNumber}</p>
              </div>

              <div className="mt-6 border-t border-border pt-6 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enviar a</p>
                <p className="mt-1 text-sm text-foreground">
                  {shipping.nombre} {shipping.apellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  {shipping.calle} {shipping.numero}, {shipping.colonia}
                </p>
                <p className="text-sm text-muted-foreground">
                  {shipping.ciudad}, {shipping.estado} C.P. {shipping.codigoPostal}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-6 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado del envio</p>
                <p className="mt-1 text-sm text-foreground">
                  {shippingStatusMessage || "El vendedor recibió tu pedido y ya comenzó a procesarlo."}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-6 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contacto</p>
                <p className="mt-1 text-sm text-foreground">{shipping.email}</p>
                <p className="text-sm text-muted-foreground">{shipping.telefono}</p>
              </div>

              <p className="mt-8 text-sm text-muted-foreground">
                Recibiras un email de confirmacion con los detalles de tu pedido y la informacion de rastreo.
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
