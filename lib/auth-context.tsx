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
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  createdAt: string
}

interface StoredUser extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (data: {
    nombre: string
    apellido: string
    email: string
    password: string
  }) => { success: boolean; error?: string }
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("urban-hat-users")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem("urban-hat-users", JSON.stringify(users))
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

  const login = (email: string, password: string) => {
    const users = getStoredUsers()
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )

    if (!found) {
      return { success: false, error: "No se encontro una cuenta con ese email" }
    }

    if (found.password !== password) {
      return { success: false, error: "Contrasena incorrecta" }
    }

    const { password: _, ...userData } = found
    setUser(userData)
    sessionStorage.setItem("urban-hat-session", JSON.stringify(userData))
    return { success: true }
  }

  const register = (data: {
    nombre: string
    apellido: string
    email: string
    password: string
  }) => {
    const users = getStoredUsers()
    const exists = users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    )

    if (exists) {
      return { success: false, error: "Ya existe una cuenta con ese email" }
    }

    const newUser: StoredUser = {
      id: `user-${Date.now().toString(36)}`,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password: data.password,
      createdAt: new Date().toISOString(),
    }

    saveStoredUsers([...users, newUser])

    const { password: _, ...userData } = newUser
    setUser(userData)
    sessionStorage.setItem("urban-hat-session", JSON.stringify(userData))
    return { success: true }
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

    const users = getStoredUsers()
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, ...updates } : u
    )
    saveStoredUsers(updatedUsers)
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
