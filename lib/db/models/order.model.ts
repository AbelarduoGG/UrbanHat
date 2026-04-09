import mongoose, { Schema, type Document } from "mongoose"

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  name: string
  quantity: number
  priceAtPurchase: number
}

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId
  items: IOrderItem[]
  totalAmount: number
  status: "pending" | "paid" | "shipped" | "cancelled"
  paymentProvider?: "stripe"
  paymentSessionId?: string

  shippingStatus: "seller_received" | "preparing" | "shipped" | "delivered"
  trackingNumber?: string
  carrier?: string
  buyerNotification?: string
  buyerNotificationAt?: Date

  shippingAddress?: {
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

  createdAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "cancelled"],
    default: "paid",
  },

  paymentProvider: {
    type: String,
    enum: ["stripe"],
  },

  paymentSessionId: {
    type: String,
    unique: true,
    sparse: true,
  },

  trackingNumber: {
    type: String,
    default: "",
  },

  carrier: {
    type: String,
    default: "",
  },

  buyerNotification: {
    type: String,
    default: "",
  },

  buyerNotificationAt: {
    type: Date,
  },

  shippingStatus: {
    type: String,
    enum: ["seller_received", "preparing", "shipped", "delivered"],
    default: "seller_received",
  },

  shippingAddress: {
    nombre: { type: String },
    apellido: { type: String },
    email: { type: String },
    telefono: { type: String },
    calle: { type: String },
    numero: { type: String },
    colonia: { type: String },
    ciudad: { type: String },
    estado: { type: String },
    codigoPostal: { type: String },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Reuse existing model during hot reload to avoid OverwriteModelError.
export const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema)