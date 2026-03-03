"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Archive,
  BarChart3,
  Eye,
  Loader2,
  LogOut,
  Pause,
  Plus,
  Play,
  Save,
  Upload,
  X,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useAuth } from "@/lib/auth-context"
import { PRODUCT_CATEGORIES } from "@/lib/constants/product-categories"

type Role = "superadmin" | "seller" | "buyer"
type ProductStatus = "active" | "paused" | "archived"

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
  status: ProductStatus
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

interface DashboardMetrics {
  scope: "superadmin" | "seller"
  totalUsuarios?: number
  totalProductos: number
  totalVentas: number
  montoVendido: number
  comision: number
  neto?: number
  tasaComision: number
}

interface OrderItemDto {
  productId: string
  sellerId: string
  name: string
  quantity: number
  priceAtPurchase: number
}

interface OrderDto {
  _id: string
  buyerId?: {
    _id?: string
    name?: string
    email?: string
  }
  items: OrderItemDto[]
  totalAmount: number
  status: string
  shippingStatus?: "seller_received" | "preparing" | "shipped" | "delivered"
  createdAt: string
}

interface SellerSaleRow {
  orderId: string
  date: string
  buyerName: string
  buyerEmail: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  shippingStatus: string
}

interface ProductForm {
  name: string
  brand: string
  description: string
  price: number
  stock: number
  imageUrls: string[]
  category: (typeof PRODUCT_CATEGORIES)[number]
}

const emptyProduct: ProductForm = {
  name: "",
  brand: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrls: ["", "", ""],
  category: "Snapback",
}

function roleLabel(role: Role) {
  if (role === "superadmin") return "Administrador"
  if (role === "seller") return "Vendedor"
  return "Cliente"
}

function statusLabel(status: ProductStatus) {
  if (status === "active") return "Activo"
  if (status === "paused") return "Pausado"
  return "Archivado"
}

function shippingStatusLabel(status?: string) {
  if (status === "seller_received") return "Pendiente de envío"
  if (status === "preparing") return "Preparando"
  if (status === "shipped") return "Enviado"
  if (status === "delivered") return "Entregado"
  return "Pendiente"
}

function normalizeProductCategory(value: string): (typeof PRODUCT_CATEGORIES)[number] {
  return PRODUCT_CATEGORIES.includes(value as (typeof PRODUCT_CATEGORIES)[number])
    ? (value as (typeof PRODUCT_CATEGORIES)[number])
    : "Snapback"
}

export default function AdminPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<MeUser | null>(null)
  const [message, setMessage] = useState("")

  const [users, setUsers] = useState<AdminUser[]>([])
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [salesRows, setSalesRows] = useState<SellerSaleRow[]>([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [adminProducts, setAdminProducts] = useState<SellerProduct[]>([])
  const [adminFilters, setAdminFilters] = useState({
    sellerId: "all",
    category: "all",
    minPrice: "",
    maxPrice: "",
  })

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

    refreshMetrics()

    if (me.role === "superadmin") {
      refreshUsers()
      refreshAdminProducts()
      return
    }

    if (me.role === "seller") {
      refreshMyProducts()
      refreshSellerSales()
    }
  }, [me])

  useEffect(() => {
    const hasOpenModal = isProductModalOpen || Boolean(selectedProduct)

    if (!hasOpenModal) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isProductModalOpen, selectedProduct])

  const refreshMetrics = async () => {
    const response = await fetch("/api/v1/admin/metrics")
    const payload = (await response.json()) as ApiResponse<DashboardMetrics>
    if (response.ok && payload.success && payload.data) {
      setMetrics(payload.data)
    }
  }

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

  const refreshAdminProducts = async () => {
    const response = await fetch("/api/v1/products?all=true")
    const payload = (await response.json()) as ApiResponse<SellerProduct[]>

    if (response.ok && payload.success && payload.data) {
      setAdminProducts(payload.data)
    }
  }

  const refreshSellerSales = async () => {
    try {
      setLoadingSales(true)

      const response = await fetch("/api/v1/orders?scope=seller")
      const payload = (await response.json()) as ApiResponse<OrderDto[]>

      if (!response.ok || !payload.success || !payload.data) {
        setSalesRows([])
        return
      }

      const rows: SellerSaleRow[] = []

      for (const order of payload.data) {
        const sellerItems = (order.items || []).filter(
          (item) => String(item.sellerId) === String(me?.id)
        )

        for (const item of sellerItems) {
          rows.push({
            orderId: order._id,
            date: new Date(order.createdAt).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            buyerName: order.buyerId?.name || "Cliente",
            buyerEmail: order.buyerId?.email || "-",
            productName: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.priceAtPurchase || 0),
            subtotal: Number(item.priceAtPurchase || 0) * Number(item.quantity || 0),
            shippingStatus: order.shippingStatus || "seller_received",
          })
        }
      }

      setSalesRows(rows)
    } finally {
      setLoadingSales(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
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

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    setEditingProductId(null)
    setProductForm(emptyProduct)
  }

  const openCreateProductModal = () => {
    setEditingProductId(null)
    setProductForm(emptyProduct)
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (product: SellerProduct) => {
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
      category: normalizeProductCategory(product.category),
    })
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    const validImages = productForm.imageUrls.filter(Boolean)
    if (validImages.length === 0) {
      setMessage("Debes subir al menos una imagen")
      return
    }

    try {
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

      setMessage(editingProductId ? "Gorra actualizada" : "Gorra creada")
      closeProductModal()
      await refreshMyProducts()
      await refreshMetrics()
    } catch {
      setMessage("No se pudo guardar la gorra")
    }
  }

  const updateProductStatus = async (productId: string, status: ProductStatus) => {
    setMessage("")

    const response = await fetch(`/api/v1/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    const payload = (await response.json()) as ApiResponse
    if (!response.ok || !payload.success) {
      setMessage(payload.error || "No se pudo actualizar estado")
      return
    }

    await refreshMyProducts()
    await refreshMetrics()
  }

  const adminChartData = metrics
    ? [
        { name: "Usuarios", valor: metrics.totalUsuarios || 0 },
        { name: "Productos", valor: metrics.totalProductos },
        { name: "Ventas", valor: metrics.totalVentas },
        { name: "Comisión", valor: Number(metrics.comision.toFixed(2)) },
      ]
    : []

  const sellerChartData = metrics
    ? [
        { name: "Productos", valor: metrics.totalProductos },
        { name: "Ventas", valor: metrics.totalVentas },
        { name: "Comisión", valor: Number(metrics.comision.toFixed(2)) },
        { name: "Neto", valor: Number((metrics.neto || 0).toFixed(2)) },
      ]
    : []

  const adminSellerOptions = useMemo(() => {
    const map = new Map<string, string>()

    for (const product of adminProducts) {
      if (product.sellerId && product.sellerName) {
        map.set(product.sellerId, product.sellerName)
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [adminProducts])

  const filteredAdminProducts = useMemo(() => {
    const min = adminFilters.minPrice ? Number(adminFilters.minPrice) : null
    const max = adminFilters.maxPrice ? Number(adminFilters.maxPrice) : null

    return adminProducts.filter((product) => {
      const matchesSeller =
        adminFilters.sellerId === "all" || product.sellerId === adminFilters.sellerId
      const matchesCategory =
        adminFilters.category === "all" || product.category === adminFilters.category
      const matchesMin = min === null || product.price >= min
      const matchesMax = max === null || product.price <= max

      return matchesSeller && matchesCategory && matchesMin && matchesMax
    })
  }, [adminProducts, adminFilters])

  if (isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando panel...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between border border-border bg-card p-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/cuenta"
              className="border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Mi perfil
            </Link>
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
          <>
            {metrics && (
              <>
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Usuarios activos</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">{metrics.totalUsuarios || 0}</p>
                  </div>
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Productos</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">{metrics.totalProductos}</p>
                  </div>
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Ventas</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">{metrics.totalVentas}</p>
                  </div>
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Comisión plataforma</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">${metrics.comision.toFixed(2)} MXN</p>
                  </div>
                </div>

                <div className="mb-6 border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">Gráfica general</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={adminChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="valor" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            <div className="border border-border bg-card p-4">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Usuarios del sistema
              </h2>
              <p className="mb-4 text-xs text-muted-foreground">
                El registro de vendedores es público desde &quot;Registro Vendedor&quot;; aquí solo gestionas activación y roles.
              </p>
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
                              {user.role === "seller" ? "Pasar a cliente" : "Pasar a vendedor"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 border border-border bg-card p-4">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Productos del marketplace
              </h2>

              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <select
                  value={adminFilters.sellerId}
                  onChange={(e) =>
                    setAdminFilters((prev) => ({ ...prev, sellerId: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider"
                >
                  <option value="all">Todos los vendedores</option>
                  {adminSellerOptions.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>

                <select
                  value={adminFilters.category}
                  onChange={(e) =>
                    setAdminFilters((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider"
                >
                  <option value="all">Todas las categorías</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={0}
                  value={adminFilters.minPrice}
                  onChange={(e) =>
                    setAdminFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                  }
                  placeholder="Precio mínimo"
                  className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider"
                />

                <input
                  type="number"
                  min={0}
                  value={adminFilters.maxPrice}
                  onChange={(e) =>
                    setAdminFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                  }
                  placeholder="Precio máximo"
                  className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider"
                />
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2">Vendedor</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border/70 text-sm text-foreground">
                        <td className="px-3 py-3 font-bold">{product.name}</td>
                        <td className="px-3 py-3">{product.sellerName}</td>
                        <td className="px-3 py-3">{product.category}</td>
                        <td className="px-3 py-3">{statusLabel(product.status)}</td>
                        <td className="px-3 py-3">{product.stock}</td>
                        <td className="px-3 py-3">${product.price} MXN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAdminProducts.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  No hay productos que coincidan con los filtros aplicados.
                </p>
              )}
            </div>
          </>
        )}

        {me.role === "seller" && (
          <>
            {metrics && (
              <>
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Mis productos</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">{metrics.totalProductos}</p>
                  </div>
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Mis ventas</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">{metrics.totalVentas}</p>
                  </div>
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Monto vendido</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">${metrics.montoVendido.toFixed(2)} MXN</p>
                  </div>
                  <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Comisión / neto</p>
                    <p className="mt-1 text-sm font-bold text-foreground">${metrics.comision.toFixed(2)} / ${Number(metrics.neto || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-6 border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">Gráfica de desempeño</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sellerChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="valor" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            <div className="mb-6 border border-border bg-card p-4">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Productos vendidos y envíos
              </h2>

              {loadingSales ? (
                <p className="text-sm text-muted-foreground">Cargando ventas...</p>
              ) : salesRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no tienes ventas registradas.
                </p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-2">Pedido</th>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Cliente</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2">Cantidad</th>
                        <th className="px-3 py-2">Precio</th>
                        <th className="px-3 py-2">Subtotal</th>
                        <th className="px-3 py-2">Envío</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesRows.map((row, index) => (
                        <tr key={`${row.orderId}-${row.productName}-${index}`} className="border-b border-border/70 text-sm text-foreground">
                          <td className="px-3 py-3 font-bold">{row.orderId.slice(-8)}</td>
                          <td className="px-3 py-3">{row.date}</td>
                          <td className="px-3 py-3">{row.buyerName}</td>
                          <td className="px-3 py-3">{row.buyerEmail}</td>
                          <td className="px-3 py-3">{row.productName}</td>
                          <td className="px-3 py-3">{row.quantity}</td>
                          <td className="px-3 py-3">${row.unitPrice.toFixed(2)}</td>
                          <td className="px-3 py-3">${row.subtotal.toFixed(2)}</td>
                          <td className="px-3 py-3">{shippingStatusLabel(row.shippingStatus)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border border-border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold uppercase text-foreground">
                  Mis gorras
                </h2>
                <button
                  type="button"
                  onClick={openCreateProductModal}
                  className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Agregar producto
                </button>
              </div>

              {products.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aún no tienes productos. Crea tu primera gorra para publicarla en la tienda.
                </p>
              )}

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2">Producto</th>
                      <th className="px-3 py-2">Marca</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Precio</th>
                      <th className="px-3 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border/70 text-sm text-foreground">
                        <td className="px-3 py-3 font-bold">{product.name}</td>
                        <td className="px-3 py-3">{product.brand}</td>
                        <td className="px-3 py-3">{product.category}</td>
                        <td className="px-3 py-3">{statusLabel(product.status)}</td>
                        <td className="px-3 py-3">{product.stock}</td>
                        <td className="px-3 py-3">${product.price} MXN</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="border border-border px-3 py-1 text-xs font-bold uppercase"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Ver
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditProductModal(product)}
                              className="border border-border px-3 py-1 text-xs font-bold uppercase"
                            >
                              Editar
                            </button>

                            {product.status !== "paused" && (
                              <button
                                type="button"
                                onClick={() => updateProductStatus(product.id, "paused")}
                                className="border border-border px-3 py-1 text-xs font-bold uppercase"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Pause className="h-3 w-3" />
                                  Pausar
                                </span>
                              </button>
                            )}

                            {product.status !== "active" && (
                              <button
                                type="button"
                                onClick={() => updateProductStatus(product.id, "active")}
                                className="border border-border px-3 py-1 text-xs font-bold uppercase"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  Activar
                                </span>
                              </button>
                            )}

                            {product.status !== "archived" && (
                              <button
                                type="button"
                                onClick={() => updateProductStatus(product.id, "archived")}
                                className="flex items-center gap-1 bg-destructive px-3 py-1 text-xs font-bold uppercase text-destructive-foreground"
                              >
                                <Archive className="h-3 w-3" />
                                Archivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          </>
        )}

        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  {editingProductId ? "Editar gorra" : "Nueva gorra"}
                </h3>
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3">
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

                <div className="grid gap-3 md:grid-cols-2">
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
                </div>

                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      category: e.target.value as (typeof PRODUCT_CATEGORIES)[number],
                    }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                  required
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

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
                        <div className="space-y-2">
                          <Image
                            src={productForm.imageUrls[index]}
                            alt={`Vista previa ${index + 1}`}
                            width={320}
                            height={180}
                            className="h-28 w-full object-cover"
                          />
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 bg-accent py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground"
                >
                  <Save className="h-4 w-4" />
                  {editingProductId ? "Guardar cambios" : "Crear gorra"}
                </button>
              </form>
            </div>
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  Detalle de gorra
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Nombre: {selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">Marca: {selectedProduct.brand}</p>
                  <p className="text-sm text-muted-foreground">Categoría: {selectedProduct.category}</p>
                  <p className="text-sm text-muted-foreground">Estado: {statusLabel(selectedProduct.status)}</p>
                  <p className="text-sm text-muted-foreground">Precio: ${selectedProduct.price} MXN</p>
                  <p className="text-sm text-muted-foreground">Stock: {selectedProduct.stock}</p>
                  <p className="text-sm text-muted-foreground">Descripción: {selectedProduct.description || "Sin descripción"}</p>
                </div>

                <div className="grid max-h-72 grid-cols-2 gap-2 overflow-auto">
                  {selectedProduct.imageUrls.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sin imágenes</p>
                  )}
                  {selectedProduct.imageUrls.map((url, index) => (
                    <Image
                      key={`${url}-${index}`}
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      width={220}
                      height={140}
                      className="h-28 w-full object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
