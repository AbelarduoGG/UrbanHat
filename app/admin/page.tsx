"use client"

import React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Lock,
  LogOut,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Search,
} from "lucide-react"
import { defaultProducts, categories, type Product } from "@/lib/products"

const ADMIN_USER = "admin"
const ADMIN_PASS = "urban2026"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("Todas")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    image: "",
    category: "Snapback",
    description: "",
    stock: 0,
    isNew: false,
    isBestseller: false,
  })

  useEffect(() => {
    const stored = localStorage.getItem("urban-hat-products")
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(defaultProducts)
      }
    }
    const session = sessionStorage.getItem("urban-hat-admin")
    if (session === "true") setIsAuthenticated(true)
  }, [])

  const saveProducts = (updated: Product[]) => {
    setProducts(updated)
    localStorage.setItem("urban-hat-products", JSON.stringify(updated))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true)
      sessionStorage.setItem("urban-hat-admin", "true")
      setLoginError("")
    } else {
      setLoginError("Credenciales incorrectas")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("urban-hat-admin")
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) return

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id ? { ...p, ...formData } : p
      )
      saveProducts(updated)
      setEditingProduct(null)
    } else if (isAddingNew) {
      const newId = Math.max(...products.map((p) => p.id), 0) + 1
      const newProduct: Product = { id: newId, ...formData }
      saveProducts([...products, newProduct])
      setIsAddingNew(false)
    }

    setFormData({
      name: "",
      price: 0,
      image: "",
      category: "Snapback",
      description: "",
      stock: 0,
      isNew: false,
      isBestseller: false,
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsAddingNew(false)
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      stock: product.stock,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
    })
  }

  const handleDeleteProduct = (id: number) => {
    const updated = products.filter((p) => p.id !== id)
    saveProducts(updated)
    setDeleteConfirm(null)
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingProduct(null)
    setFormData({
      name: "",
      price: 0,
      image: "/caps/cap-black.jpg",
      category: "Snapback",
      description: "",
      stock: 0,
      isNew: false,
      isBestseller: false,
    })
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setIsAddingNew(false)
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      filterCategory === "Todas" || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const lowStock = products.filter((p) => p.stock < 10).length

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo.jpeg"
              alt="Urban Hat"
              width={80}
              height={80}
              className="rounded-full"
            />
            <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-widest text-foreground">
              Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panel de Administracion
            </p>
          </div>

          <form onSubmit={handleLogin} className="border border-border bg-card p-6">
            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="admin"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Contrasena"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="mb-4 text-xs text-destructive">{loginError}</p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 bg-accent py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Lock className="h-4 w-4" />
              Ingresar
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Urban Hat"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <span className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
                Urban Hat
              </span>
              <span className="ml-2 border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver Tienda
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center bg-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Productos
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {products.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center bg-primary">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Stock Total
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {totalStock}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center bg-primary">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Valor Inventario
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Stock Bajo
              </p>
              <p className="font-display text-2xl font-bold text-destructive">
                {lowStock}
              </p>
            </div>
          </div>
        </div>

        {/* Edit/Add form */}
        {(editingProduct || isAddingNew) && (
          <div className="mb-8 border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cancelar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Precio (MXN)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: Number(e.target.value),
                    })
                  }
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {categories
                    .filter((c) => c !== "Todas")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Imagen (ruta)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="/caps/nueva-gorra.jpg"
                />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) =>
                      setFormData({ ...formData, isNew: e.target.checked })
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  Nuevo
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isBestseller: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  Bestseller
                </label>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Descripcion
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Descripcion del producto..."
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSaveProduct}
                className="flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="border border-border px-6 py-3 text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </button>
        </div>

        {/* Products table */}
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Producto
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Precio
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Stock
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {product.name}
                        </p>
                        <div className="flex gap-1">
                          {product.isNew && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-accent">
                              Nuevo
                            </span>
                          )}
                          {product.isBestseller && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                              Bestseller
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">
                    ${product.price}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => {
                        const newStock = Number(e.target.value)
                        const updated = products.map((p) =>
                          p.id === product.id ? { ...p, stock: newStock } : p
                        )
                        saveProducts(updated)
                      }}
                      className="w-20 border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {product.stock === 0 ? (
                      <span className="inline-block bg-destructive/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        Agotado
                      </span>
                    ) : product.stock < 10 ? (
                      <span className="inline-block bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                        Bajo
                      </span>
                    ) : (
                      <span className="inline-block bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                        En Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-2 py-1 text-[10px] font-bold uppercase text-destructive hover:underline"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground hover:underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(product.id)}
                          className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
