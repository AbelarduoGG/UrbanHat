import { NextResponse } from "next/server"
import { updateOrderShipping } from "@/lib/services/order.service"
import mongoose from "mongoose"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Promise en Next.js 15
) {
  try {
    const { id } = await params

    const body = await req.json()
    const { shippingStatus, trackingNumber, carrier } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      )
    }

    const order = await updateOrderShipping(id, {
      shippingStatus,
      trackingNumber,
      carrier,
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: order }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 }
    )
  }
}