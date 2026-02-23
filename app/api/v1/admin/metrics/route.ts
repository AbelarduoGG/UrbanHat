import { NextRequest, NextResponse } from "next/server"
import { getRequestAuth } from "@/lib/auth/request-auth"
import { connectDB } from "@/lib/db/connection"
import { Order, Product, User } from "@/lib/db/models"
import type { ApiResponse } from "@/lib/types"

const COMMISSION_RATE = 0.1

export async function GET(req: NextRequest) {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Se requiere autenticación" },
        { status: 401 }
      )
    }

    if (auth.role !== "superadmin" && auth.role !== "seller") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 403 }
      )
    }

    await connectDB()

    if (auth.role === "superadmin") {
      const [totalUsuarios, totalProductos, orders] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: true }),
        Order.find({ status: { $in: ["paid", "shipped"] } }).lean(),
      ])

      const totalVentas = orders.length
      const montoVendido = orders.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0)
      const comision = montoVendido * COMMISSION_RATE

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            scope: "superadmin",
            totalUsuarios,
            totalProductos,
            totalVentas,
            montoVendido,
            comision,
            tasaComision: COMMISSION_RATE,
          },
        },
        { status: 200 }
      )
    }

    const [totalProductos, orders] = await Promise.all([
      Product.countDocuments({ sellerId: auth.userId, isActive: true }),
      Order.find({ "items.sellerId": auth.userId, status: { $in: ["paid", "shipped"] } }).lean(),
    ])

    let montoVendido = 0

    for (const order of orders) {
      const items = Array.isArray(order.items) ? order.items : []
      for (const item of items) {
        if (String(item.sellerId) !== auth.userId) continue
        const quantity = Number(item.quantity || 0)
        const price = Number(item.priceAtPurchase || 0)
        montoVendido += quantity * price
      }
    }

    const totalVentas = orders.length
    const comision = montoVendido * COMMISSION_RATE
    const neto = montoVendido - comision

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          scope: "seller",
          totalProductos,
          totalVentas,
          montoVendido,
          comision,
          neto,
          tasaComision: COMMISSION_RATE,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[GET /api/v1/admin/metrics]", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
