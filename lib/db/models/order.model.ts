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
  createdAt: { type: Date, default: Date.now },
})

export const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema)
