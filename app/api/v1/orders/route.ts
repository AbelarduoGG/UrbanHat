import { NextRequest, NextResponse } from "next/server"
import {
  createOrder,
  getAllOrders,
  getOrdersByBuyer,
  getOrdersBySeller,
} from "@/lib/services/order.service"
import { createOrderSchema } from "@/lib/validations/order.schema"
import { getRequestAuth } from "@/lib/auth/request-auth"

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
        { success: false, error: "Solo compradores pueden crear órdenes" },
        { status: 403 }
      )
    }

    const parsed = createOrderSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const order = await createOrder(auth.userId, parsed.data)

    return NextResponse.json<ApiResponse>(
      { success: true, data: { orderId: order._id.toString() } },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
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

export async function GET(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    const scope = req.nextUrl.searchParams.get("scope") || "buyer"

    if (scope === "seller") {
      if (auth.role !== "seller") {
        return NextResponse.json(
          { success: false, error: "Solo vendedores pueden consultar este listado" },
          { status: 403 }
        )
      }
      const orders = await getOrdersBySeller(auth.userId)
      return NextResponse.json({ success: true, data: orders }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
    }

    if (scope === "admin") {
      if (auth.role !== "superadmin") {
        return NextResponse.json(
          { success: false, error: "Solo administradores pueden consultar este listado" },
          { status: 403 }
        )
      }
      const orders = await getAllOrders()
      return NextResponse.json({ success: true, data: orders }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
    }

    const orders = await getOrdersByBuyer(auth.userId)
    return NextResponse.json({ success: true, data: orders }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error("[GET /api/v1/orders]", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}