import { z } from "zod"

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1, "Cantidad mínima es 1"),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "La orden debe tener al menos un producto"),
})

export const orderShippingStatusSchema = z.enum([
  "seller_received",
  "preparing",
  "shipped",
  "delivered",
])

export const updateOrderShippingSchema = z
  .object({
    shippingStatus: orderShippingStatusSchema.optional(),
    trackingNumber: z.string().trim().min(3, "La guía es inválida").max(80).optional(),
    carrier: z.string().trim().min(2, "La paquetería es inválida").max(60).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.shippingStatus === undefined &&
      data.trackingNumber === undefined &&
      data.carrier === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No hay cambios para aplicar",
        path: ["shippingStatus"],
      })
    }

    if (data.shippingStatus === "shipped") {
      if (!data.carrier) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debes indicar la paquetería al marcar como enviado",
          path: ["carrier"],
        })
      }
      if (!data.trackingNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debes indicar el número de guía al marcar como enviado",
          path: ["trackingNumber"],
        })
      }
    }
  })

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderShippingInput = z.infer<typeof updateOrderShippingSchema>
