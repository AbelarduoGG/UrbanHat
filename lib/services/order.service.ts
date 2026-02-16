import { connectDB } from "@/lib/db/connection"
import { Order, Product } from "@/lib/db/models"
import type { CreateOrderInput } from "@/lib/validations/order.schema"

/**
 * Crea una orden validando stock disponible.
 * Regla de negocio: restar inventario al confirmar compra.
 */
export async function createOrder(buyerId: string, input: CreateOrderInput) {
  await connectDB()

  const orderItems = []
  let totalAmount = 0

  for (const item of input.items) {
    const product = await Product.findById(item.productId)

    if (!product || !product.isActive) {
      throw new Error(`Producto ${item.productId} no encontrado o inactivo`)
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`
      )
    }

    // Restar stock
    product.stock -= item.quantity
    await product.save()

    const subtotal = product.price * item.quantity
    totalAmount += subtotal

    orderItems.push({
      productId: product._id,
      sellerId: product.sellerId,
      name: product.name,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    })
  }

  const order = new Order({
    buyerId,
    items: orderItems,
    totalAmount,
    status: "paid",
  })

  return order.save()
}

export async function getOrdersByBuyer(buyerId: string) {
  await connectDB()
  return Order.find({ buyerId }).sort({ createdAt: -1 }).lean()
}

export async function getOrdersBySeller(sellerId: string) {
  await connectDB()
  return Order.find({ "items.sellerId": sellerId })
    .sort({ createdAt: -1 })
    .lean()
}
