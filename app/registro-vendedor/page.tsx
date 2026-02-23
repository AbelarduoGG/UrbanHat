"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export default function SellerRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.shopName.trim()) {
      setError("Todos los campos son obligatorios")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/v1/auth/register-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as ApiResponse<{ message?: string }>

      if (!response.ok || !payload.success) {
        setError(payload.error || "No se pudo registrar el vendedor")
        return
      }

      setMessage(payload.data?.message || "Registro enviado para revisión")
      setTimeout(() => router.push("/login"), 1800)
    } catch {
      setError("No se pudo registrar el vendedor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-20">
      <div className="border border-border bg-card p-6">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          Registro de vendedor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu cuenta se crea desactivada y un administrador debe activarla.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
            placeholder="Nombre completo"
            required
          />
          <input
            value={form.shopName}
            onChange={(e) => setForm((p) => ({ ...p, shopName: e.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
            placeholder="Nombre de tienda"
            required
          />
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
            placeholder="Correo"
            type="email"
            required
          />
          <input
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
            placeholder="Contraseña"
            type="password"
            required
          />

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          {message && <p className="text-xs font-medium text-green-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent py-3 text-xs font-bold uppercase tracking-wider text-accent-foreground"
          >
            {loading ? "Enviando..." : "Enviar registro"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
