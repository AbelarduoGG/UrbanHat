"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Save, Trash2, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type Role = "superadmin" | "seller" | "buyer"

interface MeUser {
  id: string
  name: string
  email: string
  role: Role
  shopName?: string
  isActive: boolean
}

interface AdminUser {
  _id?: string
  id?: string
  name: string
  email: string
  role: Role
  shopName?: string
  isActive: boolean
  createdAt?: string
}

interface SellerProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
  isActive: boolean
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrl: "",
  category: "General",
}

export default function AdminPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<MeUser | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  })

  const [products, setProducts] = useState<SellerProduct[]>([])
  const [productForm, setProductForm] = useState(emptyProduct)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const title = useMemo(() => {
    if (me?.role === "superadmin") return "Panel Superadmin"
    if (me?.role === "seller") return "Panel Vendedor"
    return "Panel"
  }, [me?.role])

  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await fetch("/api/v1/auth/me")
        const payload = (await response.json()) as ApiResponse<MeUser>

        if (!response.ok || !payload.success || !payload.data) {
          router.push("/login")
          return
        }

        if (payload.data.role !== "superadmin" && payload.data.role !== "seller") {
          router.push("/")
          return
        }

        setMe(payload.data)
      } catch {
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadMe()
  }, [router])

  useEffect(() => {
    if (!me) return

    if (me.role === "superadmin") {
      refreshUsers()
    }

    if (me.role === "seller") {
      refreshMyProducts()
    }
  }, [me])

  const refreshUsers = async () => {
    const response = await fetch("/api/v1/admin/users")
    const payload = (await response.json()) as ApiResponse<AdminUser[]>
    if (response.ok && payload.success && payload.data) {
      setUsers(payload.data)
    }
  }

  const refreshMyProducts = async () => {
    const response = await fetch("/api/v1/products?mine=true")
    const payload = (await response.json()) as ApiResponse<SellerProduct[]>
    if (response.ok && payload.success && payload.data) {
      setProducts(payload.data)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch("/api/v1/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sellerForm),
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) return

    setSellerForm({ name: "", email: "", password: "", shopName: "" })
    await refreshUsers()
  }

  const handleUserPatch = async (
    userId: string,
    data: { role?: "buyer" | "seller"; isActive?: boolean }
  ) => {
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) return

    await refreshUsers()
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    const endpoint = editingProductId
      ? `/api/v1/products/${editingProductId}`
      : "/api/v1/products"

    const method = editingProductId ? "PATCH" : "POST"

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) return

    setProductForm(emptyProduct)
    setEditingProductId(null)
    await refreshMyProducts()
  }

  const handleDeleteProduct = async (productId: string) => {
    const response = await fetch(`/api/v1/products/${productId}`, {
      method: "DELETE",
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) return

    await refreshMyProducts()
  }

  if (isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando panel...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between border border-border bg-card p-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Tienda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-destructive px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        {me.role === "superadmin" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <form
              onSubmit={handleCreateSeller}
              className="border border-border bg-card p-4 lg:col-span-1"
            >
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Crear vendedor
              </h2>
              <div className="space-y-3">
                <input
                  value={sellerForm.name}
                  onChange={(e) =>
                    setSellerForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nombre"
                  required
                />
                <input
                  value={sellerForm.email}
                  onChange={(e) =>
                    setSellerForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Email"
                  type="email"
                  required
                />
                <input
                  value={sellerForm.password}
                  onChange={(e) =>
                    setSellerForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Password"
                  type="password"
                  required
                />
                <input
                  value={sellerForm.shopName}
                  onChange={(e) =>
                    setSellerForm((p) => ({ ...p, shopName: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Tienda"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 bg-accent py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground"
              >
                <UserPlus className="h-4 w-4" />
                Crear seller
              </button>
            </form>

            <div className="border border-border bg-card p-4 lg:col-span-2">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Usuarios del sistema
              </h2>
              <div className="space-y-3">
                {users.map((user) => {
                  const uid = user.id || user._id || ""
                  const canEdit = user.role !== "superadmin"
                  return (
                    <div
                      key={uid}
                      className="flex flex-col gap-2 border border-border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Rol: {user.role} {user.shopName ? `• ${user.shopName}` : ""}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUserPatch(uid, {
                                  isActive: !user.isActive,
                                })
                              }
                              className="border border-border px-3 py-1 text-xs font-bold uppercase"
                            >
                              {user.isActive ? "Desactivar" : "Activar"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUserPatch(uid, {
                                  role: user.role === "seller" ? "buyer" : "seller",
                                })
                              }
                              className="border border-border px-3 py-1 text-xs font-bold uppercase"
                            >
                              {user.role === "seller" ? "Pasar a buyer" : "Pasar a seller"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {me.role === "seller" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <form
              onSubmit={handleSaveProduct}
              className="border border-border bg-card p-4 lg:col-span-1"
            >
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                {editingProductId ? "Editar gorra" : "Nueva gorra"}
              </h2>

              <div className="space-y-3">
                <input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nombre"
                  required
                />
                <input
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Descripción"
                />
                <input
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="URL imagen (Cloudinary)"
                  required
                />
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, price: Number(e.target.value) }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Precio"
                  min={0}
                  required
                />
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Stock"
                  min={0}
                  required
                />
                <input
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, category: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Categoría"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 bg-accent py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground"
              >
                <Save className="h-4 w-4" />
                {editingProductId ? "Guardar cambios" : "Crear gorra"}
              </button>
            </form>

            <div className="border border-border bg-card p-4 lg:col-span-2">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Mis gorras
              </h2>

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 border border-border p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category} • Stock: {product.stock} • ${product.price} MXN
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(product.id)
                          setProductForm({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            stock: product.stock,
                            imageUrl: product.imageUrl,
                            category: product.category,
                          })
                        }}
                        className="border border-border px-3 py-1 text-xs font-bold uppercase"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center gap-1 bg-destructive px-3 py-1 text-xs font-bold uppercase text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
