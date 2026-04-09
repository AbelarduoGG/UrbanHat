"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Eye,
  Loader2,
  Lock,
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
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
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
  sellerId?: string
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
  trackingNumber?: string
  carrier?: string
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
  trackingNumber?: string
  carrier?: string
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

const SHIPPING_OPTIONS = [
  { value: "seller_received", label: "Pendiente de envío" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
]

const CARRIERS = ["DHL", "FedEx", "Estafeta", "UPS", "Correos de México"]
const CATEGORY_PIE_COLORS = [
  "#22c55e",
  "#86efac",
  "#34d399",
  "#10b981",
  "#4ade80",
  "#84cc16",
  "#3b82f6",
  "#a78bfa",
]

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
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSellerBlocked, setMobileSellerBlocked] = useState(false)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [salesRows, setSalesRows] = useState<SellerSaleRow[]>([])
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SellerSaleRow | null>(null)
  const [shippingForm, setShippingForm] = useState({
    shippingStatus: "seller_received",
    carrier: "",
    trackingNumber: "",
  })
  const [adminProducts, setAdminProducts] = useState<SellerProduct[]>([])
  const [adminFilters, setAdminFilters] = useState({
    sellerId: "all",
    category: "all",
    minPrice: "",
    maxPrice: "",
  })
  const [loadingSales, setLoadingSales] = useState(false)

  // ── useMemos ────────────────────────────────────────────────────────────────

  const sellerProductsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of products) {
      map[p.category] = (map[p.category] || 0) + 1
    }
    return Object.keys(map).map((k) => ({ name: k, total: map[k] }))
  }, [products])

  const sellerProductsByStatus = useMemo(() => {
    let active = 0, paused = 0, archived = 0
    for (const p of products) {
      if (p.status === "active") active++
      else if (p.status === "paused") paused++
      else archived++
    }
    return [
      { name: "Activos", total: active },
      { name: "Pausados", total: paused },
      { name: "Archivados", total: archived },
    ]
  }, [products])

  const sellerSalesByProduct = useMemo(() => {
    return salesRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.productName] = (acc[row.productName] || 0) + row.subtotal
      return acc
    }, {})
  }, [salesRows])

  const sellerSalesByProductChart = useMemo(() => {
    return Object.entries(sellerSalesByProduct).map(([name, total]) => ({
      name: name.length > 12 ? name.substring(0, 12) + "..." : name,
      total,
    }))
  }, [sellerSalesByProduct])

  const sellerProductsByStock = useMemo(() => {
    return products
      .map((p) => ({
        name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
        total: p.stock,
      }))
      .sort((a, b) => b.total - a.total)
  }, [products])

  const filteredAdminProducts = useMemo(() => {
    return adminProducts.filter((p) => {
      const matchSeller = adminFilters.sellerId === "all" || p.sellerId === adminFilters.sellerId
      const matchCategory = adminFilters.category === "all" || p.category === adminFilters.category
      const matchMin = !adminFilters.minPrice || p.price >= Number(adminFilters.minPrice)
      const matchMax = !adminFilters.maxPrice || p.price <= Number(adminFilters.maxPrice)
      return matchSeller && matchCategory && matchMin && matchMax
    })
  }, [adminProducts, adminFilters])

  const adminSellerOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const product of adminProducts) {
      if (product.sellerId && product.sellerName) {
        map.set(product.sellerId, product.sellerName)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [adminProducts])

  const productsBySeller = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of adminProducts) {
      const name = p.sellerName || "Sin vendedor"
      map[name] = (map[name] || 0) + 1
    }
    return Object.keys(map).map((k) => ({ name: k, total: map[k] }))
  }, [adminProducts])

  const productsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of adminProducts) {
      map[p.category] = (map[p.category] || 0) + 1
    }
    return Object.keys(map).map((k) => ({ name: k, total: map[k] }))
  }, [adminProducts])

  const productsByStatus = useMemo(() => {
    let active = 0, paused = 0, archived = 0
    for (const p of adminProducts) {
      if (p.status === "active") active++
      else if (p.status === "paused") paused++
      else archived++
    }
    return [
      { name: "Activos", total: active },
      { name: "Pausados", total: paused },
      { name: "Archivados", total: archived },
    ]
  }, [adminProducts])

  const salesByProduct = useMemo(() => {
    const map: Record<string, number> = {}
    for (const row of salesRows) {
      const name = row.productName || "Producto"
      map[name] = (map[name] || 0) + row.subtotal
    }
    return Object.keys(map).map((k) => ({ name: k, total: map[k] }))
  }, [salesRows])

  const sellerChartData = metrics
    ? [
        { name: "Productos", valor: metrics.totalProductos },
        { name: "Ventas", valor: metrics.totalVentas },
        { name: "Comisión", valor: Number(metrics.comision.toFixed(2)) },
        { name: "Neto", valor: Number((metrics.neto || 0).toFixed(2)) },
      ]
    : []

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const detectMobile = () => {
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : ""
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1024
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth < 768
      setIsMobile(mobile)
    }

    detectMobile()
    window.addEventListener("resize", detectMobile)
    return () => window.removeEventListener("resize", detectMobile)
  }, [])

  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await fetch("/api/v1/auth/me", { cache: "no-store" })
        const payload = (await response.json()) as ApiResponse<MeUser>
        if (!response.ok || !payload.success || !payload.data) {
          router.push("/login")
          return
        }
        if (payload.data.role !== "superadmin" && payload.data.role !== "seller") {
          router.push("/")
          return
        }

        if (isMobile && payload.data.role === "seller") {
          setMobileSellerBlocked(true)
          setIsLoading(false)
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
  }, [router, isMobile])

  useEffect(() => {
    if (me?.role === "seller" && isMobile) {
      setMobileSellerBlocked(true)
      return
    }
    setMobileSellerBlocked(false)
  }, [me, isMobile])

  useEffect(() => {
    if (!me) return
    refreshMetrics()
    if (me.role === "superadmin") {
      refreshUsers()
      refreshAdminProducts()
      refreshSellerSales()
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

  // ── API calls ───────────────────────────────────────────────────────────────

  const refreshMetrics = async () => {
    const response = await fetch("/api/v1/admin/metrics", { cache: "no-store" })
    const payload = (await response.json()) as ApiResponse<DashboardMetrics>
    if (response.ok && payload.success && payload.data) setMetrics(payload.data)
  }

  const refreshUsers = async () => {
    const response = await fetch("/api/v1/admin/users", { cache: "no-store" })
    const payload = (await response.json()) as ApiResponse<AdminUser[]>
    if (response.ok && payload.success && payload.data) setUsers(payload.data)
  }

  const refreshMyProducts = async () => {
    const response = await fetch("/api/v1/products?mine=true", { cache: "no-store" })
    const payload = (await response.json()) as ApiResponse<SellerProduct[]>
    if (response.ok && payload.success && payload.data) setProducts(payload.data)
  }

  const refreshAdminProducts = async () => {
    const response = await fetch("/api/v1/products?all=true", { cache: "no-store" })
    const payload = (await response.json()) as ApiResponse<SellerProduct[]>
    if (response.ok && payload.success && payload.data) setAdminProducts(payload.data)
  }

  const refreshSellerSales = async () => {
    try {
      setLoadingSales(true)
      const scope = me?.role === "superadmin" ? "admin" : "seller"
      const response = await fetch(`/api/v1/orders?scope=${scope}`, { cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<OrderDto[]>
      if (!response.ok || !payload.success || !payload.data) {
        setSalesRows([])
        return
      }
      const rows: SellerSaleRow[] = []
      for (const order of payload.data) {
        const sourceItems =
          me?.role === "superadmin"
            ? order.items || []
            : (order.items || []).filter(
                (item) => String(item.sellerId) === String(me?.id)
              )

        for (const item of sourceItems) {
          rows.push({
            orderId: String(order._id),
            date: new Date(order.createdAt).toLocaleDateString("es-MX"),
            buyerName: order.buyerId?.name || "Cliente",
            buyerEmail: order.buyerId?.email || "-",
            productName: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.priceAtPurchase || 0),
            subtotal: Number(item.priceAtPurchase || 0) * Number(item.quantity || 0),
            shippingStatus: order.shippingStatus || "seller_received",
            trackingNumber: order.trackingNumber ?? "",
            carrier: order.carrier ?? "",
          })
        }
      }
      setSalesRows(rows)
    } finally {
      setLoadingSales(false)
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

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
      const response = await fetch("/api/v1/uploads/image", { method: "POST", body: uploadData })
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
        body: JSON.stringify({ ...productForm, imageUrls: validImages }),
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

  const openShippingModal = (row: SellerSaleRow) => {
    setSelectedOrder(row)
    setShippingForm({
      shippingStatus: row.shippingStatus ?? "seller_received",
      carrier: row.carrier ?? "",
      trackingNumber: row.trackingNumber ?? "",
    })
    setIsShippingModalOpen(true)
  }

  const closeShippingModal = () => {
    setIsShippingModalOpen(false)
    setSelectedOrder(null)
  }

  const saveShipping = async () => {
    if (!selectedOrder) return
    setMessage("")

    if (
      shippingForm.shippingStatus === "shipped" &&
      (!shippingForm.carrier || !shippingForm.trackingNumber)
    ) {
      setMessage("Debes agregar paquetería y número de guía")
      return
    }

    const cleanData: Record<string, string> = {
      shippingStatus: shippingForm.shippingStatus,
    }
    if (shippingForm.carrier.trim() !== "") cleanData.carrier = shippingForm.carrier
    if (shippingForm.trackingNumber.trim() !== "") cleanData.trackingNumber = shippingForm.trackingNumber

    try {
      const response = await fetch(
        `/api/v1/orders/${selectedOrder.orderId}/shipping`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanData),
          cache: "no-store",
        }
      )
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        setMessage(payload.error || "Error al guardar")
        return
      }
      console.log("Shipping updated, refreshing sales...")
      await refreshSellerSales()
      console.log("Sales refreshed")
      closeShippingModal()
    } catch (err) {
      console.error(err)
      setMessage("Error al guardar")
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (mobileSellerBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground mb-4">
            Acceso Restringido
          </h1>
          <p className="text-muted-foreground mb-6">
            Como vendedor, solo puedes acceder al panel de administración desde una computadora de escritorio.
            Por favor, utiliza un dispositivo de escritorio para gestionar tus productos y pedidos.
          </p>
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando panel...
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold uppercase tracking-wider text-foreground sm:text-2xl">
              Panel de control
            </h1>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:w-auto sm:flex sm:flex-wrap sm:justify-end">
            <Link href="/cuenta" className="inline-flex min-w-0 items-center justify-center border border-border px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground min-[430px]:px-3 min-[430px]:text-xs sm:px-4 sm:tracking-wider">
              Mi perfil
            </Link>
            <Link href="/" className="inline-flex min-w-0 items-center justify-center border border-border px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground min-[430px]:px-3 min-[430px]:text-xs sm:px-4 sm:tracking-wider">
              Ir a tienda
            </Link>
            <button type="button" onClick={handleLogout} className="inline-flex min-w-0 items-center justify-center gap-2 bg-destructive px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-destructive-foreground min-[380px]:col-span-2 min-[430px]:px-3 min-[430px]:text-xs sm:col-span-1 sm:px-4 sm:tracking-wider">
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

        {/* ── SUPERADMIN ── */}
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
                    <p className="text-xs font-bold uppercase tracking-wider">Gráficas generales</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="border border-border bg-card p-4">
                      <p className="mb-2 text-xs font-bold uppercase">Productos por vendedor</p>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={productsBySeller}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="border border-border bg-card p-4">
                      <p className="mb-2 text-xs font-bold uppercase">Productos por categoría</p>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={productsByCategory}
                              dataKey="total"
                              nameKey="name"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={3}
                              labelLine={false}
                            >
                              {productsByCategory.map((_, index) => (
                                <Cell key={index} fill={CATEGORY_PIE_COLORS[index % CATEGORY_PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="border border-border bg-card p-4">
                      <p className="mb-2 text-xs font-bold uppercase">Estado de productos</p>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={productsByStatus}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#93c5fd" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="border border-border bg-card p-4">
                      <p className="mb-2 text-xs font-bold uppercase">Ventas por producto</p>
                      <div className="h-64">
                        {salesByProduct.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesByProduct}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Aún no hay ventas registradas para mostrar.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="border border-border bg-card p-4">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">Usuarios del sistema</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                El registro de vendedores es público desde &quot;Registro Vendedor&quot;; aquí solo gestionas activación y roles.
              </p>
              <div className="space-y-3">
                {users.map((user) => {
                  const uid = user.id || user._id || ""
                  const canEdit = user.role !== "superadmin"
                  return (
                    <div key={uid} className="flex flex-col gap-2 border border-border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Rol: {roleLabel(user.role)} {user.shopName ? `• ${user.shopName}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {canEdit && (
                          <>
                            <button type="button" onClick={() => handleUserPatch(uid, { isActive: !user.isActive })} className="border border-border px-3 py-1 text-xs font-bold uppercase">
                              {user.isActive ? "Desactivar" : "Activar"}
                            </button>
                            <button type="button" onClick={() => handleUserPatch(uid, { role: user.role === "seller" ? "buyer" : "seller" })} className="border border-border px-3 py-1 text-xs font-bold uppercase">
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
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">Productos del marketplace</h2>
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <select value={adminFilters.sellerId} onChange={(e) => setAdminFilters((prev) => ({ ...prev, sellerId: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider">
                  <option value="all">Todos los vendedores</option>
                  {adminSellerOptions.map((seller) => (
                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                  ))}
                </select>
                <select value={adminFilters.category} onChange={(e) => setAdminFilters((prev) => ({ ...prev, category: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider">
                  <option value="all">Todas las categorías</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input type="number" min={0} value={adminFilters.minPrice} onChange={(e) => setAdminFilters((prev) => ({ ...prev, minPrice: e.target.value }))} placeholder="Precio mínimo" className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider" />
                <input type="number" min={0} value={adminFilters.maxPrice} onChange={(e) => setAdminFilters((prev) => ({ ...prev, maxPrice: e.target.value }))} placeholder="Precio máximo" className="w-full border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider" />
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
                <p className="mt-3 text-sm text-muted-foreground">No hay productos que coincidan con los filtros aplicados.</p>
              )}
            </div>
          </>
        )}

        {/* ── SELLER ── */}
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

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="border border-border bg-card p-4">
                <p className="mb-2 text-xs font-bold uppercase">Productos por categoría</p>
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sellerProductsByCategory} dataKey="total" nameKey="name" outerRadius={80} label>
                        {sellerProductsByCategory.map((_, index) => (
                          <Cell key={index} fill={["#22c55e", "#86efac"][index % 2]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="mb-2 text-xs font-bold uppercase">Estado de productos</p>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={sellerProductsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="mb-2 text-xs font-bold uppercase">Ventas por producto</p>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={sellerSalesByProductChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="mb-2 text-xs font-bold uppercase">Stock por producto</p>
                <div className="h-64">
                  <ResponsiveContainer>
                    <AreaChart data={sellerProductsByStock}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#f97316" fill="#fdba74" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tabla de ventas y envíos */}
            <div className="mb-6 border border-border bg-card p-4">
              <h2 className="mb-4 font-display text-lg font-bold uppercase text-foreground">
                Productos vendidos y envíos
              </h2>
              {loadingSales ? (
                <p className="text-sm text-muted-foreground">Cargando ventas...</p>
              ) : salesRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no tienes ventas registradas.</p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1200px] border-collapse">
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
                        <th className="px-3 py-2">Estado</th>
                        <th className="px-3 py-2">Paquetería</th>
                        <th className="px-3 py-2">Guía</th>
                        <th className="px-3 py-2">Acción</th>
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
                          <td className="px-3 py-3">{row.carrier || "-"}</td>
                          <td className="px-3 py-3">{row.trackingNumber || "-"}</td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => openShippingModal(row)}
                              className="border border-border px-3 py-1 text-xs font-bold uppercase text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mis gorras */}
            <div className="border border-border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold uppercase text-foreground">Mis gorras</h2>
                <button type="button" onClick={openCreateProductModal} className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  <Plus className="h-4 w-4" />
                  Agregar producto
                </button>
              </div>
              {products.length === 0 && (
                <p className="text-sm text-muted-foreground">Aún no tienes productos. Crea tu primera gorra para publicarla en la tienda.</p>
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
                            <button type="button" onClick={() => setSelectedProduct(product)} className="border border-border px-3 py-1 text-xs font-bold uppercase">
                              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />Ver</span>
                            </button>
                            <button type="button" onClick={() => openEditProductModal(product)} className="border border-border px-3 py-1 text-xs font-bold uppercase">
                              Editar
                            </button>
                            {product.status !== "paused" && (
                              <button type="button" onClick={() => updateProductStatus(product.id, "paused")} className="border border-border px-3 py-1 text-xs font-bold uppercase">
                                <span className="inline-flex items-center gap-1"><Pause className="h-3 w-3" />Pausar</span>
                              </button>
                            )}
                            {product.status !== "active" && (
                              <button type="button" onClick={() => updateProductStatus(product.id, "active")} className="border border-border px-3 py-1 text-xs font-bold uppercase">
                                <span className="inline-flex items-center gap-1"><Play className="h-3 w-3" />Activar</span>
                              </button>
                            )}
                            {product.status !== "archived" && (
                              <button type="button" onClick={() => updateProductStatus(product.id, "archived")} className="flex items-center gap-1 bg-destructive px-3 py-1 text-xs font-bold uppercase text-destructive-foreground">
                                <Archive className="h-3 w-3" />Archivar
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
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  <Upload className="h-3 w-3" />
                  Ver mis productos en la tienda
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ── MODAL: Editar producto ── */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  {editingProductId ? "Editar gorra" : "Nueva gorra"}
                </h3>
                <button type="button" onClick={closeProductModal} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <input value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="Nombre" required />
                <input value={productForm.brand} onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="Marca" required />
                <textarea value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="Descripción" rows={3} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Precio</p>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" min={0} required />
                  </div>
                  <div className="flex flex-col">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock</p>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm((prev) => ({ ...prev, stock: Number(e.target.value) }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" min={0} required />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría</p>
                  <select value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value as (typeof PRODUCT_CATEGORIES)[number] }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" required>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Imágenes del producto (máximo 3)</p>
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="border border-border p-2">
                      <label className="mb-2 block text-xs text-muted-foreground">Imagen {index + 1}</label>
                      <input type="file" accept="image/*" className="mb-2 block w-full text-xs text-muted-foreground" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file, index) }} />
                      {uploadingIndex === index && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />Subiendo imagen...
                        </div>
                      )}
                      {productForm.imageUrls[index] && (
                        <div className="space-y-2">
                          <Image src={productForm.imageUrls[index]} alt={`Vista previa ${index + 1}`} width={320} height={180} className="h-28 w-full object-cover" />
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs text-foreground">Imagen cargada</p>
                            <button type="button" onClick={() => setImageAtIndex(index, "")} className="text-xs font-medium text-destructive">Quitar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 bg-accent py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  <Save className="h-4 w-4" />
                  {editingProductId ? "Guardar cambios" : "Crear gorra"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ──f MODAL: Editar envío ── */}
        {isShippingModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
            <div className="w-full max-w-md border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase text-foreground">Editar envío</h2>
                <button onClick={closeShippingModal} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Pedido: <span className="text-foreground font-bold">{selectedOrder.orderId.slice(-8)}</span>
              </p>
              <p className="text-xs text-muted-foreground">Producto: {selectedOrder.productName}</p>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado del envío</label>
                <select value={shippingForm.shippingStatus} onChange={(e) => setShippingForm((prev) => ({ ...prev, shippingStatus: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paquetería</label>
                <select value={shippingForm.carrier} onChange={(e) => setShippingForm((prev) => ({ ...prev, carrier: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground">
                  <option value="" disabled>Seleccionar paquetería</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Número de guía</label>
                <input placeholder="Ej. 1234567890" value={shippingForm.trackingNumber} onChange={(e) => setShippingForm((prev) => ({ ...prev, trackingNumber: e.target.value }))} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground" />
              </div>

              {message && <p className="text-xs text-destructive">{message}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeShippingModal} className="border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Cancelar
                </button>
                <button onClick={saveShipping} className="flex items-center gap-2 bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Ver producto ── */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold uppercase text-foreground">Detalle de gorra</h3>
                <button type="button" onClick={() => setSelectedProduct(null)} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
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
                    <Image key={`${url}-${index}`} src={url} alt={`Imagen ${index + 1}`} width={220} height={140} className="h-28 w-full object-cover" />
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
