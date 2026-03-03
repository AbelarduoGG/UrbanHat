import { NextRequest, NextResponse } from "next/server"
import {
  createOrder,
  getAllOrders,
  getOrdersByBuyer,
  getOrdersBySeller,
} from "@/lib/services/order.service"
import { createOrderSchema } from "@/lib/validations/order.schema"
import type { ApiResponse } from "@/lib/types"
import { getRequestAuth } from "@/lib/auth/request-auth"

/**
 * POST /api/v1/orders
 * Crea una orden (desde app móvil).
 *
 * Auth aceptada: cookie de sesión web, bearer JWT o header x-user-id (MVP Android)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
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

    const order = await createOrder(auth.userId, parsed.data)

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
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    const scope = req.nextUrl.searchParams.get("scope") || "buyer"

    if (scope === "seller") {
      if (auth.role !== "seller") {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Solo vendedores pueden consultar este listado" },
          { status: 403 }
        )
      }

      const orders = await getOrdersBySeller(auth.userId)

      return NextResponse.json<ApiResponse>(
        { success: true, data: orders },
        { status: 200 }
      )
    }

    if (scope === "admin") {
      if (auth.role !== "superadmin") {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Solo administradores pueden consultar este listado" },
          { status: 403 }
        )
      }

      const orders = await getAllOrders()

      return NextResponse.json<ApiResponse>(
        { success: true, data: orders },
        { status: 200 }
      )
    }

    const orders = await getOrdersByBuyer(auth.userId)

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
