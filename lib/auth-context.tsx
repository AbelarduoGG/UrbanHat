"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role?: "superadmin" | "seller" | "buyer"
  isActive?: boolean
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  createdAt: string
}

interface UserApi {
  id: string
  name: string
  email: string
  role: "superadmin" | "seller" | "buyer"
  shopName?: string
  isActive: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    nombre: string
    apellido: string
    email: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

function parseName(name: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    return { nombre: "", apellido: "" }
  }

  const parts = trimmed.split(/\s+/)
  const nombre = parts[0] ?? ""
  const apellido = parts.slice(1).join(" ")

  return { nombre, apellido }
}

function mapApiUserToAuthUser(user: UserApi): User {
  const { nombre, apellido } = parseName(user.name)

  return {
    id: user.id,
    nombre,
    apellido,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = sessionStorage.getItem("urban-hat-session")
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch {
        sessionStorage.removeItem("urban-hat-session")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const payload = (await response.json()) as ApiResponse<UserApi>

      if (!response.ok || !payload.success || !payload.data) {
        return { success: false, error: payload.error || "Error al iniciar sesion" }
      }

      const userData = mapApiUserToAuthUser(payload.data)
      setUser(userData)
      sessionStorage.setItem("urban-hat-session", JSON.stringify(userData))

      return { success: true }
    } catch {
      return { success: false, error: "No se pudo conectar con el servidor" }
    }
  }

  const register = async (data: {
    nombre: string
    apellido: string
    email: string
    password: string
  }) => {
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.nombre} ${data.apellido}`.trim(),
          email: data.email,
          password: data.password,
          role: "buyer",
        }),
      })

      const payload = (await response.json()) as ApiResponse<UserApi>

      if (!response.ok || !payload.success || !payload.data) {
        return { success: false, error: payload.error || "Error al crear la cuenta" }
      }

      const userData = mapApiUserToAuthUser(payload.data)
      setUser(userData)
      sessionStorage.setItem("urban-hat-session", JSON.stringify(userData))

      return { success: true }
    } catch {
      return { success: false, error: "No se pudo conectar con el servidor" }
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("urban-hat-session")
  }

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    sessionStorage.setItem("urban-hat-session", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
