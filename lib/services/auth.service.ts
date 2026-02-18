import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import bcrypt from "bcryptjs"

interface AuthUserRecord {
  _id: { toString: () => string }
  name: string
  email: string
  password: string
  role: "superadmin" | "seller" | "buyer"
  shopName?: string
  isActive: boolean
  createdAt: Date
}

/**
 * Busca un usuario por email.
 * NOTA: La lógica de hash de contraseñas (bcrypt) se implementará
 * cuando se integre NextAuth o autenticación real.
 */
export async function findUserByEmail(email: string) {
  await connectDB()
  return User.findOne({ email: email.toLowerCase() }).lean()
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: "buyer" | "seller"
  shopName?: string
}) {
  await connectDB()
  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = new User({
    ...data,
    email: data.email.toLowerCase(),
    password: hashedPassword,
  })
  return user.save()
}

export async function validateUserCredentials(email: string, password: string) {
  await connectDB()
  const user = await User.findOne({ email: email.toLowerCase() }).lean<AuthUserRecord>()

  if (!user) {
    return null
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return null
  }

  return user
}

export async function getUserById(id: string) {
  await connectDB()
  return User.findById(id).select("-password").lean()
}
