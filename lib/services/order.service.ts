import { connectDB } from "@/lib/db/connection"
import { Order, Product } from "@/lib/db/models"
import type { CreateOrderInput } from "@/lib/validations/order.schema"

interface ShippingAddress {
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

interface CreateOrderOptions {
  paymentProvider?: "stripe"
  paymentSessionId?: string
  shippingAddress?: ShippingAddress
}

/**
 * Crea una orden validando stock disponible.
 * Regla de negocio: restar inventario al confirmar compra.
 */
export async function createOrder(
  buyerId: string,
  input: CreateOrderInput,
  options?: CreateOrderOptions
) {
  await connectDB()

  if (options?.paymentSessionId) {
    const existingOrder = await Order.findOne({
      paymentSessionId: options.paymentSessionId,
    })

    if (existingOrder) {
      return existingOrder
    }
  }

  const orderItems = []
  let totalAmount = 0

  for (const item of input.items) {
    const product = await Product.findById(item.productId)

    if (!product || !product.isActive || product.status !== "active") {
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
    paymentProvider: options?.paymentProvider,
    paymentSessionId: options?.paymentSessionId,
    shippingStatus: "seller_received",
    shippingAddress: options?.shippingAddress,
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
    .populate("buyerId", "name email")
    .sort({ createdAt: -1 })
    .lean()
}

export async function getAllOrders() {
  await connectDB()
  return Order.find({})
    .populate("buyerId", "name email")
    .sort({ createdAt: -1 })
    .lean()
}
