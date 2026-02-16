import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser positivo"),
  stock: z.number().int().min(0, "El stock debe ser positivo"),
  imageUrl: z.string().url("URL de imagen inválida"),
  category: z.string().default("General"),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
