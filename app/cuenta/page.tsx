"use client"

import React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  MapPin,
  Lock,
  LogOut,
  Save,
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type Tab = "perfil" | "pedidos" | "direccion" | "seguridad"

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

interface Order {
  id: string
  date: string
  total: number
  status: string
  shippingStatus?: string
  items: number
}

interface ApiOrder {
  _id: string
  totalAmount: number
  status: string
  shippingStatus?: string
  createdAt: string
  items: Array<{ quantity: number }>
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

function shippingStatusLabel(status?: string) {
  if (status === "seller_received") return "Pendiente de envío"
  if (status === "preparing") return "Preparando"
  if (status === "shipped") return "Enviado"
  if (status === "delivered") return "Entregado"
  return "Pendiente"
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading, logout, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("perfil")
  const [saved, setSaved] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  })

  const [addressData, setAddressData] = useState({
    calle: "",
    numero: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [accountError, setAccountError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordData, setPasswordData] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  })
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (user) {
      const parsedAddress = splitComposedAddress(user.direccion)

      setProfileData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
      })
      setAddressData({
        calle: parsedAddress.calle,
        numero: parsedAddress.numero,
        colonia: parsedAddress.colonia,
        ciudad: user.ciudad || "",
        estado: user.estado || "",
        codigoPostal: user.codigoPostal || "",
      })

      void (async () => {
        try {
          const response = await fetch("/api/v1/auth/me", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          })

          if (!response.ok) return

          const payload = await response.json()
          if (!payload?.success || !payload?.data) return

          const fullName = String(payload.data.name || "").trim()
          const parts = fullName.split(/\s+/).filter(Boolean)
          const parsedAddress = splitComposedAddress(payload.data.direccion)

          setProfileData((prev) => ({
            ...prev,
            nombre: parts[0] || prev.nombre,
            apellido: parts.slice(1).join(" ") || prev.apellido,
            email: String(payload.data.email || prev.email),
            telefono: String(payload.data.telefono || prev.telefono),
          }))

          setAddressData((prev) => ({
            ...prev,
            calle: parsedAddress.calle || prev.calle,
            numero: parsedAddress.numero || prev.numero,
            colonia: parsedAddress.colonia || prev.colonia,
            ciudad: String(payload.data.ciudad || prev.ciudad),
            estado: String(payload.data.estado || prev.estado),
            codigoPostal: String(payload.data.codigoPostal || prev.codigoPostal),
          }))
        } catch {
          return
        }
      })()
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (isLoading || !user || user.role !== "buyer") return

    void (async () => {
      try {
        setOrdersLoading(true)

        const response = await fetch("/api/v1/orders", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })

        const payload = (await response.json()) as ApiResponse<ApiOrder[]>

        if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
          setOrders([])
          return
        }

        const mappedOrders: Order[] = payload.data.map((order) => ({
          id: String(order._id),
          date: new Date(order.createdAt).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          total: Number(order.totalAmount || 0),
          status: order.status || "paid",
          shippingStatus: order.shippingStatus,
          items: Array.isArray(order.items)
            ? order.items.reduce((acc, item) => acc + Number(item.quantity || 0), 0)
            : 0,
        }))

        setOrders(mappedOrders)
      } catch {
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    })()
  }, [isLoading, user])

  const handleSaveProfile = async () => {
    try {
      setAccountError("")
      setSavingProfile(true)
      const response = await fetch("/api/v1/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: profileData.nombre,
          apellido: profileData.apellido,
          telefono: profileData.telefono,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        return
      }

      updateProfile({
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        telefono: profileData.telefono,
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // no-op
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveAddress = async () => {
    setAccountError("")

    const isSeller = user?.role === "seller"
    if (
      isSeller &&
      (!addressData.calle.trim() ||
        !addressData.numero.trim() ||
        !addressData.colonia.trim() ||
        !addressData.ciudad.trim() ||
        !addressData.estado.trim() ||
        !addressData.codigoPostal.trim())
    ) {
      setAccountError("Para vendedores la dirección completa es obligatoria")
      return
    }

    try {
      setSavingAddress(true)
      const direccionCompuesta = `${addressData.calle} ${addressData.numero}, ${addressData.colonia}`
        .replace(/\s+/g, " ")
        .trim()

      const response = await fetch("/api/v1/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direccion: direccionCompuesta,
          ciudad: addressData.ciudad,
          estado: addressData.estado,
          codigoPostal: addressData.codigoPostal,
          telefono: profileData.telefono,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        return
      }

      updateProfile({
        direccion: direccionCompuesta,
        ciudad: addressData.ciudad,
        estado: addressData.estado,
        codigoPostal: addressData.codigoPostal,
        telefono: profileData.telefono,
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // no-op
    } finally {
      setSavingAddress(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleChangePassword = async () => {
    setPasswordError("")

    if (!passwordData.actual || !passwordData.nueva || !passwordData.confirmar) {
      setPasswordError("Todos los campos de contraseña son obligatorios")
      return
    }

    if (passwordData.nueva !== passwordData.confirmar) {
      setPasswordError("La nueva contraseña y su confirmación no coinciden")
      return
    }

    try {
      setSavingPassword(true)
      const response = await fetch("/api/v1/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.actual,
          newPassword: passwordData.nueva,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        setPasswordError(payload?.error || "No se pudo cambiar la contraseña")
        return
      }

      setPasswordData({ actual: "", nueva: "", confirmar: "" })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setPasswordError("No se pudo cambiar la contraseña")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (!confirm("¿Seguro que deseas desactivar tu cuenta?")) {
      return
    }

    try {
      setDeactivating(true)
      const response = await fetch("/api/v1/account/deactivate", {
        method: "POST",
      })
      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        setPasswordError(payload?.error || "No se pudo desactivar la cuenta")
        return
      }

      await logout()
      router.push("/login")
    } catch {
      setPasswordError("No se pudo desactivar la cuenta")
    } finally {
      setDeactivating(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin border-2 border-muted-foreground border-t-accent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  const isBuyer = user.role === "buyer"
  const isSeller = user.role === "seller"

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "perfil", label: "Perfil", icon: <User className="h-4 w-4" /> },
    ...(isBuyer
      ? [{ key: "pedidos" as Tab, label: "Pedidos", icon: <Package className="h-4 w-4" /> }]
      : []),
    ...(isBuyer || isSeller
      ? [{ key: "direccion" as Tab, label: "Direccion", icon: <MapPin className="h-4 w-4" /> }]
      : []),
    { key: "seguridad", label: "Seguridad", icon: <Lock className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <div className="flex items-center gap-4">
            {(user.role === "superadmin" || user.role === "seller") && (
              <Link
                href="/admin"
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Ir al panel
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Tienda</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Welcome banner */}
        <div className="mb-8 flex items-center gap-4 border border-border bg-card p-6">
          <div className="flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground">
            <span className="font-display text-xl font-bold uppercase">
              {user.nombre[0]}
              {user.apellido[0]}
            </span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
              Hola, {user.nombre}
            </h1>
            <p className="text-sm text-muted-foreground">
              Miembro desde{" "}
              {new Date(user.createdAt).toLocaleDateString("es-MX", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Success toast */}
        {saved && (
          <div className="mb-6 flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <p className="text-xs font-medium text-green-400">
              Cambios guardados correctamente
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar tabs */}
          <div className="lg:col-span-1">
            <nav className="flex flex-row gap-1 lg:flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-1 items-center gap-2 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider transition-colors lg:flex-none ${
                    activeTab === tab.key
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile tab */}
            {activeTab === "perfil" && (
              <div className="border border-border bg-card p-6">
                <h2 className="mb-6 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Informacion Personal
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={profileData.nombre}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            nombre: e.target.value,
                          })
                        }
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={profileData.apellido}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            apellido: e.target.value,
                          })
                        }
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      El email no se puede cambiar
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={profileData.telefono}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          telefono: e.target.value,
                        })
                      }
                      placeholder="55 1234 5678"
                      className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="mt-6 flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  {savingProfile ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            )}

            {/* Orders tab */}
            {activeTab === "pedidos" && (
              <div className="border border-border bg-card p-6">
                <h2 className="mb-6 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Mis Pedidos
                </h2>
                {ordersLoading ? (
                  <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/30" />
                    <p className="font-display text-lg font-bold uppercase text-muted-foreground">
                      Sin pedidos aun
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cuando realices tu primera compra, aparecera aqui.
                    </p>
                    <Link
                      href="/#productos"
                      className="mt-6 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                    >
                      Explorar Productos
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border border-border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center bg-primary">
                            <Package className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {order.id}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            ${order.total} MXN
                          </p>
                          <p className="text-xs text-amber-400">
                            {shippingStatusLabel(order.shippingStatus)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items} articulo{order.items > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address tab */}
            {activeTab === "direccion" && (
              <div className="border border-border bg-card p-6">
                <h2 className="mb-6 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Direccion de Envio
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  {isSeller
                    ? "Como vendedor, debes registrar tu dirección completa."
                    : "Guarda tu dirección para agilizar futuras compras."}
                </p>
                {accountError && (
                  <p className="mb-4 text-xs font-medium text-destructive">{accountError}</p>
                )}
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Calle
                      </label>
                      <input
                        type="text"
                        value={addressData.calle}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            calle: e.target.value,
                          })
                        }
                        placeholder="Nombre de la calle"
                        required={isSeller}
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Numero
                      </label>
                      <input
                        type="text"
                        value={addressData.numero}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            numero: e.target.value,
                          })
                        }
                        placeholder="123"
                        required={isSeller}
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Colonia
                    </label>
                    <input
                      type="text"
                      value={addressData.colonia}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          colonia: e.target.value,
                        })
                      }
                      placeholder="Tu colonia"
                      required={isSeller}
                      className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={addressData.ciudad}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            ciudad: e.target.value,
                          })
                        }
                        placeholder="Tu ciudad"
                        required={isSeller}
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={addressData.estado}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            estado: e.target.value,
                          })
                        }
                        placeholder="Tu estado"
                        required={isSeller}
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Codigo Postal
                      </label>
                      <input
                        type="text"
                        value={addressData.codigoPostal}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            codigoPostal: e.target.value,
                          })
                        }
                        placeholder="00000"
                        required={isSeller}
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="mt-6 flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  {savingAddress ? "Guardando..." : "Guardar Direccion"}
                </button>
              </div>
            )}

            {activeTab === "seguridad" && (
              <div className="border border-border bg-card p-6">
                <h2 className="mb-6 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Cambiar contraseña
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.actual ? "text" : "password"}
                        value={passwordData.actual}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, actual: e.target.value }))
                        }
                        className="w-full border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, actual: !prev.actual }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword.actual ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
                      >
                        {showPassword.actual ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.nueva ? "text" : "password"}
                        value={passwordData.nueva}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, nueva: e.target.value }))
                        }
                        className="w-full border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, nueva: !prev.nueva }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword.nueva ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
                      >
                        {showPassword.nueva ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirmar ? "text" : "password"}
                        value={passwordData.confirmar}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, confirmar: e.target.value }))
                        }
                        className="w-full border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => ({ ...prev, confirmar: !prev.confirmar }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword.confirmar ? "Ocultar confirmación" : "Mostrar confirmación"}
                      >
                        {showPassword.confirmar ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <p className="mt-4 text-xs font-medium text-destructive">{passwordError}</p>
                )}

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="mt-6 flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90 sm:w-80"
                >
                  <Save className="h-4 w-4" />
                  {savingPassword ? "Guardando..." : "Actualizar contraseña"}
                </button>

                {user.role !== "superadmin" && (
                  <button
                    type="button"
                    onClick={handleDeactivateAccount}
                    disabled={deactivating}
                    className="mt-3 flex w-full items-center justify-center gap-2 border border-destructive px-6 py-3 text-sm font-bold uppercase tracking-widest text-destructive sm:w-80"
                  >
                    {deactivating ? "Desactivando..." : "Desactivar cuenta"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
