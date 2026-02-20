"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, Save, Trash2, Upload, UserPlus } from "lucide-react"
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
  brand: string
  description: string
  price: number
  stock: number
  imageUrl: string
  imageUrls: string[]
  category: string
  sellerName: string
  isActive: boolean
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

interface ProductForm {
  name: string
  brand: string
  description: string
  price: number
  stock: number
  imageUrls: string[]
  category: string
}

const emptyProduct: ProductForm = {
  name: "",
  brand: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrls: ["", "", ""],
  category: "General",
}

function roleLabel(role: Role) {
  if (role === "superadmin") return "Administrador"
  if (role === "seller") return "Vendedor"
  return "Cliente"
}

export default function AdminPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<MeUser | null>(null)
  const [message, setMessage] = useState("")

  const [users, setUsers] = useState<AdminUser[]>([])
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  })

  const [products, setProducts] = useState<SellerProduct[]>([])
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const title = useMemo(() => {
    if (me?.role === "superadmin") return "Panel de administración"
    if (me?.role === "seller") return "Panel de vendedor"
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
    setMessage("")

    const response = await fetch("/api/v1/admin/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sellerForm),
    })

    const payload = (await response.json()) as ApiResponse

    if (!response.ok || !payload.success) {
      setMessage(payload.error || "No se pudo crear el vendedor")
      return
    }

    setSellerForm({ name: "", email: "", password: "", shopName: "" })
    setMessage("Vendedor creado correctamente")
    await refreshUsers()
  }

  const handleUserPatch = async (
    userId: string,
    data: { role?: "buyer" | "seller"; isActive?: boolean }
  ) => {
    setMessage("")
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) {
      setMessage(payload.error || "No se pudo actualizar el usuario")
      return
    }

    await refreshUsers()
  }

  const setImageAtIndex = (index: number, url: string) => {
    setProductForm((prev) => {
      const next = [...prev.imageUrls]
      next[index] = url
      return { ...prev, imageUrls: next }
    })
  }

  const uploadImage = async (file: File, index: number) => {
    setMessage("")
    setUploadingIndex(index)

    try {
      const uploadData = new FormData()
      uploadData.append("file", file)

      const response = await fetch("/api/v1/uploads/image", {
        method: "POST",
        body: uploadData,
      })

      const payload = (await response.json()) as ApiResponse<{ url: string }>

      if (!response.ok || !payload.success || !payload.data?.url) {
        setMessage(payload.error || "No se pudo subir la imagen")
        return
      }

      setImageAtIndex(index, payload.data.url)
      setMessage("Imagen subida correctamente")
    } catch {
      setMessage("No se pudo subir la imagen")
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    const validImages = productForm.imageUrls.filter(Boolean)
    if (validImages.length === 0) {
      setMessage("Debes subir al menos una imagen")
      return
    }

    const endpoint = editingProductId
      ? `/api/v1/products/${editingProductId}`
      : "/api/v1/products"

    const method = editingProductId ? "PATCH" : "POST"

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productForm,
        imageUrls: validImages,
      }),
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) {
      setMessage(payload.error || "No se pudo guardar la gorra")
      return
    }

    setProductForm(emptyProduct)
    setEditingProductId(null)
    setMessage(editingProductId ? "Gorra actualizada" : "Gorra creada")
    await refreshMyProducts()
  }

  const handleDeleteProduct = async (productId: string) => {
    setMessage("")
    const response = await fetch(`/api/v1/products/${productId}`, {
      method: "DELETE",
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) {
      setMessage(payload.error || "No se pudo eliminar la gorra")
      return
    }

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
              Ir a tienda
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

        {message && (
          <div className="mb-6 border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {message}
          </div>
        )}

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
                    setSellerForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nombre"
                  required
                />
                <input
                  value={sellerForm.email}
                  onChange={(e) =>
                    setSellerForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Correo"
                  type="email"
                  required
                />
                <input
                  value={sellerForm.password}
                  onChange={(e) =>
                    setSellerForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Contraseña"
                  type="password"
                  required
                />
                <input
                  value={sellerForm.shopName}
                  onChange={(e) =>
                    setSellerForm((prev) => ({ ...prev, shopName: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nombre de tienda"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 bg-accent py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground"
              >
                <UserPlus className="h-4 w-4" />
                Crear vendedor
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
                          Rol: {roleLabel(user.role)} {user.shopName ? `• ${user.shopName}` : ""}
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
                              {user.role === "seller"
                                ? "Pasar a cliente"
                                : "Pasar a vendedor"}
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
                    setProductForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nombre"
                  required
                />

                <input
                  value={productForm.brand}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Marca"
                  required
                />

                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Descripción"
                  rows={3}
                />

                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))
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
                    setProductForm((prev) => ({ ...prev, stock: Number(e.target.value) }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Inventario"
                  min={0}
                  required
                />

                <input
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Categoría"
                  required
                />

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Imágenes del producto (máximo 3)
                  </p>

                  {[0, 1, 2].map((index) => (
                    <div key={index} className="border border-border p-2">
                      <label className="mb-2 block text-xs text-muted-foreground">
                        Imagen {index + 1}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="mb-2 block w-full text-xs text-muted-foreground"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            uploadImage(file, index)
                          }
                        }}
                      />

                      {uploadingIndex === index && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Subiendo imagen...
                        </div>
                      )}

                      {productForm.imageUrls[index] && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-foreground">Imagen cargada</p>
                          <button
                            type="button"
                            onClick={() => setImageAtIndex(index, "")}
                            className="text-xs font-medium text-destructive"
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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

              {products.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aún no tienes productos. Crea tu primera gorra para publicarla en la tienda.
                </p>
              )}

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 border border-border p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand} • {product.category} • Stock: {product.stock} • ${product.price} MXN
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(product.id)
                          setProductForm({
                            name: product.name,
                            brand: product.brand,
                            description: product.description,
                            price: product.price,
                            stock: product.stock,
                            imageUrls: [
                              product.imageUrls[0] || "",
                              product.imageUrls[1] || "",
                              product.imageUrls[2] || "",
                            ],
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

              <div className="mt-4 border-t border-border pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <Upload className="h-3 w-3" />
                  Ver mis productos en la tienda
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
