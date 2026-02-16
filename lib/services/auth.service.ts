import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"

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
  const user = new User({
    ...data,
    email: data.email.toLowerCase(),
    // TODO: bcrypt.hash(data.password, 10)
  })
  return user.save()
}

export async function getUserById(id: string) {
  await connectDB()
  return User.findById(id).select("-password").lean()
}
