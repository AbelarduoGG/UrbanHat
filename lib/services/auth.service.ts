import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import bcrypt from "bcryptjs"
import type { UpdateAddressInput } from "@/lib/validations/user.schema"

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
  role?: "buyer" | "seller" | "superadmin"
  shopName?: string
  isActive?: boolean
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

export async function registerOrReuseUser(data: {
  name: string
  email: string
  password: string
  role?: "buyer" | "seller" | "superadmin"
  shopName?: string
  isActive?: boolean
}) {
  await connectDB()
  const normalizedEmail = data.email.toLowerCase().trim()
  const existing = await User.findOne({ email: normalizedEmail })

  const hashedPassword = await bcrypt.hash(data.password, 10)

  if (existing) {
    if (existing.isActive) {
      return { status: "active_exists" as const }
    }

    existing.name = data.name
    existing.email = normalizedEmail
    existing.password = hashedPassword
    existing.role = data.role || "buyer"
    existing.shopName = data.shopName
    existing.telefono = undefined
    existing.direccion = undefined
    existing.ciudad = undefined
    existing.estado = undefined
    existing.codigoPostal = undefined
    existing.isActive = data.isActive ?? true

    const user = await existing.save()
    return { status: "reused" as const, user }
  }

  const user = await createUser({
    ...data,
    email: normalizedEmail,
  })

  return { status: "created" as const, user }
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

export async function getUserWithPasswordById(id: string) {
  await connectDB()
  return User.findById(id)
}

export async function updateUserPassword(userId: string, newPassword: string) {
  await connectDB()
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  return User.findByIdAndUpdate(
    userId,
    { $set: { password: hashedPassword } },
    { new: true }
  )
}

export async function comparePassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function updateUserAddress(userId: string, address: UpdateAddressInput) {
  await connectDB()

  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        direccion: address.direccion,
        ciudad: address.ciudad,
        estado: address.estado,
        codigoPostal: address.codigoPostal,
        telefono: address.telefono,
      },
    },
    { new: true }
  )
    .select("-password")
    .lean()
}

export async function updateUserProfile(
  userId: string,
  data: { name: string; telefono?: string }
) {
  await connectDB()

  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: data.name,
        telefono: data.telefono,
      },
    },
    { new: true }
  )
    .select("-password")
    .lean()
}

export async function deactivateUserAccount(userId: string) {
  await connectDB()

  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        isActive: false,
      },
    },
    { new: true }
  )
    .select("-password")
    .lean()
}
