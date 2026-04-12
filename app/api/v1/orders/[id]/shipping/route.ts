import { NextRequest, NextResponse } from "next/server"
import { getOrderById, updateOrderShipping } from "@/lib/services/order.service"
import mongoose from "mongoose"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { updateOrderShippingSchema } from "@/lib/validations/order.schema"
import type { ApiResponse } from "@/lib/types"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    if (auth.role !== "seller" && auth.role !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No tienes permisos para actualizar envíos" },
        { status: 403 }
      )
    }

    const { id } = await params

    const parsed = updateOrderShippingSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ID inválido" },
        { status: 400 }
      )
    }

    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    if (auth.role === "seller") {
      const canUpdate = (order.items || []).some(
        (item) => String(item.sellerId) === String(auth.userId)
      )

      if (!canUpdate) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "No tienes permisos para actualizar este pedido" },
          { status: 403 }
        )
      }
    }

    const updatedOrder = await updateOrderShipping(id, parsed.data)

    if (!updatedOrder) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({ success: true, data: updatedOrder }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error("[PATCH /api/v1/orders/:id/shipping]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error del servidor" },
      { status: 500 }
    )
  }
}