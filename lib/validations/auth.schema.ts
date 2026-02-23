import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["buyer", "seller"]).optional().default("buyer"),
  shopName: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
})
  .superRefine((data, ctx) => {
    if (data.role !== "seller") return

    if (!data.shopName || data.shopName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shopName"],
        message: "El nombre de tienda es obligatorio para vendedores",
      })
    }
    if (!data.telefono || data.telefono.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["telefono"],
        message: "El teléfono es obligatorio para vendedores",
      })
    }
    if (!data.direccion || data.direccion.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["direccion"],
        message: "La dirección es obligatoria para vendedores",
      })
    }
    if (!data.ciudad || data.ciudad.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ciudad"],
        message: "La ciudad es obligatoria para vendedores",
      })
    }
    if (!data.estado || data.estado.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["estado"],
        message: "El estado es obligatorio para vendedores",
      })
    }
    if (!data.codigoPostal || data.codigoPostal.trim().length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["codigoPostal"],
        message: "El código postal es obligatorio para vendedores",
      })
    }
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
