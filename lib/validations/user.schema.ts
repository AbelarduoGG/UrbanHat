import { z } from "zod"

export const updateAddressSchema = z.object({
  direccion: z.string().min(5, "La dirección es obligatoria"),
  ciudad: z.string().min(2, "La ciudad es obligatoria"),
  estado: z.string().min(2, "El estado es obligatorio"),
  codigoPostal: z
    .string()
    .min(4, "El código postal es obligatorio")
    .max(10, "Código postal inválido"),
  telefono: z.string().min(8, "Teléfono inválido").optional(),
})

export const adminUpdateUserSchema = z.object({
  role: z.enum(["buyer", "seller"]).optional(),
  isActive: z.boolean().optional(),
})

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>
