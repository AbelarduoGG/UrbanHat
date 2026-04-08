import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Order } from "@/lib/db/models"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB()

  const { id } = params
  const body = await req.json()

  const { shippingStatus, carrier, trackingNumber } = body

  try {
    // 🔥 BUSCAR POR orderNumber (o fallback a _id)
    const order = await Order.findOne({
      $or: [
        { orderNumber: id }, // 👈 NUEVO
        { _id: id }          // 👈 fallback
      ]
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    if (shippingStatus) order.shippingStatus = shippingStatus
    if (carrier) order.carrier = carrier
    if (trackingNumber) order.trackingNumber = trackingNumber

    await order.save()

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("ERROR PATCH SHIPPING:", error)

    return NextResponse.json(
      { success: false, error: "Error al actualizar envío" },
      { status: 500 }
    )
  }
}