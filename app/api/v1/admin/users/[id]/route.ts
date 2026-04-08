import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/db"
import { Order } from "@/lib/db/models"

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  await connectDB()

  const id = context.params.id // 👈 CAMBIO CLAVE

  console.log("BACKEND ID:", id) // 👈 DEBUG

  const body = await req.json()

  const { shippingStatus, carrier, trackingNumber } = body

  try {
    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    // actualizar campos
    if (shippingStatus) order.shippingStatus = shippingStatus
    if (carrier) order.carrier = carrier
    if (trackingNumber) order.trackingNumber = trackingNumber

    await order.save()

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al actualizar envío" },
      { status: 500 }
    )
  }
}