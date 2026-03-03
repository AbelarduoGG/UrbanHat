import { z } from "zod"
import { PRODUCT_CATEGORIES } from "@/lib/constants/product-categories"

export const createProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  brand: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser positivo"),
  stock: z.number().int().min(0, "El stock debe ser positivo"),
  imageUrls: z
    .array(z.string().url("URL de imagen inválida"))
    .min(1, "Debes subir al menos 1 imagen")
    .max(3, "Máximo 3 imágenes por producto"),
  category: z.enum(PRODUCT_CATEGORIES).default("Snapback"),
  status: z.enum(["active", "paused", "archived"]).optional(),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
