import { NextRequest, NextResponse } from "next/server"
import { createOrder, getOrdersByBuyer } from "@/lib/services/order.service"
import { createOrderSchema } from "@/lib/validations/order.schema"
import type { ApiResponse } from "@/lib/types"

/**
 * POST /api/v1/orders
 * Crea una orden (desde app móvil).
 *
 * Header requerido: x-user-id (ID del comprador)
 * TODO: Reemplazar por autenticación real (JWT o NextAuth)
 */
export async function POST(req: NextRequest) {
  try {
    const buyerId = req.headers.get("x-user-id")

    if (!buyerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación (x-user-id)" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const order = await createOrder(buyerId, parsed.data)

    return NextResponse.json<ApiResponse>(
      { success: true, data: { orderId: order._id.toString() } },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor"
    console.error("[POST /api/v1/orders]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 400 }
    )
  }
}

/**
 * GET /api/v1/orders
 * Obtiene órdenes del comprador autenticado.
 */
export async function GET(req: NextRequest) {
  try {
    const buyerId = req.headers.get("x-user-id")

    if (!buyerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación (x-user-id)" },
        { status: 401 }
      )
    }

    const orders = await getOrdersByBuyer(buyerId)

    return NextResponse.json<ApiResponse>(
      { success: true, data: orders },
      { status: 200 }
    )
  } catch (error) {
    console.error("[GET /api/v1/orders]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
