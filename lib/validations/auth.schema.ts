import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.literal("buyer").optional().default("buyer"),
  shopName: z.string().optional(),
})

export const createSellerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  shopName: z.string().min(2, "El nombre de tienda es obligatorio"),
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, "La contraseña actual debe tener al menos 6 caracteres"),
  newPassword: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateSellerInput = z.infer<typeof createSellerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
