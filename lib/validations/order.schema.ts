import { z } from "zod"

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1, "Cantidad mínima es 1"),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "La orden debe tener al menos un producto"),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
