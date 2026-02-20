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
  LogOut,
  Save,
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type Tab = "perfil" | "pedidos" | "direccion"

interface Order {
  id: string
  date: string
  total: number
  status: string
  items: number
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isLoading, logout, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("perfil")
  const [saved, setSaved] = useState(false)
  const [orders] = useState<Order[]>([])

  const [profileData, setProfileData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  })

  const [addressData, setAddressData] = useState({
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (user) {
      setProfileData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
      })
      setAddressData({
        direccion: user.direccion || "",
        ciudad: user.ciudad || "",
        estado: user.estado || "",
        codigoPostal: user.codigoPostal || "",
      })
    }
  }, [user, isLoading, router])

  const handleSaveProfile = () => {
    updateProfile({
      nombre: profileData.nombre,
      apellido: profileData.apellido,
      telefono: profileData.telefono,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSaveAddress = async () => {
    try {
      const response = await fetch("/api/v1/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direccion: addressData.direccion,
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
        direccion: addressData.direccion,
        ciudad: addressData.ciudad,
        estado: addressData.estado,
        codigoPostal: addressData.codigoPostal,
        telefono: profileData.telefono,
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // no-op
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "perfil", label: "Perfil", icon: <User className="h-4 w-4" /> },
    { key: "pedidos", label: "Pedidos", icon: <Package className="h-4 w-4" /> },
    { key: "direccion", label: "Direccion", icon: <MapPin className="h-4 w-4" /> },
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
                  className="mt-6 flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </div>
            )}

            {/* Orders tab */}
            {activeTab === "pedidos" && (
              <div className="border border-border bg-card p-6">
                <h2 className="mb-6 font-display text-lg font-bold uppercase tracking-wider text-foreground">
                  Mis Pedidos
                </h2>
                {orders.length === 0 ? (
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
                  Guarda tu direccion para agilizar futuras compras.
                </p>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Direccion completa
                    </label>
                    <input
                      type="text"
                      value={addressData.direccion}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          direccion: e.target.value,
                        })
                      }
                      placeholder="Calle, numero, colonia"
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
                        className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="mt-6 flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  Guardar Direccion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
