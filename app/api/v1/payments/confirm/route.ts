import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createOrder } from "@/lib/services/order.service"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { createOrderSchema } from "@/lib/validations/order.schema"
import type { ApiResponse } from "@/lib/types"

const shippingSchema = {
  required: [
    "nombre",
    "apellido",
    "email",
    "telefono",
    "calle",
    "numero",
    "colonia",
    "ciudad",
    "estado",
    "codigoPostal",
  ] as const,
}

interface ConfirmBody {
  sessionId: string
  items: Array<{ productId: string; quantity: number }>
  shipping: {
    nombre: string
    apellido: string
    email: string
    telefono: string
    calle: string
    numero: string
    colonia: string
    ciudad: string
    estado: string
    codigoPostal: string
  }
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_KEY || process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("Configura STRIPE_KEY en variables de entorno")
  }

  return new Stripe(secretKey)
}

function isValidShipping(shipping: ConfirmBody["shipping"] | undefined) {
  if (!shipping) return false
  return shippingSchema.required.every((field) => {
    const value = shipping[field]
    return typeof value === "string" && value.trim().length > 0
  })
}

export async function POST(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    if (auth.role !== "buyer") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Solo compradores pueden confirmar pagos" },
        { status: 403 }
      )
    }

    const body = (await req.json()) as ConfirmBody

    if (!body.sessionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Falta sessionId" },
        { status: 400 }
      )
    }

    const parsedOrder = createOrderSchema.safeParse({ items: body.items })
    if (!parsedOrder.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsedOrder.error.errors[0].message },
        { status: 400 }
      )
    }

    if (!isValidShipping(body.shipping)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Datos de envío incompletos" },
        { status: 400 }
      )
    }

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(body.sessionId)

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "El pago aún no está confirmado" },
        { status: 400 }
      )
    }

    const order = await createOrder(auth.userId, parsedOrder.data, {
      paymentProvider: "stripe",
      paymentSessionId: body.sessionId,
      shippingAddress: body.shipping,
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          orderId: order._id.toString(),
          shippingStatus: "seller_received",
          shippingMessage:
            "Tu pago fue aprobado y el vendedor ya recibió tu pedido para procesarlo.",
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    console.error("[POST /api/v1/payments/confirm]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
